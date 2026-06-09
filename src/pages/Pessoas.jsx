import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { BriefcaseIcon, CaretDownIcon, FileTextIcon, MagnifyingGlassIcon, MicrophoneStageIcon, UsersIcon } from "@phosphor-icons/react";
import ParticipanteCard from "../components/ParticipanteCard";
import PalestranteCard from "../components/PalestranteCard";
import AssinanteCard from "../components/AssinanteCard";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import axios from "axios";
import { isAdmin } from "../utils/auth";

const filtrosBase = [
    { id: "todos", label: "Todos", icon: <UsersIcon size={18} /> },
    { id: "participante", label: "Participantes", icon: <UsersIcon size={18} /> },
    { id: "palestrante", label: "Palestrantes", icon: <MicrophoneStageIcon size={18} /> },
    { id: "assinante", label: "Assinantes", icon: <FileTextIcon size={18} /> },
];

const ordens = ["Nome (A-Z)", "Nome (Z-A)"];

const normalizar = (valor) => String(valor || "").toLowerCase();

const Pessoas = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": dbKEY,
            "Accept": "application/json",
        },
    }), [dbURL, dbKEY]);

    const [participantes, setParticipantes] = useState([]);
    const [palestrantes, setPalestrantes] = useState([]);
    const [assinantes, setAssinantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busca, setBusca] = useState("");
    const [ordenar, setOrdenar] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const canManageAssinantes = isAdmin();
    const filtros = filtrosBase.filter((item) => item.id !== "assinante" || canManageAssinantes);

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setLoading(false);
                return;
            }

            try {
                const requests = [
                    api.get("/participantes"),
                    api.get("/palestrantes"),
                ];

                if (canManageAssinantes) requests.push(api.get("/assinantes"));

                const [participantesRes, palestrantesRes, assinantesRes] = await Promise.all(requests);

                setParticipantes(participantesRes.data || []);
                setPalestrantes(palestrantesRes.data || []);
                setAssinantes(assinantesRes?.data || []);
            } catch (err) {
                console.error("Erro ao buscar pessoas", err);
                setError("Não foi possível resgatar os dados de pessoas. Verifique sua conexão ou tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, canManageAssinantes, dbKEY, dbURL]);

    const pessoas = [
        ...participantes.map((item) => ({ tipo: "participante", item })),
        ...palestrantes.map((item) => ({ tipo: "palestrante", item })),
        ...assinantes.map((item) => ({ tipo: "assinante", item })),
    ];

    const pessoasFiltradas = pessoas
        .filter(({ tipo }) => filtro === "todos" || filtro === tipo)
        .filter(({ item }) => {
            const texto = [
                item.nome,
                item.email,
                item.email2,
                item.cpf,
                item.ra,
                item.curso,
                item.areaAtuacao,
                item.instituicao,
                item.formacao,
                item.cargo,
            ].map(normalizar).join(" ");

            return texto.includes(normalizar(busca));
        })
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return normalizar(a.item.nome).localeCompare(normalizar(b.item.nome));
            if (ordenar === "Nome (Z-A)") return normalizar(b.item.nome).localeCompare(normalizar(a.item.nome));
            return 0;
        });

    const renderCard = ({ tipo, item }) => {
        if (tipo === "participante") return <ParticipanteCard participante={item} />;
        if (tipo === "palestrante") return <PalestranteCard palestrante={item} />;
        return <AssinanteCard assinante={item} />;
    };

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-8 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <UsersIcon size={16} weight="fill" />
                                Diretório
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Pessoas</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">
                                Consulte participantes, palestrantes e assinantes em uma única área.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
                            <MetricCard icon={<UsersIcon size={20} />} label="Participantes" value={participantes.length} />
                            <MetricCard icon={<MicrophoneStageIcon size={20} />} label="Palestrantes" value={palestrantes.length} />
                            <MetricCard icon={<FileTextIcon size={20} />} label="Assinantes" value={assinantes.length} />
                            <MetricCard icon={<BriefcaseIcon size={20} />} label="Exibindo" value={pessoasFiltradas.length} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            {filtros.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFiltro(item.id)}
                                    className={`h-11 px-4 rounded-2xl font-secondary text-sm flex items-center gap-2 cursor-pointer transition-colors ${filtro === item.id ? "bg-accent text-primary font-bold" : "bg-base-100/65 text-primary/65 hover:bg-accent/25"}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input
                                    id="busca"
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar por nome, e-mail, CPF, curso, área, instituição ou cargo"
                                    className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/35 focus:outline-none"
                                />
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-full lg:min-w-70 h-full hover:bg-accent/20 transition-colors">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map((ordem) => (
                                        <option key={ordem} value={ordem}>{ordem}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="w-full h-72 bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            <motion.div variants={itemVariants} className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : pessoasFiltradas.length > 0 ? (
                            pessoasFiltradas.map((pessoa) => (
                                <motion.div key={`${pessoa.tipo}-${pessoa.item.id}`} variants={itemVariants}>
                                    {renderCard(pessoa)}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 border border-dashed border-accent/20 rounded-3xl">
                                Nenhuma pessoa encontrada.
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

const MetricCard = ({ icon, label, value }) => (
    <div className="bg-accent/20 border border-accent/10 rounded-2xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 text-primary/55">
            {icon}
            <span className="text-xs font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-2xl font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

export default Pessoas;
