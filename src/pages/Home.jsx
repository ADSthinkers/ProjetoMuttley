import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { LecternIcon, CalendarStarIcon, CaretRightIcon } from "@phosphor-icons/react"
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';

const Home = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    // useMemo evita recriar a instância do axios em cada render
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

                const formatData = (dataStr) => {
                    const date = new Date(dataStr);
                    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                    return {
                        dia: String(date.getDate()).padStart(2, '0'),
                        mes: meses[date.getMonth()],
                        fullDate: date
                    };
                };

                const eventos = eventosRes.data.map(e => ({
                    ...e,
                    tipo: "Evento",
                    ...formatData(e.dataInicio),
                    descricao: e.local, // Usando local como descrição para eventos
                    link: `/evento/${e.id}`
                }));

                const palestras = palestrasRes.data.map(p => ({
                    ...p,
                    tipo: "Palestra",
                    ...formatData(p.inicio),
                    link: `/palestra/${p.id}` // Supondo que exista uma rota de palestra
                }));

                setItens([...eventos, ...palestras].sort((a, b) => a.fullDate - b.fullDate));
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
                setError("Não foi possível resgatar os dados. Verifique sua conexão ou tente novamente mais tarde.");
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const [filtro, setFiltro] = useState("Todos")
    const [filtro2, setFiltro2] = useState("Todos")

    const filtros = ["Todos", "Palestra", "Evento"]

    const now = new Date();

    const proximos = (itens || []).filter(item => item.fullDate >= now);
    const anteriores = (itens || []).filter(item => item.fullDate < now);

    const itensFiltrados = proximos.filter(item =>
        filtro === "Todos" || item.tipo === filtro
    )

    const itensFiltrados2 = anteriores.filter(item =>
        filtro2 === "Todos" || item.tipo === filtro2
    )

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen overflow-hidden">
                <Sidebar className="shrink-0" />
                <div className="pt-5 pl-2 pr-5 w-full h-screen flex flex-col gap-4 overflow-hidden">
                    <motion.h1 variants={itemVariants} className="text-4xl font-primary text-primary font-bold mt-8 shrink-0">Home</motion.h1>
                    
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="pb-8 flex flex-col xl:flex-row gap-8 flex-1 min-h-0"
                    >
                        {/* Próximos Section */}
                        <motion.div variants={itemVariants} className="p-6 flex flex-col gap-5 bg-accent/40 rounded-3xl flex-1 min-h-0 border border-accent/10 shadow-sm">
                            <h2 className="text-3xl font-primary font-light text-primary shrink-0">Próximos</h2>
                
                            <div className="flex items-center bg-accent/30 rounded-2xl p-1 gap-1 shrink-0">
                                {filtros.map((f) => (
                                    <button key={f} onClick={() => setFiltro(f)} className={`flex-1 flex font-secondary items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${filtro === f ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}>
                                        {f === "Palestra" && <LecternIcon size={16} weight="light" />}
                                        {f === "Evento" && <CalendarStarIcon size={16} weight="light" />}
                                        {f}
                                    </button>
                                ))}
                            </div>
                
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="w-full h-24 bg-accent/20 animate-pulse rounded-3xl" />
                                    ))
                                ) : error ? (
                                    <p className="text-center py-10 text-error font-secondary">{error}</p>
                                ) : itensFiltrados.length > 0 ? (
                                    itensFiltrados.map((item, index) => (
                                        <motion.a 
                                            key={index} 
                                            href={item.link} 
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="bg-accent/70 rounded-3xl p-5 flex items-stretch gap-4 hover:bg-accent/90 transition-all group w-full shrink-0"
                                        >
                                            <div className="flex flex-col items-center justify-center min-w-14 text-primary font-primary">
                                                <span className="text-4xl font-light leading-none">{item.dia}</span>
                                                <span className="text-xl font-light">{item.mes}</span>
                                            </div>
                                            <div className="w-px bg-primary/30 self-stretch" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <span className="inline-flex items-center gap-1.5 self-start bg-primary/15 text-primary font-secondary text-xs font-medium px-3 py-1 rounded-full">
                                                    {item.tipo === "Palestra" ? <LecternIcon size={12} weight="light" /> : <CalendarStarIcon size={12} weight="light" />}
                                                    {item.tipo}
                                                </span>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-base font-medium font-primary text-primary leading-snug">{item.titulo}</h3>
                                                        <p className="text-sm font-secondary text-primary/70 leading-snug">{item.descricao}</p>
                                                    </div>
                                                    <CaretRightIcon size={20} weight="light" className="text-primary/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-primary/40 font-secondary">Nenhum evento próximo.</p>
                                )}
                            </div>
                        </motion.div>
                        
                        {/* Anteriores Section */}
                        <motion.div variants={itemVariants} className="p-6 flex flex-col gap-5 bg-accent/40 rounded-3xl flex-1 min-h-0 border border-accent/10 shadow-sm">
                            <h2 className="text-3xl font-primary font-light text-primary shrink-0">Anteriores</h2>
                
                            <div className="flex items-center bg-accent/30 rounded-2xl p-1 gap-1 shrink-0">
                                {filtros.map((f) => (
                                    <button key={f} onClick={() => setFiltro2(f)} className={`flex-1 flex font-secondary items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${filtro2 === f ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}>
                                        {f === "Palestra" && <LecternIcon size={16} weight="light" />}
                                        {f === "Evento" && <CalendarStarIcon size={16} weight="light" />}
                                        {f}
                                    </button>
                                ))}
                            </div>
                
                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="w-full h-24 bg-accent/20 animate-pulse rounded-3xl" />
                                    ))
                                ) : error ? (
                                    <p className="text-center py-10 text-error font-secondary">{error}</p>
                                ) : itensFiltrados2.length > 0 ? (
                                    itensFiltrados2.map((item, index) => (
                                        <motion.a 
                                            key={index} 
                                            href={item.link} 
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="bg-accent/70 rounded-3xl p-5 flex items-stretch gap-4 hover:bg-accent/90 transition-all group w-full shrink-0"
                                        >
                                            <div className="flex flex-col items-center justify-center min-w-14 text-primary font-primary">
                                                <span className="text-4xl font-light leading-none">{item.dia}</span>
                                                <span className="text-xl font-light">{item.mes}</span>
                                            </div>
                                            <div className="w-px bg-primary/30 self-stretch" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <span className="inline-flex items-center gap-1.5 self-start bg-primary/15 text-primary font-secondary text-xs font-medium px-3 py-1 rounded-full">
                                                    {item.tipo === "Palestra" ? <LecternIcon size={12} weight="light" /> : <CalendarStarIcon size={12} weight="light" />}
                                                    {item.tipo}
                                                </span>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-base font-medium font-primary text-primary leading-snug">{item.titulo}</h3>
                                                        <p className="text-sm font-secondary text-primary/70 leading-snug">{item.descricao}</p>
                                                    </div>
                                                    <CaretRightIcon size={20} weight="light" className="text-primary/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))
                                ) : (
                                    <p className="text-center py-10 text-primary/40 font-secondary">Nenhum evento anterior.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    )
}

export default Home;

