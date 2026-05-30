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
    MicrophoneStageIcon,
    SparkleIcon
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

    const buscaFiltradas = useMemo(() => {
        if (!termoBusca.trim()) return [];

        return todosItens
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
    }, [termoBusca, todosItens, filtroTipo, ordenar]);

    const handleReset = () => {
        setFiltroTipo("Todos");
        setTermoBusca("");
    };

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <SparkleIcon size={16} weight="fill" />
                                Busca global
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Buscar</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">
                                Encontre pessoas, eventos e palestras em um só lugar.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
                            <MetricCard icon={<CalendarStarIcon size={20} />} label="Eventos" value={todosItens.filter(i => i.tipo === "Evento").length} />
                            <MetricCard icon={<LecternIcon size={20} />} label="Palestras" value={todosItens.filter(i => i.tipo === "Palestra").length} />
                            <MetricCard icon={<UserIcon size={20} />} label="Participantes" value={todosItens.filter(i => i.tipo === "Participante").length} />
                            <MetricCard icon={<MicrophoneStageIcon size={20} />} label="Palestrantes" value={todosItens.filter(i => i.tipo === "Palestrante").length} />
                        </div>
                    </motion.div>

                    {/* Busca + Ordenar + Filtros */}
                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col lg:flex-row gap-3">
                                {/* Campo de busca */}
                                <div className="flex items-center gap-3 flex-1 bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 h-15 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                    <input 
                                        id="busca" 
                                        type="text" 
                                        value={termoBusca} 
                                        onChange={(e) => setTermoBusca(e.target.value)} 
                                        placeholder="Buscar por nome, e-mail, CPF, RA, evento ou palestra" 
                                        className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/35 focus:outline-none"
                                    />
                                    <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                                </div>

                                {/* Ordenar por */}
                                <div className="relative">
                                    <select 
                                        value={ordenar} 
                                        onChange={(e) => setOrdenar(e.target.value)} 
                                        className="appearance-none bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-full lg:min-w-70 h-full hover:bg-accent/20 transition-colors"
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
                        <div className="flex flex-col xl:flex-row bg-base-100/45 border border-accent/10 gap-3 p-3 rounded-2xl xl:items-center">
                            <p className="text-sm font-secondary text-primary/60 font-semibold px-2 shrink-0">Filtrar por</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 xl:flex xl:flex-row w-full gap-2">
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
                                    className="xl:w-14 flex items-center justify-center bg-accent/20 hover:bg-error/20 hover:text-error transition-all rounded-xl cursor-pointer text-primary/60 min-h-12"
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
                        className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="w-full h-72 bg-accent/10 animate-pulse rounded-3xl" />
                                ))
                            ) : error ? (
                                <motion.div variants={itemVariants} className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
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
                                        className={(b.tipo === "Evento" || b.tipo === "Palestra") ? "md:col-span-2 2xl:col-span-1" : ""}
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
                                                    inicio: b.inicio,
                                                    status: b.status,
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
                                    className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 rounded-3xl border border-dashed border-accent/20"
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
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-secondary transition-all cursor-pointer border ${
            active 
            ? "bg-accent border-accent text-primary font-bold shadow-sm" 
            : "bg-accent/10 border-transparent text-primary/60 hover:bg-accent/20 hover:text-primary"
        }`}
    >
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
);

const MetricCard = ({ icon, label, value }) => (
    <div className="bg-accent/20 border border-accent/10 rounded-2xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 text-primary/55">
            {icon}
            <span className="text-xs font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-2xl font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

export default Buscar;
