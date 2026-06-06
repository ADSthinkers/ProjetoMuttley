import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { UserIcon, BookOpenIcon, MedalIcon, IdentificationCardIcon, EnvelopeIcon, HashIcon, TrophyIcon, PencilSimpleIcon, XIcon, CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import Avatar from "../utils/Avatar";
import { useParams } from "react-router-dom";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { isAdmin } from "../utils/auth";
import { formatCpf } from "../utils/formatters";

const toParticipanteForm = (data = {}) => ({
    nome: data.nome || "",
    ra: data.ra || "",
    cpf: formatCpf(data.cpf || ""),
    email: data.email || "",
    email2: data.email2 || "",
    telefone: data.telefone || "",
    curso: data.curso || "",
});

const PerfilParticipante = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("dados");
    const canEdit = isAdmin();

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

    const [participante, setParticipante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(toParticipanteForm());

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY || !id) {
                setLoading(false);
                return;
            }
            try { 
                const [participanteRes, palestrasRes, competenciasRes, medalhasRes, xpsRes, horasRes] = await Promise.all([
                    api.get(`/participantes/${id}`),
                    api.get(`/participantes/${id}/palestras`),
                    api.get(`/participantes/${id}/competencias`),
                    api.get(`/medalhas/participante/${id}`),
                    api.get(`/xps/participante/${id}`),
                    api.get(`/participantes/${id}/horas`)
                ]);
                setParticipante({
                    ...participanteRes.data,
                    palestras: palestrasRes.data,
                    competencias: competenciasRes.data,
                    medalhas: medalhasRes.data,
                    xps: xpsRes.data,
                    totalHoras: horasRes.data?.totalHoras || 0
                });
                setForm(toParticipanteForm(participanteRes.data));
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
                setError("Não foi possível resgatar os dados do participante.");
                setLoading(false);
            }
        };
        fetchData();
    }, [api, id]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const toggleEditing = () => {
        if (isEditing) {
            setForm(toParticipanteForm(participante));
        } else {
            setActiveTab("dados");
        }
        setIsEditing((current) => !current);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const response = await api.put(`/participantes/${id}`, form);
            setParticipante((current) => ({
                ...current,
                ...response.data,
            }));
            setForm(toParticipanteForm(response.data));
            setIsEditing(false);
            toast.success("Participante atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar participante:", err);
            const message = err.response?.data?.message
                || err.response?.data?.erro
                || "Erro ao salvar alterações.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar />
                    <div className="pt-10 pl-5 pr-8 w-full flex flex-col gap-8">
                        <div className="w-full h-40 bg-accent/10 animate-pulse rounded-3xl" />
                        <div className="flex gap-4 border-b border-primary/10">
                            <div className="w-32 h-10 bg-accent/10 animate-pulse rounded-t-lg" />
                            <div className="w-32 h-10 bg-accent/10 animate-pulse rounded-t-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-24 bg-accent/10 animate-pulse rounded-2xl" />
                            <div className="h-24 bg-accent/10 animate-pulse rounded-2xl" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar />
                    <div className="pt-10 pl-5 pr-8 w-full flex items-center justify-center">
                        <div className="text-error font-secondary text-center p-12 bg-error/5 rounded-3xl border border-dashed border-error/20">
                            {error}
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (!participante) return null;

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-8">
                    
                    {/* Cabeçalho do Perfil */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-accent/20 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center gap-6 z-10">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="w-24 h-24 rounded-full border-4 border-accent shadow-lg flex-shrink-0"
                            >
                                <Avatar email={participante.email} nome={participante.nome} className="w-full h-full rounded-full" />
                            </motion.div>
                            <div className="flex flex-col">
                                <h1 className="text-4xl font-primary text-primary font-bold">{participante.nome}</h1>
                                <p className="text-primary/60 font-secondary">{participante.curso || "Participante"}</p>
                            </div>
                        </div>
                        {canEdit && (
                            <button
                                onClick={toggleEditing}
                                className={`btn border-0 rounded-xl shadow-none font-secondary text-primary z-10 ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                            >
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar Participante"}
                            </button>
                        )}
                        {/* Subtle background decoration */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                    </motion.div>

                    {/* Navegação por Abas */}
                    <motion.div variants={itemVariants} className="flex gap-4 border-b border-primary/10">
                        {["dados", "palestras", "competencias", "medalhas"].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-6 py-3 font-primary font-bold transition-all relative ${activeTab === tab ? "text-primary" : "text-primary/40 hover:text-primary/60"}`}
                            >
                                {tab === "dados" && <><UserIcon size={20} /> Dados Pessoais</>}
                                {tab === "palestras" && <><BookOpenIcon size={20} /> Palestras</>}
                                {tab === "competencias" && <><MedalIcon size={20} /> Competências</>}
                                {tab === "medalhas" && <><TrophyIcon size={20} /> Medalhas</>}
                                
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>

                    {/* Conteúdo das Abas */}
                    <div className="flex-1 pb-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "dados" && (
                                    isEditing ? (
                                        <EditParticipanteForm
                                            form={form}
                                            saving={saving}
                                            onChange={updateForm}
                                            onSubmit={handleSave}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={formatCpf(participante.cpf || "")} index={0} />
                                            <InfoCard icon={<HashIcon size={24} />} label="RA" value={participante.ra} index={1} />
                                            <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail" value={participante.email} index={2} />
                                            <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail secundário" value={participante.email2} index={3} />
                                            <InfoCard icon={<HashIcon size={24} />} label="Telefone" value={participante.telefone} index={4} />
                                            <InfoCard icon={<UserIcon size={24} />} label="Curso" value={participante.curso} index={5} />
                                        </div>
                                    )
                                )}

                                {activeTab === "palestras" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">
                                        {(participante.palestras || []).length > 0 ? (
                                            participante.palestras.map((palestra, idx) => (
                                                <motion.div 
                                                    key={palestra.id || idx} 
                                                    variants={itemVariants}
                                                    whileHover={{ x: 4 }}
                                                    className="bg-accent/10 p-5 rounded-2xl flex justify-between items-center hover:bg-accent/20 transition-all border border-accent/5"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-lg font-primary font-bold text-primary">{palestra.titulo}</span>
                                                        <span className="text-sm font-secondary text-primary/60">Palestrantes: {(palestra.palestrantes || []).join(", ") || "Não informado"}</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-sm font-secondary font-bold text-primary">{palestra.inicio ? new Date(palestra.inicio).toLocaleDateString("pt-BR") : ""}</span>
                                                        <span className="badge badge-accent badge-outline mt-1 font-secondary text-[10px] py-2 px-2">Participou</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-primary/40 text-center py-10 font-secondary">Nenhuma palestra registrada.</p>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "competencias" && (
                                    <CompetenciasXp participante={participante} />
                                )}

                                {activeTab === "medalhas" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">
                                        {(participante.medalhas || []).length > 0 ? (
                                            <div className="overflow-hidden rounded-3xl border border-accent/10 bg-accent/5">
                                                <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr] gap-4 bg-accent/20 px-5 py-4 text-xs font-secondary font-bold uppercase text-primary/50">
                                                    <span>Tipo</span>
                                                    <span>Nome</span>
                                                    <span>Palestra</span>
                                                    <span>Data</span>
                                                </div>
                                                <div className="divide-y divide-accent/10">
                                                    {participante.medalhas.map((medalha, index) => (
                                                        <motion.div
                                                            key={medalha.id || index}
                                                            variants={itemVariants}
                                                            whileHover={{ backgroundColor: "rgba(252, 209, 96, 0.16)" }}
                                                            className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr_1fr] gap-4 px-5 py-5 items-start"
                                                        >
                                                            <div>
                                                                <span className={`badge border-0 font-secondary ${getMedalhaBadgeClass(medalha.tipo)}`}>
                                                                    {formatarMedalhaTipo(medalha.tipo)}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-lg font-primary font-bold text-primary">{medalha.nome || "Medalha"}</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(medalha.competenciasNomes || []).length > 0 ? medalha.competenciasNomes.map((competencia) => (
                                                                        <span key={competencia} className="badge badge-sm border-0 bg-info/10 text-info font-secondary">
                                                                            {competencia}
                                                                        </span>
                                                                    )) : (
                                                                        <span className="text-xs font-secondary text-primary/35">Sem competências vinculadas</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-secondary text-primary/70">{medalha.palestraTitulo || "-"}</span>
                                                            <span className="text-sm font-secondary font-semibold text-primary">
                                                                {medalha.dataConquista ? new Date(`${medalha.dataConquista}T00:00:00`).toLocaleDateString("pt-BR") : "-"}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-accent/5 border border-dashed border-accent/20 rounded-3xl p-10 text-center">
                                                <TrophyIcon size={42} className="mx-auto text-primary/25" />
                                                <p className="text-primary/40 text-center mt-3 font-secondary">Nenhuma medalha conquistada.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

const formatarMedalhaTipo = (tipo) => {
    if (!tipo) return "Medalha";
    return tipo.toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};

const getMedalhaBadgeClass = (tipo) => {
    if (tipo === "APRESENTACAO") return "bg-info/15 text-info";
    if (tipo === "COMPETENCIA") return "bg-right/15 text-right";
    if (tipo === "ORGANIZACAO") return "bg-secondary/60 text-primary";
    if (tipo === "CONCLUSAO") return "bg-accent text-primary";
    return "bg-warning/20 text-primary";
};

const CompetenciasXp = ({ participante }) => {
    const competenciasComXp = montarCompetenciasComXp(participante);
    const totalHoras = competenciasComXp.reduce((total, competencia) => total + Number(competencia.horas || 0), 0);
    const geral = calcularNivel(totalHoras);

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-5">
            <motion.div variants={itemVariants} className="bg-accent/10 border border-accent/15 rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <p className="text-xs font-secondary uppercase text-primary/40 font-bold">Progressão geral</p>
                        <h2 className="text-2xl font-primary font-bold text-primary">Nível {geral.nivel}</h2>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-2xl font-primary font-bold text-primary">{formatarHoras(totalHoras)}h</p>
                        <p className="text-xs font-secondary text-primary/45">horas totais</p>
                    </div>
                </div>
                <ProgressBar progress={geral.progresso} />
                <div className="flex items-center justify-between text-xs font-secondary text-primary/50">
                    <span>Nível {geral.nivel}</span>
                    <span>{formatarHoras(geral.horasRestantes)}h para o nível {geral.nivel + 1}</span>
                </div>
            </motion.div>

            {competenciasComXp.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {competenciasComXp.map((competencia, index) => {
                        const nivel = calcularNivel(competencia.horas);
                        return (
                            <motion.div
                                key={competencia.id || index}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                className="bg-accent/10 border border-accent/10 rounded-3xl p-5 flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-primary font-bold text-primary truncate">{competencia.nome}</h3>
                                        <p className="text-xs font-secondary text-primary/45">{formatarTipoCompetencia(competencia.tipo)}</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-accent/40 flex items-center justify-center text-primary font-primary font-bold text-lg shrink-0">
                                        {nivel.nivel}
                                    </div>
                                </div>

                                <ProgressBar progress={nivel.progresso} />

                                <div className="grid grid-cols-2 gap-3">
                                    <XpMetric label="Nível" value={nivel.nivel} />
                                    <XpMetric label="Horas totais" value={`${formatarHoras(competencia.horas)}h`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-accent/5 border border-dashed border-accent/20 rounded-3xl p-10 text-center">
                    <MedalIcon size={42} className="mx-auto text-primary/25" />
                    <p className="text-primary/40 text-center mt-3 font-secondary">Nenhum XP de competência registrado.</p>
                </div>
            )}
        </motion.div>
    );
};

const montarCompetenciasComXp = (participante) => {
    const competencias = participante.competencias || [];
    const xps = participante.xps || [];
    const competenciasPorId = new Map(competencias.map((competencia) => [competencia.id, competencia]));
    const horasPorCompetenciaId = new Map(xps.map((xp) => [xp.competenciaId, Number(xp.horas || 0)]));

    const daListaCompetencias = competencias.map((competencia) => ({
        id: competencia.id,
        nome: competencia.nome,
        tipo: competencia.tipo,
        horas: horasPorCompetenciaId.get(competencia.id) || 0
    }));

    const apenasXpSemCompetencia = xps
        .filter((xp) => !competenciasPorId.has(xp.competenciaId))
        .map((xp) => ({
            id: xp.competenciaId,
            nome: `Competência #${xp.competenciaId}`,
            tipo: null,
            horas: Number(xp.horas || 0)
        }));

    return [...daListaCompetencias, ...apenasXpSemCompetencia]
        .filter((competencia) => competencia.id != null)
        .map((competencia) => {
            const competenciaCadastrada = competenciasPorId.get(competencia.id);
            return {
                ...competencia,
                nome: competenciaCadastrada?.nome || competencia.nome,
                tipo: competenciaCadastrada?.tipo || competencia.tipo
            };
        })
        .sort((a, b) => b.horas - a.horas || a.nome.localeCompare(b.nome));
};

const calcularNivel = (horas) => {
    const total = Math.max(0, Number(horas || 0));
    const nivel = Math.floor(total / 5) + 1;
    const progresso = ((total % 5) / 5) * 100;
    const horasRestantes = progresso === 0 && total > 0 ? 5 : 5 - (total % 5);

    return {
        nivel,
        progresso,
        horasRestantes: Math.min(5, horasRestantes)
    };
};

const ProgressBar = ({ progress }) => (
    <div className="h-4 rounded-full bg-base-100 border border-accent/20 overflow-hidden">
        <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
    </div>
);

const XpMetric = ({ label, value }) => (
    <div className="bg-base-100/60 rounded-2xl p-4 border border-accent/10">
        <p className="text-[10px] font-secondary uppercase text-primary/40 font-bold">{label}</p>
        <p className="text-lg font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

const formatarHoras = (horas) => {
    const value = Number(horas || 0);
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const formatarTipoCompetencia = (tipo) => {
    if (tipo === "HARD_SKILL") return "Hard Skill";
    if (tipo === "SOFT_SKILL") return "Soft Skill";
    return "Sem tipo";
};

const EditParticipanteForm = ({ form, saving, onChange, onSubmit }) => (
    <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-8 rounded-3xl border border-accent/10"
    >
        <h2 className="text-2xl font-primary text-primary font-bold md:col-span-2">Editar Dados do Participante</h2>

        <Field label="Nome Completo">
            <input required className={inputClass} value={form.nome || ""} onChange={(e) => onChange("nome", e.target.value)} />
        </Field>

        <Field label="CPF">
            <input required maxLength={14} inputMode="numeric" className={inputClass} value={form.cpf || ""} onChange={(e) => onChange("cpf", formatCpf(e.target.value))} />
        </Field>

        <Field label="RA">
            <input className={inputClass} value={form.ra || ""} onChange={(e) => onChange("ra", e.target.value)} />
        </Field>

        <Field label="E-mail Principal">
            <input required type="email" className={inputClass} value={form.email || ""} onChange={(e) => onChange("email", e.target.value)} />
        </Field>

        <Field label="E-mail Secundário">
            <input type="email" className={inputClass} value={form.email2 || ""} onChange={(e) => onChange("email2", e.target.value)} />
        </Field>

        <Field label="Telefone">
            <input className={inputClass} value={form.telefone || ""} onChange={(e) => onChange("telefone", e.target.value)} />
        </Field>

        <Field label="Curso" className="md:col-span-2">
            <input className={inputClass} value={form.curso || ""} onChange={(e) => onChange("curso", e.target.value)} />
        </Field>

        <button
            disabled={saving}
            type="submit"
            className="md:col-span-2 w-full py-4 bg-accent text-primary rounded-xl font-primary font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all cursor-pointer disabled:opacity-50"
        >
            {saving ? <CircleNotchIcon size={24} className="animate-spin" /> : <><CheckCircleIcon size={24} /> Salvar Alterações</>}
        </button>
    </motion.form>
);

const Field = ({ label, children, className = "" }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-sm font-secondary font-bold text-primary/60 uppercase">{label}</label>
        {children}
    </div>
);

const inputClass = "w-full p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent";

const InfoCard = ({ icon, label, value, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="bg-accent/5 p-6 rounded-2xl border border-accent/10 flex items-center gap-4"
    >
        <div className="bg-accent/20 p-3 rounded-xl text-primary">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-secondary text-primary/50 uppercase tracking-wider">{label}</span>
            <span className="text-lg font-primary font-bold text-primary">{value || "-"}</span>
        </div>
    </motion.div>
);

export default PerfilParticipante;
