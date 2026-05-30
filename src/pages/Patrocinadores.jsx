import Sidebar from "../components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { BuildingsIcon, CaretDownIcon, IdentificationCardIcon, LinkIcon, MagnifyingGlassIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Patrocinadores = () => {
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

    const [patrocinadores, setPatrocinadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busca, setBusca] = useState("");
    const [ordenar, setOrdenar] = useState("");
    const [tipo, setTipo] = useState("Todos");

    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Cidade (A-Z)"];
    const tipos = ["Todos", "PJ", "PF"];

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setError("Configuração da API não encontrada.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/patrocinadores");
                setPatrocinadores(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Erro ao buscar patrocinadores", error);
                setError("Não foi possível carregar os patrocinadores. Verifique sua conexão ou tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, dbURL, dbKEY]);

    const patrocinadoresFiltrados = patrocinadores
        .filter((patrocinador) => {
            if (tipo !== "Todos" && patrocinador.tipo !== tipo) return false;

            const termo = busca.toLowerCase();
            return [
                getNomePatrocinador(patrocinador),
                patrocinador.razaoSocial,
                patrocinador.nomeFantasia,
                patrocinador.nomeCompleto,
                patrocinador.email,
                patrocinador.telefone,
                patrocinador.cpf,
                patrocinador.cnpj,
                patrocinador.nomeResponsavel,
                patrocinador.cidade,
                patrocinador.uf,
            ].some((valor) => valor?.toLowerCase().includes(termo));
        })
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return getNomePatrocinador(a).localeCompare(getNomePatrocinador(b));
            if (ordenar === "Nome (Z-A)") return getNomePatrocinador(b).localeCompare(getNomePatrocinador(a));
            if (ordenar === "Cidade (A-Z)") return (a.cidade || "").localeCompare(b.cidade || "");
            return 0;
        });

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="flex flex-col gap-1">
                        <h1 className="text-4xl font-primary text-primary font-bold">Patrocinadores</h1>
                        <p className="text-sm font-secondary text-primary/50">Empresas e pessoas vinculadas como patrocinadores.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary/70" htmlFor="busca-patrocinador">Buscar</label>
                            <div className="flex flex-col xl:flex-row gap-3">
                                <div className="flex items-center gap-3 flex-1 bg-accent/30 border border-accent/40 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/60 transition-all">
                                    <input
                                        id="busca-patrocinador"
                                        type="text"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Busque por nome, documento, contato ou cidade"
                                        className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"
                                    />
                                    <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                                </div>

                                <div className="relative">
                                    <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/30 border border-accent/40 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-60 h-full hover:bg-accent/40 transition-colors">
                                        <option value="" disabled>Ordenar por</option>
                                        {ordens.map((ordem) => (
                                            <option key={ordem} value={ordem}>{ordem}</option>
                                        ))}
                                    </select>
                                    <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {tipos.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setTipo(item)}
                                    className={`px-4 py-2 rounded-xl text-sm font-secondary border transition-all cursor-pointer ${tipo === item ? "bg-accent border-accent text-primary shadow-sm shadow-accent/20" : "bg-accent/25 border-accent/35 text-primary/70 hover:bg-accent/40"}`}
                                >
                                    {item === "Todos" ? "Todos" : item === "PJ" ? "Pessoa jurídica" : "Pessoa física"}
                                </button>
                            ))}
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
                                <div key={index} className="h-64 bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            <motion.div variants={itemVariants} className="xl:col-span-2 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : patrocinadoresFiltrados.length > 0 ? (
                            patrocinadoresFiltrados.map((patrocinador) => (
                                <motion.div key={patrocinador.id} variants={itemVariants}>
                                    <PatrocinadorCard patrocinador={patrocinador} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="xl:col-span-2 text-sm font-secondary text-primary/40 py-8 text-center">
                                Nenhum patrocinador encontrado.
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

const PatrocinadorCard = ({ patrocinador }) => {
    const navigate = useNavigate();
    const isPJ = patrocinador.tipo === "PJ";
    const documento = isPJ ? patrocinador.cnpj : patrocinador.cpf;
    const nome = getNomePatrocinador(patrocinador);
    const endereco = [
        patrocinador.logradouro,
        patrocinador.numero,
        patrocinador.bairro,
        patrocinador.cidade && patrocinador.uf ? `${patrocinador.cidade}/${patrocinador.uf}` : patrocinador.cidade || patrocinador.uf,
    ].filter(Boolean).join(", ");

    return (
        <div
            onClick={() => navigate(`/patrocinador/${patrocinador.id}`)}
            className="h-full bg-accent/50 rounded-3xl p-5 border border-accent/30 shadow-sm hover:shadow-md hover:bg-accent/60 transition-all flex flex-col gap-5 cursor-pointer"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-base-100/60 text-primary flex items-center justify-center shrink-0">
                        {isPJ ? <BuildingsIcon size={24} weight="light" /> : <IdentificationCardIcon size={24} weight="light" />}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <h2 className="text-xl font-primary font-bold text-primary truncate">{nome}</h2>
                        <span className="text-xs font-secondary text-primary/50 truncate">
                            {isPJ ? "Pessoa jurídica" : "Pessoa física"} {documento ? `| ${documento}` : ""}
                        </span>
                    </div>
                </div>
                <div className="badge badge-outline border-primary/20 text-primary/60 font-secondary">
                    {patrocinador.tipo}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoBlock label="E-mail" value={patrocinador.email} />
                <InfoBlock label="Responsável" value={patrocinador.nomeResponsavel} />
                <InfoBlock icon={<PhoneIcon size={18} weight="light" />} label="Telefone" value={patrocinador.telefone} />
                <InfoBlock icon={<MapPinIcon size={18} weight="light" />} label="Endereço" value={endereco || "Não informado"} />
            </div>

            {patrocinador.linkedin ? (
                <a
                    href={patrocinador.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-auto inline-flex items-center gap-2 w-fit text-sm font-secondary text-primary/70 hover:text-primary transition-colors"
                >
                    <LinkIcon size={18} weight="light" />
                    LinkedIn
                </a>
            ) : null}
        </div>
    );
};

const InfoBlock = ({ icon, label, value }) => (
    <div className="rounded-2xl bg-base-100/45 border border-base-100/50 p-4 min-w-0">
        <span className="flex items-center gap-2 text-xs font-secondary text-primary/45">
            {icon}
            {label}
        </span>
        <p className="mt-1 text-sm font-secondary text-primary/75 break-words">{value || "Não informado"}</p>
    </div>
);

const getNomePatrocinador = (patrocinador) => (
    patrocinador.nomeFantasia ||
    patrocinador.razaoSocial ||
    patrocinador.nomeCompleto ||
    patrocinador.email ||
    `Patrocinador #${patrocinador.id}`
);

export default Patrocinadores;
