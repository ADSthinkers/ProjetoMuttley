import Sidebar from "../components/Sidebar";
import ParticipanteCard from "../components/ParticipanteCard";
import EventoPalestraCard from "../components/EventoPalestraCard";
import PalestranteCard from "../components/PalestranteCard";
import { useState, useEffect, useMemo } from "react";
import { 
    CaretDownIcon, 
    MagnifyingGlassIcon, 
    LecternIcon, 
    CalendarStarIcon, 
    UserIcon, 
    XIcon,
    MicrophoneStageIcon 
} from "@phosphor-icons/react";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';

const Buscar = () => {
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

    const [todosItens, setTodosItens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setLoading(false);
                return;
            }
            try { 
                const [participantesRes, palestrantesRes, eventosRes, palestrasRes] = await Promise.all([
                    api.get('/participantes'),
                    api.get('/palestrantes'),
                    api.get('/eventos'),
                    api.get('/palestras')
                ]);

                const participantes = participantesRes.data.map(p => ({ ...p, tipo: "Participante" }));
                const palestrantes = palestrantesRes.data.map(p => ({ ...p, tipo: "Palestrante" }));
                const eventos = eventosRes.data.map(e => ({ 
                    ...e, 
                    tipo: "Evento", 
                    nome: e.titulo, 
                    descricao: e.local, 
                    inicio: new Date(e.dataInicio) 
                }));
                const palestras = palestrasRes.data.map(p => ({ 
                    ...p, 
                    tipo: "Palestra", 
                    nome: p.titulo, 
                    inicio: new Date(p.inicio) 
                }));

                setTodosItens([...participantes, ...palestrantes, ...eventos, ...palestras]);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
                setError("Não foi possível resgatar os dados. Verifique sua conexão ou tente novamente mais tarde.");
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const [termoBusca, setTermoBusca] = useState("");
    const [ordenar, setOrdenar] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("Todos");

    const ordens = ["Nome (A-Z)", "Nome (Z-A)"];

    const buscaFiltradas = todosItens
        .filter(item => {
            const matchesSearch = item.nome?.toLowerCase().includes(termoBusca.toLowerCase()) || 
                                 item.titulo?.toLowerCase().includes(termoBusca.toLowerCase()) ||
                                 item.email?.toLowerCase().includes(termoBusca.toLowerCase()) ||
                                 item.email2?.toLowerCase().includes(termoBusca.toLowerCase()) ||
                                 item.cpf?.toLowerCase().includes(termoBusca.toLowerCase()) ||
                                 item.ra?.toLowerCase().includes(termoBusca.toLowerCase());
            const matchesType = filtroTipo === "Todos" || item.tipo === filtroTipo;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const nomeA = a.nome || a.titulo || "";
            const nomeB = b.nome || b.titulo || "";
            if (ordenar === "Nome (A-Z)") return nomeA.localeCompare(nomeB);
            if (ordenar === "Nome (Z-A)") return nomeB.localeCompare(nomeA);
            return 0;
        });

    const handleReset = () => {
        setFiltroTipo("Todos");
        setTermoBusca("");
    };

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.h1 variants={itemVariants} className="text-4xl font-primary text-primary font-bold">Buscar</motion.h1>

                    {/* Busca + Ordenar + Filtros */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary/70" htmlFor="busca">Busca Global</label>
                            <div className="flex gap-3">
                                {/* Campo de busca */}
                                <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 h-15 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                    <input 
                                        id="busca" 
                                        type="text" 
                                        value={termoBusca} 
                                        onChange={(e) => setTermoBusca(e.target.value)} 
                                        placeholder="Digite o nome de um evento, palestra, participante ou palestrante" 
                                        className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"
                                    />
                                    <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                                </div>

                                {/* Ordenar por */}
                                <div className="relative">
                                    <select 
                                        value={ordenar} 
                                        onChange={(e) => setOrdenar(e.target.value)} 
                                        className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full hover:bg-accent/30 transition-colors"
                                    >
                                        <option value="" disabled>Ordenar por</option>
                                        {ordens.map(o => (
                                            <option key={o} value={o}>{o}</option>
                                        ))}
                                    </select>
                                    <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Filtros de Tipo */}
                        <div className="flex bg-accent/30 gap-3 p-3 rounded-2xl items-center">
                            <p className="text-sm font-secondary text-primary font-bold px-2">Filtrar por:</p>
                            <div className="flex flex-row w-full gap-2">
                                <FilterButton 
                                    active={filtroTipo === "Evento"} 
                                    onClick={() => setFiltroTipo("Evento")}
                                    icon={<CalendarStarIcon size={20} />}
                                    label="Eventos"
                                />
                                <FilterButton 
                                    active={filtroTipo === "Palestra"} 
                                    onClick={() => setFiltroTipo("Palestra")}
                                    icon={<LecternIcon size={20} />}
                                    label="Palestras"
                                />
                                <FilterButton 
                                    active={filtroTipo === "Participante"} 
                                    onClick={() => setFiltroTipo("Participante")}
                                    icon={<UserIcon size={20} />}
                                    label="Participantes"
                                />
                                <FilterButton 
                                    active={filtroTipo === "Palestrante"} 
                                    onClick={() => setFiltroTipo("Palestrante")}
                                    icon={<MicrophoneStageIcon size={20} />}
                                    label="Palestrantes"
                                />

                                <button 
                                    onClick={handleReset}
                                    className="w-14 flex items-center justify-center bg-accent/20 hover:bg-error/20 hover:text-error transition-all rounded-xl cursor-pointer text-primary/60"
                                    title="Limpar Filtros"
                                >
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Resultados */}
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="flex flex-col gap-3"
                    >
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="w-full h-20 bg-accent/10 animate-pulse rounded-2xl" />
                                ))
                            ) : error ? (
                                <motion.div variants={itemVariants} className="text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                    {error}
                                </motion.div>
                            ) : buscaFiltradas.length > 0 ? (
                                buscaFiltradas.map(b => (
                                    <motion.div 
                                        key={`${b.tipo}-${b.id}`} 
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {b.tipo === "Participante" && <ParticipanteCard participante={b} check={false} />}
                                        {b.tipo === "Palestrante" && <PalestranteCard palestrante={b} />}
                                        {(b.tipo === "Evento" || b.tipo === "Palestra") && (
                                            <EventoPalestraCard 
                                                tipo="compact" 
                                                item={{
                                                    tipo: b.tipo, 
                                                    descricao: b.descricao, 
                                                    titulo: b.nome || b.titulo, 
                                                    data: b.inicio, 
                                                    link: b.tipo.toLowerCase() === "palestra" ? `/palestra/${b.id}` : `/evento/${b.id}`
                                                }} 
                                            />
                                        )}
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 rounded-3xl border border-dashed border-accent/20"
                                >
                                    {termoBusca ? "Nenhum resultado encontrado para sua busca." : "Digite algo ou selecione um filtro para começar a buscar."}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};


const FilterButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-secondary transition-all cursor-pointer border-2 ${
            active 
            ? "bg-accent border-accent text-primary font-bold shadow-md scale-[1.02]" 
            : "bg-accent/10 border-transparent text-primary/60 hover:bg-accent/20"
        }`}
    >
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
);

export default Buscar;
