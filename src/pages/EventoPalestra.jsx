import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon, CalendarStarIcon, CheckCircleIcon, ClockIcon, LecternIcon, SparkleIcon } from "@phosphor-icons/react";
import EventoPalestraCard from "../components/EventoPalestraCard";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';
import { PALESTRA_STATUS } from "../utils/palestraStatus";
import { getActivityStatus } from "../utils/activityStatus";

const tiposFiltro = [
    { value: "todos", label: "Todos" },
    { value: "Evento", label: "Eventos" },
    { value: "Palestra", label: "Palestras" }
];

const situacoesFiltro = [
    { value: "todos", label: "Todas" },
    { value: "ativos", label: "Ativos" },
    { value: "FINALIZADO", label: "Finalizados" },
    { value: "CANCELADO", label: "Cancelados" },
    { value: "ARQUIVADO", label: "Arquivados" }
];

const parseLocalDate = (value) => {
    if (!value) return null;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    return new Date(value);
};

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
                    inicio: parseLocalDate(e.dataInicio),
                    fim: e.dataFim ? parseLocalDate(e.dataFim) : null,
                    descricao: e.descricao || e.categoria || "Evento cadastrado",
                    link: `/evento/${e.id}`
                }));

                const palestras = palestrasRes.data.map(p => ({
                    ...p,
                    tipo: "Palestra",
                    inicio: new Date(p.inicio),
                    fim: p.fim ? new Date(p.fim) : null,
                    descricao: p.descricao || p.modalidade || "Palestra cadastrada",
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
        tipo: "todos",
        statusPalestra: "todos",
        situacao: "todos"
    });

    const resetarFiltros = () => {
        setFiltros({ tipo: "todos", statusPalestra: "todos", situacao: "todos" });
        setBusca("");
    };

    const evePalFiltrados = (itens || [])
        .filter(item => (item.titulo || item.nome || "").toLowerCase().includes(busca.toLowerCase()))
        .filter(item => {
            if (filtros.tipo === "todos") return true;
            return item.tipo === filtros.tipo;
        })
        .filter(item => {
            if (filtros.statusPalestra === "todos") return true;
            if (item.tipo !== "Palestra") return false;
            return (item.status || "PENDENTE") === filtros.statusPalestra;
        })
        .filter(item => {
            const situacao = getActivityStatus(item, item.tipo?.toLowerCase());
            if (filtros.situacao === "todos") return true;
            if (filtros.situacao === "ativos") return !situacao;
            return situacao === filtros.situacao;
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
                <div className="pt-8 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <SparkleIcon size={16} weight="fill" />
                                Programação
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Eventos e Palestras</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">
                                Gerencie a agenda, status e detalhes de cada atividade.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full xl:w-auto">
                            <MetricCard icon={<CalendarStarIcon size={20} />} label="Eventos" value={(itens || []).filter(i => i.tipo === "Evento").length} />
                            <MetricCard icon={<LecternIcon size={20} />} label="Palestras" value={(itens || []).filter(i => i.tipo === "Palestra").length} />
                            <MetricCard icon={<ClockIcon size={20} />} label="Pendentes" value={(itens || []).filter(i => i.tipo === "Palestra" && (i.status || "PENDENTE") === "PENDENTE").length} />
                            <MetricCard icon={<CheckCircleIcon size={20} />} label="Exibindo" value={evePalFiltrados.length} />
                        </div>
                    </motion.div>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-4 flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar por nome de evento ou palestra" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/35 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-full lg:min-w-70 h-full hover:bg-accent/20 transition-colors">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="bg-base-100/45 border border-accent/10 p-3 rounded-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                                <FilterSelect
                                    label="Tipo"
                                    icon={<CalendarStarIcon size={16} />}
                                    value={filtros.tipo}
                                    onChange={(value) => setFiltros((current) => ({ ...current, tipo: value }))}
                                    options={tiposFiltro}
                                />
                                <FilterSelect
                                    label="Status"
                                    icon={<ClockIcon size={16} />}
                                    value={filtros.statusPalestra}
                                    onChange={(value) => setFiltros((current) => ({ ...current, statusPalestra: value }))}
                                    options={[{ value: "todos", label: "Todos" }, ...PALESTRA_STATUS]}
                                />
                                <FilterSelect
                                    label="Situação"
                                    icon={<CheckCircleIcon size={16} />}
                                    value={filtros.situacao}
                                    onChange={(value) => setFiltros((current) => ({ ...current, situacao: value }))}
                                    options={situacoesFiltro}
                                />
                                <button onClick={resetarFiltros} className="btn h-12 bg-accent/10 hover:bg-error/20 hover:text-error border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal cursor-pointer transition-all">
                                    <XIcon size={20} />
                                    <span className="md:hidden">Limpar</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
                    >
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-full h-[430px] bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-3 2xl:col-span-4 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : evePalFiltrados.length > 0 ? (
                            evePalFiltrados.map(ep => (
                                <motion.div key={`${ep.tipo}-${ep.id}`} variants={itemVariants}>
                                    <EventoPalestraCard tipo="full" item={ep}/>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-3 2xl:col-span-4 text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 rounded-3xl border border-dashed border-accent/20">
                                Nenhuma palestra ou evento encontrado para os filtros selecionados.
                            </motion.div>
                        )}
                    </motion.div>

                </div>
            </div>
        </PageTransition>
    )
}

const MetricCard = ({ icon, label, value }) => (
    <div className="bg-accent/20 border border-accent/10 rounded-2xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 text-primary/55">
            {icon}
            <span className="text-xs font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-2xl font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

const FilterSelect = ({ label, icon, value, onChange, options }) => (
    <label className="flex flex-col gap-1.5 min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-secondary uppercase text-primary/45 px-1">
            {icon}
            {label}
        </span>
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="appearance-none w-full h-12 bg-accent/10 border border-transparent rounded-xl pl-4 pr-10 text-sm font-secondary text-primary cursor-pointer outline-none hover:bg-accent/20 focus:border-accent transition-colors"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
        </div>
    </label>
);

export default EventoPalestra;
