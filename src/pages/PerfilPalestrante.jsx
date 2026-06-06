import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { 
    UserIcon, 
    MicrophoneStageIcon, 
    IdentificationCardIcon, 
    EnvelopeIcon, 
    GraduationCapIcon, 
    BriefcaseIcon,
    CalendarIcon,
    BuildingsIcon,
    ImageSquareIcon,
    LinkedinLogoIcon,
    TargetIcon,
    PencilSimpleIcon,
    XIcon,
    CheckCircleIcon,
    CircleNotchIcon
} from "@phosphor-icons/react";
import Avatar from "../utils/Avatar";
import { formatCpf } from "../utils/formatters";
import { useParams } from "react-router-dom";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
import { getAuthUser, isAdmin, isPalestrante, setAuthCookie } from "../utils/auth";

const toPalestranteForm = (data = {}) => ({
    id: data.id,
    nome: data.nome || "",
    cpf: formatCpf(data.cpf || ""),
    email: data.email || "",
    miniCurriculo: data.miniCurriculo || "",
    formacao: data.formacao || "",
    areaAtuacao: data.areaAtuacao || "",
    instituicao: data.instituicao || "",
    linkedin: data.linkedin || "",
    foto: data.foto || "",
    senha: "",
});

const toPalestrantePayload = (form) => {
    const payload = {
        id: form.id,
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        miniCurriculo: form.miniCurriculo,
        formacao: form.formacao,
        areaAtuacao: form.areaAtuacao,
        instituicao: form.instituicao,
        linkedin: form.linkedin,
        foto: form.foto,
    };

    if (form.senha?.trim()) {
        payload.senha = form.senha;
    }

    return payload;
};

const PerfilPalestrante = () => {
    const { id } = useParams();
    const user = useMemo(() => getAuthUser(), []);
    const [activeTab, setActiveTab] = useState("dados");

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

    const [palestrante, setPalestrante] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(toPalestranteForm());

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY || !id) {
                setLoading(false);
                return;
            }
            try { 
                const response = await api.get(`/palestrantes/${id}`);
                setPalestrante(response.data);
                setForm(toPalestranteForm(response.data));
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados", error);
                setError("Não foi possível resgatar os dados do palestrante.");
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
            setForm(toPalestranteForm(palestrante));
        } else {
            setActiveTab("dados");
        }
        setIsEditing((current) => !current);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const response = await api.put(`/palestrantes/${id}`, toPalestrantePayload(form));
            setPalestrante(response.data);
            setForm(toPalestranteForm(response.data));
            if (isPalestrante() && response.data.email && response.data.email !== user?.login) {
                setAuthCookie(JSON.stringify({
                    ...user,
                    login: response.data.email,
                }));
            }
            setIsEditing(false);
            toast.success("Palestrante atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar palestrante:", err);
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

    if (!palestrante) return null;

    const fotoPerfil = palestrante.foto?.trim();
    const canEdit = isAdmin() || (isPalestrante() && user?.login?.toLowerCase() === palestrante.email?.toLowerCase());

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
                                className="w-24 h-24 rounded-full border-4 border-accent shadow-lg flex-shrink-0 overflow-hidden bg-accent/20"
                            >
                                {fotoPerfil ? (
                                    <img src={fotoPerfil} alt={`Foto de ${palestrante.nome}`} className="w-full h-full object-cover" />
                                ) : (
                                    <Avatar email={palestrante.email} nome={palestrante.nome} className="w-full h-full rounded-full" />
                                )}
                            </motion.div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-primary text-primary font-bold">{palestrante.nome}</h1>
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="badge badge-primary font-secondary"
                                    >
                                        Especialista
                                    </motion.div>
                                </div>
                                <p className="text-primary/60 font-secondary mt-1">
                                    {palestrante.areaAtuacao || palestrante.instituicao || "Palestrante Convidado"}
                                </p>
                            </div>
                        </div>
                        {canEdit && (
                            <button
                                onClick={toggleEditing}
                                className={`btn border-0 rounded-xl shadow-none font-secondary text-primary z-10 ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                            >
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar Palestrante"}
                            </button>
                        )}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                    </motion.div>

                    {/* Navegação por Abas */}
                    <motion.div variants={itemVariants} className="flex gap-4 border-b border-primary/10">
                        {["dados", "palestras"].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-6 py-3 font-primary font-bold transition-all relative ${activeTab === tab ? "text-primary" : "text-primary/40 hover:text-primary/60"}`}
                            >
                                {tab === "dados" && <><UserIcon size={20} /> Dados e Formação</>}
                                {tab === "palestras" && <><MicrophoneStageIcon size={20} /> Palestras Ministradas</>}
                                
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTabPalestrante"
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
                                        <EditPalestranteForm
                                            form={form}
                                            saving={saving}
                                            onChange={updateForm}
                                            onSubmit={handleSave}
                                        />
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={formatCpf(palestrante.cpf || "") || "Não informado"} index={0} />
                                                <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail Profissional" value={palestrante.email} index={1} />
                                                <InfoCard icon={<TargetIcon size={24} />} label="Área de atuação" value={palestrante.areaAtuacao} index={2} />
                                                <InfoCard icon={<BuildingsIcon size={24} />} label="Instituição" value={palestrante.instituicao} index={3} />
                                                <InfoCard icon={<LinkedinLogoIcon size={24} />} label="LinkedIn" value={palestrante.linkedin} index={4} />
                                                <InfoCard icon={<ImageSquareIcon size={24} />} label="Foto" value={palestrante.foto} index={5} />
                                            </div>

                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-accent/5 p-8 rounded-3xl border border-accent/10 flex flex-col gap-6"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-primary font-primary font-bold text-xl">
                                                        <GraduationCapIcon size={24} weight="bold" />
                                                        Formação Acadêmica
                                                    </div>
                                                    <p className="text-primary/80 font-secondary text-lg ml-8">{palestrante.formacao || "Não informada"}</p>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-primary font-primary font-bold text-xl">
                                                        <BriefcaseIcon size={24} weight="bold" />
                                                        Mini currículo
                                                    </div>
                                                    <p className="text-primary/80 font-secondary leading-relaxed ml-8">{palestrante.miniCurriculo || "Sem mini currículo disponível."}</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )
                                )}

                                {activeTab === "palestras" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">
                                        {(palestrante.palestrasMinistradas || []).length > 0 ? (
                                            palestrante.palestrasMinistradas.map((palestra, idx) => (
                                                <motion.div 
                                                    key={palestra.id || idx} 
                                                    variants={itemVariants}
                                                    whileHover={{ x: 4 }}
                                                    className="bg-accent/10 p-6 rounded-2xl flex justify-between items-center hover:bg-accent/20 transition-all border border-accent/5"
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-xl font-primary font-bold text-primary">{palestra.titulo}</span>
                                                        <div className="flex items-center gap-4 text-sm font-secondary text-primary/60">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon size={16} />
                                                                {palestra.data}
                                                            </span>
                                                            <span className="mx-2 text-primary/20">|</span>
                                                            <span>Local: {palestra.local}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <div className="badge badge-accent font-secondary text-xs p-3">
                                                            {palestra.publico} Participantes
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-primary/40 text-center py-10 font-secondary">Nenhuma palestra ministrada registrada.</p>
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
            <span className="text-lg font-primary font-bold text-primary break-words">{value || "Não informado"}</span>
        </div>
    </motion.div>
);

const EditPalestranteForm = ({ form, saving, onChange, onSubmit }) => (
    <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-8 rounded-3xl border border-accent/10"
    >
        <h2 className="text-2xl font-primary text-primary font-bold md:col-span-2">Editar Dados do Palestrante</h2>

        <Field label="Nome Completo">
            <input required className={inputClass} value={form.nome || ""} onChange={(e) => onChange("nome", e.target.value)} />
        </Field>

        <Field label="CPF">
            <input maxLength={14} inputMode="numeric" className={inputClass} value={form.cpf || ""} onChange={(e) => onChange("cpf", formatCpf(e.target.value))} />
        </Field>

        <Field label="E-mail Profissional">
            <input type="email" className={inputClass} value={form.email || ""} onChange={(e) => onChange("email", e.target.value)} />
        </Field>

        <Field label="Área de Atuação">
            <input className={inputClass} value={form.areaAtuacao || ""} onChange={(e) => onChange("areaAtuacao", e.target.value)} />
        </Field>

        <Field label="Instituição">
            <input className={inputClass} value={form.instituicao || ""} onChange={(e) => onChange("instituicao", e.target.value)} />
        </Field>

        <Field label="LinkedIn">
            <input type="url" className={inputClass} value={form.linkedin || ""} onChange={(e) => onChange("linkedin", e.target.value)} />
        </Field>

        <Field label="Foto (URL)" className="md:col-span-2">
            <input type="url" className={inputClass} value={form.foto || ""} onChange={(e) => onChange("foto", e.target.value)} />
        </Field>

        <Field label="Formação" className="md:col-span-2">
            <input className={inputClass} value={form.formacao || ""} onChange={(e) => onChange("formacao", e.target.value)} />
        </Field>

        <Field label="Mini Currículo" className="md:col-span-2">
            <textarea className={`${inputClass} min-h-32 resize-y`} value={form.miniCurriculo || ""} onChange={(e) => onChange("miniCurriculo", e.target.value)} />
        </Field>

        <Field label="Nova Senha" className="md:col-span-2">
            <input type="password" placeholder="Deixe em branco para manter a senha atual" className={inputClass} value={form.senha || ""} onChange={(e) => onChange("senha", e.target.value)} />
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

export default PerfilPalestrante;
