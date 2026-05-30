import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon, CalendarStarIcon, CheckCircleIcon, ClockIcon, LecternIcon } from "@phosphor-icons/react";
import EventoPalestraCard from "../components/EventoPalestraCard";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';
import { PALESTRA_STATUS } from "../utils/palestraStatus";

const EventoPalestra = () => {
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

    const [itens, setItens] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setLoading(false);
                return;
            }
            try { 
                const [eventosRes, palestrasRes] = await Promise.all([
                    api.get('/eventos'),
                    api.get('/palestras')
                ]);

                const eventos = eventosRes.data.map(e => ({
                    ...e,
                    tipo: "Evento",
                    inicio: new Date(e.dataInicio),
                    descricao: e.local,
                    link: `/evento/${e.id}`
                }));

                const palestras = palestrasRes.data.map(p => ({
                    ...p,
                    tipo: "Palestra",
                    inicio: new Date(p.inicio),
                    link: `/palestra/${p.id}`
                }));

                setItens([...eventos, ...palestras]);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
                setError("Não foi possível resgatar os dados. Verifique sua conexão ou tente novamente mais tarde.");
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")
    
    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Data (Crescente)", "Data (Decrescente)"]

    const [filtros, setFiltros] = useState({
        eventos: false,
        palestras: false,
        status: {}
    });

    const resetarFiltros = () => {
        setFiltros({ eventos: false, palestras: false, status: {} });
        setBusca("");
    };

    const evePalFiltrados = (itens || [])
        .filter(item => (item.titulo || item.nome || "").toLowerCase().includes(busca.toLowerCase()))
        .filter(item => {
            const filtroTipoAtivo = filtros.eventos || filtros.palestras;
            if (filtroTipoAtivo) {
                if (filtros.eventos && item.tipo === "Evento") return true;
                if (filtros.palestras && item.tipo === "Palestra") return true;
                return false;
            }
            return true;
        })
        .filter(item => {
            const statusSelecionados = Object.entries(filtros.status).filter(([, ativo]) => ativo).map(([status]) => status);
            if (statusSelecionados.length > 0 && item.tipo === "Palestra") return statusSelecionados.includes(item.status || "PENDENTE");
            if (statusSelecionados.length > 0 && item.tipo !== "Palestra") return false;
            return true;
        })
        .sort((a, b) => {
            const titA = a.titulo || a.nome || "";
            const titB = b.titulo || b.nome || "";
            if (ordenar === "Nome (A-Z)") return titA.localeCompare(titB);
            if (ordenar === "Nome (Z-A)") return titB.localeCompare(titA);
            if (ordenar === "Data (Crescente)") return a.inicio - b.inicio;
            if (ordenar === "Data (Decrescente)") return b.inicio - a.inicio;
            return 0;
        });

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <motion.h1 variants={itemVariants} className="text-4xl font-primary text-primary font-bold">Eventos e Palestras</motion.h1>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary/70" htmlFor="busca">Buscar</label>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Digite o nome de um evento ou palestra aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full hover:bg-accent/30 transition-colors">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-2">
                            <p className="text-sm font-secondary text-primary/70 self-center">Filtros</p>
                            <div className="flex flex-row w-full gap-2">
                                <label className={`flex-1 btn border-0 rounded-xl shadow-none font-secondary font-normal cursor-pointer transition-all ${filtros.eventos ? "bg-accent text-primary font-bold" : "bg-accent/30 text-primary/75"}`}>
                                    <input type="checkbox" className="hidden" checked={filtros.eventos} onChange={() => setFiltros(f => ({...f, eventos: !f.eventos}))} />
                                    <CalendarStarIcon size={20} />
                                    Eventos
                                </label>

                                <label className={`flex-1 btn border-0 rounded-xl shadow-none font-secondary font-normal cursor-pointer transition-all ${filtros.palestras ? "bg-accent text-primary font-bold" : "bg-accent/30 text-primary/75"}`}>
                                    <input type="checkbox" className="hidden" checked={filtros.palestras} onChange={() => setFiltros(f => ({...f, palestras: !f.palestras}))} />
                                    <LecternIcon size={20} />
                                    Palestras
                                </label>

                                {PALESTRA_STATUS.map((status) => (
                                    <label key={status.value} className={`flex-1 btn border-0 rounded-xl shadow-none font-secondary font-normal cursor-pointer transition-all ${filtros.status[status.value] ? "bg-accent text-primary font-bold" : "bg-accent/30 text-primary/75"}`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={Boolean(filtros.status[status.value])}
                                            onChange={() => setFiltros(f => ({...f, status: {...f.status, [status.value]: !f.status[status.value]}}))}
                                        />
                                        {status.value === "PENDENTE" ? <ClockIcon size={20} /> : <CheckCircleIcon size={20} />}
                                        {status.label}
                                    </label>
                                ))}

                                <button onClick={resetarFiltros} className="w-20 btn bg-accent/30 hover:bg-error/20 hover:text-error border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal cursor-pointer transition-all">
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="flex flex-wrap gap-6"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-72 h-[400px] bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            <motion.div variants={itemVariants} className="w-full text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : evePalFiltrados.length > 0 ? (
                            evePalFiltrados.map(ep => (
                                <motion.div key={`${ep.tipo}-${ep.id}`} variants={itemVariants}>
                                    <EventoPalestraCard tipo="full" item={ep}/>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="w-full text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 rounded-3xl border border-dashed border-accent/20">
                                Nenhuma palestra ou evento encontrado para os filtros selecionados.
                            </motion.div>
                        )}
                    </motion.div>

                </div>
            </div>
        </PageTransition>
    )
}

export default EventoPalestra;
