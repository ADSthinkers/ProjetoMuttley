import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { CaretDownIcon, GraduationCapIcon, MagnifyingGlassIcon, UsersIcon } from "@phosphor-icons/react";
import ParticipanteCard from "../components/ParticipanteCard";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';

const Participantes = () => {
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

    const [participantes, setParticipantes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY) {
                setLoading(false);
                return;
            }
            try { 
                const response = await api.get('/participantes');
                setParticipantes(response.data);
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

    const ordens = ["Nome (A-Z)", "Nome (Z-A)"]

    const participantesFiltrados = (participantes || [])
        .filter(p => 
            p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.email.toLowerCase().includes(busca.toLowerCase()) ||
            p.email2?.toLowerCase().includes(busca.toLowerCase()) ||
            p.cpf.toLowerCase().includes(busca.toLowerCase()) ||
            p.ra?.toLowerCase().includes(busca.toLowerCase()) ||
            p.curso?.toLowerCase().includes(busca.toLowerCase())
        )
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.nome.localeCompare(b.nome)
            if (ordenar === "Nome (Z-A)") return b.nome.localeCompare(a.nome)
            return 0
        })

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-8 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <UsersIcon size={16} weight="fill" />
                                Comunidade
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Participantes</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">
                                Consulte alunos, dados de contato e vínculos acadêmicos.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full xl:w-auto">
                            <MetricCard icon={<UsersIcon size={20} />} label="Exibindo" value={participantesFiltrados.length} />
                            <MetricCard icon={<GraduationCapIcon size={20} />} label="Total" value={(participantes || []).length} />
                        </div>
                    </motion.div>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-4 flex flex-col gap-3">
                        <div className="flex flex-col lg:flex-row gap-3">
                            {/* Campo de busca */}
                            <div className="flex items-center gap-3 flex-1 bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar por nome, e-mail, CPF, RA ou curso" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/35 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            {/* Ordenar por */}
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
                    </motion.div>

                    {/* Lista de participantes */}
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
                    >
                        {loading ? (
                            // Skeleton Loading
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-full h-72 bg-accent/10 animate-pulse rounded-3xl" />
                            ))
                        ) : error ? (
                            // Mensagem de Erro
                            <motion.div variants={itemVariants} className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20">
                                {error}
                            </motion.div>
                        ) : participantesFiltrados.length > 0 ? (
                            // Lista de Participantes
                            participantesFiltrados.map(participante => (
                                <motion.div key={participante.id} variants={itemVariants}>
                                    <ParticipanteCard participante={participante}/>
                                </motion.div>
                            ))
                        ) : (
                            // Lista Vazia
                            <motion.div variants={itemVariants} className="md:col-span-2 2xl:col-span-3 text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 border border-dashed border-accent/20 rounded-3xl">
                                Nenhum participante encontrado.
                            </motion.div>
                            )
                        }
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

export default Participantes;
