import { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import axios from 'axios';
import CategoriaEventoSelect from "./CategoriaEventoSelect";
import { categoriaSelectClasses } from "../utils/selectStyles";

const EventoForm = ({ setObjeto, setEtapa, objeto }) => {
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
    const [dataInicio, setDataInicio] = useState(objeto?.dataInicio || "");
    const [dataFim, setDataFim] = useState(objeto?.dataFim || "");
    const [categoriaId, setCategoriaId] = useState(objeto?.categoriaId || "");
    const [modalidade, setModalidade] = useState(objeto?.modalidade || "");
    const [banner, setBanner] = useState(objeto?.banner || "");
    const [patrocinadorId, setPatrocinadorId] = useState(objeto?.patrocinadorId || "");
    const [assinanteIds, setAssinanteIds] = useState(objeto?.assinanteIds || []);
    const [patrocinadoresDisponiveis, setPatrocinadoresDisponiveis] = useState([]);
    const [assinantesDisponiveis, setAssinantesDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const modalidades = [
        { value: "PRESENCIAL", label: "Presencial" },
        { value: "ONLINE", label: "Online" },
        { value: "HIBRIDO", label: "Híbrido" }
    ];

    useEffect(() => {
        const formatPatrocinadorLabel = (patrocinador) => (
            patrocinador.nomeFantasia ||
            patrocinador.razaoSocial ||
            patrocinador.nomeCompleto ||
            patrocinador.email ||
            `Patrocinador #${patrocinador.id}`
        );

        const fetchOptions = async () => {
            try {
                const [patrocinadoresResponse, assinantesResponse] = await Promise.all([
                    api.get('/patrocinadores'),
                    api.get('/assinantes')
                ]);

                setPatrocinadoresDisponiveis(
                    patrocinadoresResponse.data.map(p => ({ value: p.id, label: formatPatrocinadorLabel(p) }))
                );
                setAssinantesDisponiveis(
                    assinantesResponse.data.map(a => ({ value: a.id, label: `${a.nome} - ${a.cargo}` }))
                );
            } catch (error) {
                console.error("Erro ao buscar opções do evento:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, [api]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (assinanteIds.length === 0) return;

        setObjeto({
            titulo,
            descricao,
            dataInicio,
            dataFim: dataFim || null,
            categoriaId: categoriaId || null,
            modalidade: modalidade || null,
            banner,
            patrocinadorId: patrocinadorId || null,
            assinanteIds
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-5 -mt-5 min-h-[68vh]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Título do Evento*</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        placeholder="Nome do evento" 
                        value={titulo} 
                        onChange={(e) => setTitulo(e.target.value)} 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Descrição <span className="font-normal text-primary/40">(opcional)</span></label>
                    <textarea
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 min-h-28"
                        placeholder="Resumo do evento"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Data de Início*</label>
                        <input
                            required
                            type="date"
                            className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Data de Fim <span className="font-normal text-primary/40">(opcional)</span></label>
                        <input
                            type="date"
                            className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Categoria <span className="font-normal text-primary/40">(opcional)</span></label>
                        <CategoriaEventoSelect
                            api={api}
                            value={categoriaId}
                            onChange={setCategoriaId}
                            classNames={categoriaSelectClasses}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Modalidade <span className="font-normal text-primary/40">(opcional)</span></label>
                        <Select
                            options={modalidades}
                            value={modalidades.find(m => m.value === modalidade)}
                            unstyled
                            isClearable
                            onChange={(selectedOption) => setModalidade(selectedOption ? selectedOption.value : "")}
                            placeholder="Selecione uma modalidade"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Banner <span className="font-normal text-primary/40">(opcional)</span></label>
                        <input
                            type="url"
                            className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80"
                            placeholder="https://site.com/imagem.jpg"
                            value={banner}
                            onChange={(e) => setBanner(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Patrocinador <span className="font-normal text-primary/40">(opcional)</span></label>
                        <Select
                            isLoading={loading}
                            options={patrocinadoresDisponiveis}
                            value={patrocinadoresDisponiveis.find(p => p.value === patrocinadorId)}
                            unstyled
                            isClearable
                            onChange={(selectedOption) => setPatrocinadorId(selectedOption ? selectedOption.value : "")}
                            placeholder="Selecione um patrocinador"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Assinantes*</label>
                    <Select
                        isMulti
                        isLoading={loading}
                        options={assinantesDisponiveis}
                        value={assinantesDisponiveis.filter(a => assinanteIds.includes(a.value))}
                        unstyled
                        onChange={(selectedOptions) => setAssinanteIds((selectedOptions || []).map(option => option.value))}
                        placeholder="Selecione quem assina os certificados deste evento"
                        classNames={{
                            control: () => "basic-multi-select bg-accent/30 px-4 py-2 min-h-15 border border-accent/20 rounded-xl text-primary text-sm",
                            menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                            placeholder: () => "text-primary/75 font-secondary text-sm",
                            option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`,
                            multiValue: () => "bg-accent/60 rounded-lg px-2 py-1 mr-1 mb-1",
                            multiValueLabel: () => "text-primary font-secondary text-xs",
                            multiValueRemove: () => "text-primary/50 hover:text-error ml-1"
                        }}
                    />
                    {assinanteIds.length === 0 && (
                        <span className="text-xs font-secondary text-primary/45">Selecione pelo menos um assinante.</span>
                    )}
                </div>
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer shadow-lg shadow-accent/10">
                Revisar
            </button>
        </form>
    );
};

export default EventoForm;
