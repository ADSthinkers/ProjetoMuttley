import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { LecternIcon, CalendarStarIcon, CaretRightIcon, ClockIcon, SparkleIcon, ArchiveIcon } from "@phosphor-icons/react"
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';
import { getPalestraStatusBadgeClass, getPalestraStatusLabel } from "../utils/palestraStatus";

const filtros = ["Todos", "Palestra", "Evento"];

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatItemDate = (dataStr) => {
    const date = new Date(dataStr);
    return {
        dia: String(date.getDate()).padStart(2, "0"),
        mes: meses[date.getMonth()],
        horario: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        fullDate: date
    };
};

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

                const eventos = eventosRes.data.map(e => ({
                    ...e,
                    tipo: "Evento",
                    ...formatItemDate(e.dataInicio),
                    descricao: e.descricao || e.categoria || "Evento cadastrado",
                    link: `/evento/${e.id}`
                }));

                const palestras = palestrasRes.data.map(p => ({
                    ...p,
                    tipo: "Palestra",
                    ...formatItemDate(p.inicio),
                    descricao: p.descricao || p.modalidade || "Palestra cadastrada",
                    link: `/palestra/${p.id}`
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

    const now = new Date();

    const proximos = (itens || []).filter(item => item.fullDate >= now);
    const anteriores = (itens || []).filter(item => item.fullDate < now).sort((a, b) => b.fullDate - a.fullDate);

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
                <div className="pt-8 pl-2 pr-5 pb-8 w-full h-screen flex flex-col gap-6 overflow-hidden">
                    <motion.div variants={itemVariants} className="shrink-0 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 text-primary rounded-full px-4 py-2 font-secondary text-xs font-semibold mb-3">
                                <SparkleIcon size={16} weight="fill" />
                                Painel de atividades
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Home</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">
                                Acompanhe eventos e palestras por período, tipo e data.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 w-full xl:w-auto">
                            <MetricCard label="Próximos" value={proximos.length} icon={<CalendarStarIcon size={20} />} />
                            <MetricCard label="Anteriores" value={anteriores.length} icon={<ArchiveIcon size={20} />} />
                            <MetricCard label="Total" value={(itens || []).length} icon={<LecternIcon size={20} />} />
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="pb-8 flex flex-col xl:flex-row gap-8 flex-1 min-h-0"
                    >
                        <HomeColumn
                            title="Próximos"
                            subtitle="Agenda futura ordenada por data"
                            icon={<CalendarStarIcon size={24} weight="light" />}
                            items={itensFiltrados}
                            total={proximos.length}
                            filtro={filtro}
                            onFiltroChange={setFiltro}
                            loading={loading}
                            error={error}
                            emptyText="Nenhuma atividade próxima para este filtro."
                        />

                        <HomeColumn
                            title="Anteriores"
                            subtitle="Histórico mais recente primeiro"
                            icon={<ArchiveIcon size={24} weight="light" />}
                            items={itensFiltrados2}
                            total={anteriores.length}
                            filtro={filtro2}
                            onFiltroChange={setFiltro2}
                            loading={loading}
                            error={error}
                            emptyText="Nenhuma atividade anterior para este filtro."
                            muted
                        />
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    )
}

const MetricCard = ({ label, value, icon }) => (
    <div className="bg-accent/20 border border-accent/10 rounded-2xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 text-primary/55">
            {icon}
            <span className="text-xs font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-2xl font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

const HomeColumn = ({ title, subtitle, icon, items, total, filtro, onFiltroChange, loading, error, emptyText, muted }) => (
    <motion.section variants={itemVariants} className="p-5 2xl:p-6 flex flex-col gap-5 bg-accent/35 rounded-3xl flex-1 min-h-0 border border-accent/10 shadow-sm">
        <div className="flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-accent/70 flex items-center justify-center text-primary shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h2 className="text-3xl font-primary font-light text-primary">{title}</h2>
                    <p className="text-xs font-secondary text-primary/45 truncate">{subtitle}</p>
                </div>
            </div>
            <span className="bg-base-100/60 border border-accent/15 text-primary rounded-2xl px-4 py-2 text-sm font-secondary font-semibold shrink-0">
                {items.length}/{total}
            </span>
        </div>

        <FilterTabs filtro={filtro} onChange={onFiltroChange} />

        <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)
            ) : error ? (
                <div className="text-center py-10 text-error font-secondary bg-error/5 border border-error/10 rounded-3xl">{error}</div>
            ) : items.length > 0 ? (
                items.map((item) => <ActivityCard key={`${item.tipo}-${item.id}`} item={item} muted={muted} />)
            ) : (
                <EmptyState text={emptyText} />
            )}
        </div>
    </motion.section>
);

const FilterTabs = ({ filtro, onChange }) => (
    <div className="flex items-center bg-base-100/45 border border-accent/10 rounded-2xl p-1 gap-1 shrink-0">
        {filtros.map((f) => (
            <button
                key={f}
                onClick={() => onChange(f)}
                className={`flex-1 flex font-secondary items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${filtro === f ? "bg-accent text-primary shadow-sm" : "text-primary/65 hover:text-primary hover:bg-accent/20"}`}
            >
                {f === "Palestra" && <LecternIcon size={16} weight="light" />}
                {f === "Evento" && <CalendarStarIcon size={16} weight="light" />}
                {f}
            </button>
        ))}
    </div>
);

const ActivityCard = ({ item, muted }) => (
    <motion.a
        href={item.link}
        whileHover={{ y: -3, scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        className={`bg-base-100/70 border border-accent/15 rounded-3xl p-4 flex items-stretch gap-4 hover:bg-accent/45 transition-all group w-full shrink-0 ${muted ? "opacity-90" : ""}`}
    >
        <div className="flex flex-col items-center justify-center w-17 rounded-2xl bg-accent/55 text-primary font-primary shrink-0">
            <span className="text-3xl font-bold leading-none">{item.dia}</span>
            <span className="text-sm font-secondary uppercase mt-1">{item.mes}</span>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge tipo={item.tipo} />
                    {item.tipo === "Palestra" && (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-secondary font-semibold ${getPalestraStatusBadgeClass(item.status || "PENDENTE")}`}>
                            {getPalestraStatusLabel(item.status)}
                        </span>
                    )}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-secondary text-primary/45 shrink-0">
                    <ClockIcon size={14} />
                    {item.horario}
                </span>
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-lg font-primary font-bold text-primary leading-tight line-clamp-2">{item.titulo}</h3>
                    <p className="text-sm font-secondary text-primary/60 leading-snug mt-1 line-clamp-2">{item.descricao}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-accent/30 flex items-center justify-center text-primary/60 shrink-0 group-hover:bg-accent group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    <CaretRightIcon size={18} weight="light" />
                </div>
            </div>
        </div>
    </motion.a>
);

const TypeBadge = ({ tipo }) => (
    <span className="inline-flex items-center gap-1.5 self-start bg-primary/10 text-primary font-secondary text-xs font-medium px-3 py-1 rounded-full">
        {tipo === "Palestra" ? <LecternIcon size={12} weight="light" /> : <CalendarStarIcon size={12} weight="light" />}
        {tipo}
    </span>
);

const LoadingCard = () => (
    <div className="w-full h-28 bg-accent/20 animate-pulse rounded-3xl" />
);

const EmptyState = ({ text }) => (
    <div className="text-center py-12 text-primary/45 font-secondary bg-base-100/45 border border-dashed border-accent/20 rounded-3xl">
        {text}
    </div>
);

export default Home;
