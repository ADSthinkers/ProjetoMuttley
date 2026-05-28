import Sidebar from "../components/Sidebar";
import AlunoCard from "../components/AlunoCard";
import EventoPalestraCard from "../components/EventoPalestraCard";
import PalestranteCard from "../components/PalestranteCard";
import { useState } from "react";
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

const Buscar = () => {
    const buscas = [
        {
            id: 1,
            nome: "Inteligência Artificial na Prática",
            descricao: "Palestra sobre aplicações reais de IA e Machine Learning",
            competencias: ["IA", "Python", "Lógica"],
            palestrantes: ["Dr. Alan Turing"],
            inicio: new Date("2026-05-20T14:00:00"),
            fim: new Date("2026-05-20T16:00:00"),
            tipo: "Palestra",
            concluido: false
        },
        {
            id: 2,
            nome: "Semana de Tecnologia 2026",
            descricao: "O maior evento de tecnologia da região",
            competencias: ["Networking", "Inovação"],
            palestrantes: ["Vários"],
            inicio: new Date("2026-05-15T08:00:00"),
            fim: new Date("2026-05-18T18:00:00"),
            tipo: "Evento",
            concluido: false
        },
        {
            id: 3,
            nome: "Manon Katseye",
            cpf: "213.465.879-10",
            emailPessoal: "ilikethedrama@gameboy.com",
            emailFatec: "manon.katseye@fatec.sp.gov.br",
            tipo: "Aluno"
        },
        {
            id: 4,
            nome: "Miguel Victor",
            cpf: "123.456.789-10",
            emailPessoal: "miguel.balbo@yahoo.com.br",
            emailFatec: "miguel.victor@fatec.sp.gov.br",
            tipo: "Aluno"
        },
        {
            id: 5,
            nome: "Dr. Alan Turing",
            cpf: "111.222.333-44",
            email: "alan.turing@bletchley.park",
            tipo: "Palestrante"
        },
        {
            id: 6,
            nome: "Jordan Walke",
            cpf: "555.666.777-88",
            email: "jordan.walke@react.js",
            tipo: "Palestrante"
        }
    ];

    const [termoBusca, setTermoBusca] = useState("");
    const [ordenar, setOrdenar] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("Todos");

    const ordens = ["Nome (A-Z)", "Nome (Z-A)"];

    const buscaFiltradas = buscas
        .filter(item => {
            const matchesSearch = item.nome.toLowerCase().includes(termoBusca.toLowerCase());
            const matchesType = filtroTipo === "Todos" || item.tipo === filtroTipo;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.nome.localeCompare(b.nome);
            if (ordenar === "Nome (Z-A)") return b.nome.localeCompare(a.nome);
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
                                        placeholder="Digite o nome de um evento, palestra, aluno ou palestrante" 
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
                                    active={filtroTipo === "Aluno"} 
                                    onClick={() => setFiltroTipo("Aluno")}
                                    icon={<UserIcon size={20} />}
                                    label="Alunos"
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
                            {buscaFiltradas.length > 0 ? (
                                buscaFiltradas.map(b => (
                                    <motion.div 
                                        key={`${b.tipo}-${b.id}`} 
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {b.tipo === "Aluno" && <AlunoCard aluno={b} check={false} />}
                                        {b.tipo === "Palestrante" && <PalestranteCard palestrante={b} />}
                                        {(b.tipo === "Evento" || b.tipo === "Palestra") && (
                                            <EventoPalestraCard 
                                                tipo="compact" 
                                                item={{
                                                    tipo: b.tipo, 
                                                    descricao: b.descricao, 
                                                    titulo: b.nome, 
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
