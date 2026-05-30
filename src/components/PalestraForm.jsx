import { useState, useEffect, useMemo } from "react";
import { X as XIcon } from "@phosphor-icons/react";
import Select from 'react-select';
import axios from 'axios';

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
    const [data, setData] = useState(objeto?.data || "");
    const [inicio, setInicio] = useState(objeto?.inicio ? objeto.inicio.split('T')[1].substring(0,5) : "");
    const [fim, setFim] = useState(objeto?.fim ? objeto.fim.split('T')[1].substring(0,5) : "");

    const [competenciasDisponiveis, setCompetenciasDisponiveis] = useState([]);
    const [palestrantesDisponiveis, setPalestrantesDisponiveis] = useState([]);
    const [eventosDisponiveis, setEventosDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, palRes, eveRes] = await Promise.all([
                    api.get('/competencias'),
                    api.get('/palestrantes'),
                    api.get('/eventos')
                ]);

                setCompetenciasDisponiveis(compRes.data.map(c => ({ value: c.id, label: c.nome })));
                setPalestrantesDisponiveis(palRes.data.map(p => ({ value: p.id, label: p.nome })));
                setEventosDisponiveis(eveRes.data.map(e => ({ value: e.id, label: e.titulo, date: e.dataInicio })));
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
            eventoId: eventoId || null, // ID opcional
            data,
            inicio: startDateTime,
            fim: endDateTime
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
                                const apenasNomes = selectedOptions.map(option => option.label);
                                const apenasIds = selectedOptions.map(option => option.value);
                                setCompetencias(apenasNomes);
                                setCompetenciaIds(apenasIds);
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
                        <label className="text-base font-secondary font-semibold text-primary">Evento</label>
                        <Select
                            isLoading={loading}
                            options={eventosDisponiveis}
                            value={eventosDisponiveis.find(e => e.value === eventoId)}
                            unstyled
                            isClearable={true}
                            onChange={(selectedOption) => {
                                setEvento(selectedOption ? selectedOption.label : "");
                                setEventoId(selectedOption ? selectedOption.value : "");
                                if (selectedOption && selectedOption.date) {
                                    setData(selectedOption.date);
                                }
                            }}
                            placeholder="Selecione um evento"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
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
        
                    <button type="submit" className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer shadow-lg shadow-accent/10`}>Revisar</button>
            </form>
    );
};

export default PalestraForm;
