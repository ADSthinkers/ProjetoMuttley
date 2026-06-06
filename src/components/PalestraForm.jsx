import { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import axios from 'axios';
import { PALESTRA_STATUS } from "../utils/palestraStatus";

const modalidades = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "ONLINE", label: "Online" },
    { value: "HIBRIDO", label: "Híbrido" }
];

const tiposPalestra = [
    "PALESTRA", "WORKSHOP", "CURSO", "SEMINARIO", "CONGRESSO",
    "SEMANA_ACADEMICA", "TREINAMENTO", "EXTENSAO", "HACKATHON",
    "PROJETO", "MONITORIA", "ORGANIZACAO"
].map((tipo) => ({ value: tipo, label: formatarEnum(tipo) }));

function formatarEnum(value) {
    if (!value) return "";
    return value.toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

const formatPatrocinadorLabel = (patrocinador) => (
    patrocinador.nomeFantasia ||
    patrocinador.razaoSocial ||
    patrocinador.nomeCompleto ||
    patrocinador.email ||
    `Patrocinador #${patrocinador.id}`
);

const PalestraForm = ({ setObjeto, setEtapa, objeto }) => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': dbKEY,
            'Accept': 'application/json',
        }
    }), [dbURL, dbKEY]);

    const [titulo, setTitulo] = useState(objeto?.titulo || "");
    const [descricao, setDescricao] = useState(objeto?.descricao || "");
    const [palestrantes, setPalestrantes] = useState(objeto?.palestrantes || []);
    const [palestranteIds, setPalestranteIds] = useState(objeto?.palestranteIds || []);
    const [competencias, setCompetencias] = useState(objeto?.competencias || []);
    const [competenciaIds, setCompetenciaIds] = useState(objeto?.competenciaIds || []);
    const [evento, setEvento] = useState(objeto?.evento || "");
    const [eventoId, setEventoId] = useState(objeto?.eventoId || "");
    const [local, setLocal] = useState(objeto?.local || "");
    const [localId, setLocalId] = useState(objeto?.localId || "");
    const [data, setData] = useState(objeto?.data || "");
    const [inicio, setInicio] = useState(objeto?.inicio ? objeto.inicio.split('T')[1].substring(0,5) : "");
    const [fim, setFim] = useState(objeto?.fim ? objeto.fim.split('T')[1].substring(0,5) : "");
    const [tipo, setTipo] = useState(objeto?.tipo || "");
    const [modalidade, setModalidade] = useState(objeto?.modalidade || "");
    const [vagas, setVagas] = useState(objeto?.vagas || "");
    const [banner, setBanner] = useState(objeto?.banner || "");
    const [patrocinadorId, setPatrocinadorId] = useState(objeto?.patrocinadorId || "");
    const [status, setStatus] = useState(objeto?.status || "PENDENTE");
    const [formError, setFormError] = useState("");

    const [competenciasDisponiveis, setCompetenciasDisponiveis] = useState([]);
    const [palestrantesDisponiveis, setPalestrantesDisponiveis] = useState([]);
    const [eventosDisponiveis, setEventosDisponiveis] = useState([]);
    const [locaisDisponiveis, setLocaisDisponiveis] = useState([]);
    const [patrocinadoresDisponiveis, setPatrocinadoresDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, palRes, eveRes, locaisRes, patrocinadoresRes] = await Promise.all([
                    api.get('/competencias'),
                    api.get('/palestrantes'),
                    api.get('/eventos'),
                    api.get('/locais'),
                    api.get('/patrocinadores')
                ]);

                setCompetenciasDisponiveis(compRes.data.map(c => ({ value: c.id, label: c.nome })));
                setPalestrantesDisponiveis(palRes.data.map(p => ({ value: p.id, label: p.nome })));
                setEventosDisponiveis(eveRes.data.map(e => ({ value: e.id, label: e.titulo, date: e.dataInicio })));
                setLocaisDisponiveis(locaisRes.data.map(l => ({ value: l.id, label: l.nome, capacidade: l.capacidade })));
                setPatrocinadoresDisponiveis(
                    patrocinadoresRes.data.map(p => ({ value: p.id, label: formatPatrocinadorLabel(p) }))
                );
            } catch (error) {
                console.error("Erro ao buscar dados para o formulário:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (palestranteIds.length === 0) {
            setFormError("Selecione pelo menos um palestrante.");
            return;
        }

        if (competenciaIds.length === 0) {
            setFormError("Selecione pelo menos uma competência.");
            return;
        }

        if (!eventoId) {
            setFormError("Selecione um evento para cadastrar a palestra.");
            return;
        }

        if (!localId) {
            setFormError("Selecione um local para cadastrar a palestra.");
            return;
        }

        setFormError("");
        
        // Combinando data com horários para LocalDateTime esperado no back
        const startDateTime = `${data}T${inicio}:00`;
        const endDateTime = `${data}T${fim}:00`;

        setObjeto({
            ...objeto,
            titulo,
            descricao,
            palestrantes, // Nomes
            palestranteIds, // IDs
            competenciaIds, // IDs
            competencias, // Nomes para exibição na revisão
            evento, // Nome
            eventoId: eventoId || null,
            local,
            localId,
            data,
            inicio: startDateTime,
            fim: endDateTime,
            tipo: tipo || null,
            modalidade: modalidade || null,
            vagas: vagas ? Number(vagas) : null,
            banner,
            patrocinadorId: patrocinadorId || null,
            status
        });
        setEtapa(3);
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    {/* Título */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Título da palestra*</label>
                        <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={titulo} onChange={(e) => {setTitulo(e.target.value);}} required/>
                    </div>
        
                    {/* Descrição */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Descrição da palestra*</label>
                        <textarea className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 min-h-30 text-sm" value={descricao} onChange={(e) => {setDescricao(e.target.value);}} required/>
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Classificação</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Tipo">
                            <Select
                                isLoading={loading}
                                options={tiposPalestra}
                                value={tiposPalestra.find(t => t.value === tipo)}
                                unstyled
                                isClearable
                                onChange={(selectedOption) => setTipo(selectedOption ? selectedOption.value : "")}
                                placeholder="Selecione o tipo"
                                classNames={selectClasses}
                            />
                        </Field>

                        <Field label="Modalidade">
                            <Select
                                isLoading={loading}
                                options={modalidades}
                                value={modalidades.find(m => m.value === modalidade)}
                                unstyled
                                isClearable
                                onChange={(selectedOption) => setModalidade(selectedOption ? selectedOption.value : "")}
                                placeholder="Selecione a modalidade"
                                classNames={selectClasses}
                            />
                        </Field>

                        <Field label="Status">
                            <Select
                                options={PALESTRA_STATUS}
                                value={PALESTRA_STATUS.find(s => s.value === status)}
                                unstyled
                                onChange={(selectedOption) => setStatus(selectedOption ? selectedOption.value : "PENDENTE")}
                                placeholder="Selecione o status"
                                classNames={selectClasses}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Local / Sala" required>
                            <Select
                                isLoading={loading}
                                options={locaisDisponiveis}
                                value={locaisDisponiveis.find(l => l.value === localId)}
                                unstyled
                                isClearable
                                onChange={(selectedOption) => {
                                    setLocal(selectedOption ? selectedOption.label : "");
                                    setLocalId(selectedOption ? selectedOption.value : "");
                                    setVagas(selectedOption?.capacidade ?? "");
                                    setFormError("");
                                }}
                                placeholder="Selecione um local"
                                classNames={selectClasses}
                            />
                        </Field>

                        <Field label="Capacidade">
                            <input
                                min="1"
                                type="number"
                                className={inputClass}
                                placeholder="Capacidade da palestra"
                                value={vagas}
                                onChange={(e) => setVagas(e.target.value)}
                            />
                        </Field>

                        <Field label="Banner">
                            <input
                                type="url"
                                className={inputClass}
                                placeholder="https://site.com/imagem.jpg"
                                value={banner}
                                onChange={(e) => setBanner(e.target.value)}
                            />
                        </Field>
                    </div>

                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Palestrantes e competências</div>
        
                    {/* Palestrantes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Palestrantes*</label>
                        <Select
                            isMulti
                            isLoading={loading}
                            options={palestrantesDisponiveis}
                            value={palestrantesDisponiveis.filter(p => palestranteIds.includes(p.value))}
                            unstyled
                            onChange={(selectedOptions) => {
                                const opcoes = selectedOptions || [];
                                const apenasNomes = opcoes.map(option => option.label);
                                const apenasIds = opcoes.map(option => option.value);
                                setPalestrantes(apenasNomes);
                                setPalestranteIds(apenasIds);
                                setFormError("");
                            }}
                            placeholder="Selecione os palestrantes"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary",
                                multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
                                multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] rounded-xl mt-2 text-primary text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                            required
                        />
                    </div>
        
                    {/* Competências */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Competências*</label>
                        <Select
                            isMulti
                            isLoading={loading}
                            options={competenciasDisponiveis}
                            value={competenciasDisponiveis.filter(c => competenciaIds.includes(c.value))}
                            unstyled
                            onChange={(selectedOptions) => {
                                const opcoes = selectedOptions || [];
                                const apenasNomes = opcoes.map(option => option.label);
                                const apenasIds = opcoes.map(option => option.value);
                                setCompetencias(apenasNomes);
                                setCompetenciaIds(apenasIds);
                                setFormError("");
                            }}
                            placeholder="Selecione as competências"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary",
                                multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
                                multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] rounded-xl mt-2 text-primary text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                            required
                        />
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Evento</div>
        
                    {/* Evento */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Evento*</label>
                        <Select
                            isLoading={loading}
                            options={eventosDisponiveis}
                            value={eventosDisponiveis.find(e => e.value === eventoId)}
                            unstyled
                            isClearable={true}
                            onChange={(selectedOption) => {
                                setEvento(selectedOption ? selectedOption.label : "");
                                setEventoId(selectedOption ? selectedOption.value : "");
                                setFormError("");
                                if (selectedOption && selectedOption.date) {
                                    setData(selectedOption.date);
                                }
                            }}
                            placeholder="Selecione um evento"
                            classNames={selectClasses}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Patrocinador</label>
                        <Select
                            isLoading={loading}
                            options={patrocinadoresDisponiveis}
                            value={patrocinadoresDisponiveis.find(p => p.value === patrocinadorId)}
                            unstyled
                            isClearable
                            onChange={(selectedOption) => setPatrocinadorId(selectedOption ? selectedOption.value : "")}
                            placeholder="Selecione um patrocinador"
                            classNames={selectClasses}
                        />
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Data e hora</div>
        
                    {/* Data */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Data da palestra*</label>
                        <input type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" value={data} onChange={(e) => setData(e.target.value)} required />
                    </div>
                    
                    {/* Horários */}
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-base font-secondary font-semibold text-primary">Horário de início*</label>
                            <input type="time" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setInicio(e.target.value);}} value={inicio} required />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-base font-secondary font-semibold text-primary">Horário de fim*</label>
                            <input type="time" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setFim(e.target.value);}} value={fim} required/>
                        </div>
                    </div>

                    {formError && (
                        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-secondary">
                            {formError}
                        </div>
                    )}
        
                    <button type="submit" className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer shadow-lg shadow-accent/10`}>Revisar</button>
            </form>
    );
};

const inputClass = "w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm";

const selectClasses = {
    control: () => "basic-multi-select bg-accent/30 px-4 py-2 min-h-15 border border-accent/20 rounded-xl text-primary text-sm",
    multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
    multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
    menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
    placeholder: () => "text-primary/75 font-secondary text-sm",
    option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
};

const Field = ({ label, children, required = false }) => (
    <div className="flex flex-col gap-2">
        <label className="text-base font-secondary font-semibold text-primary">
            {label}{required ? "*" : <span className="font-normal text-primary/40"> (opcional)</span>}
        </label>
        {children}
    </div>
);

export default PalestraForm;
