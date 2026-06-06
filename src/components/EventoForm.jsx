import { useState, useEffect, useMemo } from "react";
import Select from 'react-select';
import axios from 'axios';

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
    const [categoria, setCategoria] = useState(objeto?.categoria || "");
    const [modalidade, setModalidade] = useState(objeto?.modalidade || "");
    const [banner, setBanner] = useState(objeto?.banner || "");
    const [patrocinadorId, setPatrocinadorId] = useState(objeto?.patrocinadorId || "");
    const [patrocinadoresDisponiveis, setPatrocinadoresDisponiveis] = useState([]);
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
                const patrocinadoresResponse = await api.get('/patrocinadores');

                setPatrocinadoresDisponiveis(
                    patrocinadoresResponse.data.map(p => ({ value: p.id, label: formatPatrocinadorLabel(p) }))
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
        setObjeto({
            titulo,
            descricao,
            dataInicio,
            dataFim: dataFim || null,
            categoria,
            modalidade: modalidade || null,
            banner,
            patrocinadorId: patrocinadorId || null
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
                        <input
                            type="text"
                            className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80"
                            placeholder="Ex: Semana acadêmica"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
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
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer shadow-lg shadow-accent/10">
                Revisar
            </button>
        </form>
    );
};

export default EventoForm;
