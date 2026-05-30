import Sidebar from "../components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, MapPinIcon, UsersIcon } from "@phosphor-icons/react";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Locais = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": dbKEY,
            "Accept": "application/json",
        }
    }), [dbURL, dbKEY]);

    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busca, setBusca] = useState("");
    const [ordenar, setOrdenar] = useState("");

    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Maior capacidade", "Menor capacidade"];

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setError("Configuração da API não encontrada.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/locais");
                setLocais(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Erro ao buscar locais", error);
                setError("Não foi possível carregar os locais. Verifique sua conexão ou tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, dbURL, dbKEY]);

    const locaisFiltrados = locais
        .filter((local) => {
            const termo = busca.toLowerCase();
            return [
                local.nome,
                local.capacidade?.toString(),
            ].some((valor) => valor?.toLowerCase().includes(termo));
        })
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return (a.nome || "").localeCompare(b.nome || "");
            if (ordenar === "Nome (Z-A)") return (b.nome || "").localeCompare(a.nome || "");
            if (ordenar === "Maior capacidade") return (b.capacidade || 0) - (a.capacidade || 0);
            if (ordenar === "Menor capacidade") return (a.capacidade || 0) - (b.capacidade || 0);
            return 0;
        });

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <h1 className="text-4xl font-primary text-primary font-bold">Locais</h1>
                        <p className="text-sm font-secondary text-primary/50">Lista de ambientes cadastrados para eventos e palestras.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary/70" htmlFor="busca-local">Buscar</label>
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input
                                    id="busca-local"
                                    type="text"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Digite o nome ou capacidade do local"
                                    className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"
                                />
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full hover:bg-accent/30 transition-colors">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map((ordem) => (
                                        <option key={ordem} value={ordem}>{ordem}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-8"
                    >
                        {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-40 bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            <motion.div variants={itemVariants} className="xl:col-span-2 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : locaisFiltrados.length > 0 ? (
                            locaisFiltrados.map((local) => (
                                <motion.div key={local.id} variants={itemVariants}>
                                    <LocalCard local={local} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="xl:col-span-2 text-sm font-secondary text-primary/40 py-8 text-center">
                                Nenhum local encontrado.
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

const LocalCard = ({ local }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/local/${local.id}`)}
            className="h-full bg-accent/50 rounded-3xl p-5 border border-accent/30 shadow-sm hover:shadow-md hover:bg-accent/60 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-base-100/60 text-primary flex items-center justify-center shrink-0">
                        <MapPinIcon size={24} weight="light" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h2 className="text-xl font-primary font-bold text-primary truncate">{local.nome}</h2>
                        <span className="text-xs font-secondary text-primary/50">Código #{local.id}</span>
                    </div>
                </div>
                <div className="badge badge-outline border-primary/20 text-primary/60 font-secondary">
                    Local
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-base-100/45 border border-base-100/50 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/50 text-primary flex items-center justify-center shrink-0">
                    <UsersIcon size={22} weight="light" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-secondary text-primary/45">Capacidade</span>
                    <span className="text-lg font-primary font-bold text-primary">
                        {local.capacidade || 0} pessoas
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Locais;
