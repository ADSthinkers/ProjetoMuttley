import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { 
    UserIcon, 
    IdentificationCardIcon, 
    EnvelopeIcon, 
    HashIcon, 
    PencilSimpleIcon, 
    XIcon, 
    CheckCircleIcon,
    CircleNotchIcon,
    GraduationCapIcon,
    BriefcaseIcon,
    TargetIcon,
    BuildingsIcon,
    LinkedinLogoIcon,
    ImageSquareIcon
} from "@phosphor-icons/react";
import Avatar from "../utils/Avatar";
import { getAuthUser, isAdmin } from "../utils/auth";
import PageTransition, { itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { formatCpf } from "../utils/formatters";

const toProfileForm = (data = {}) => ({
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
});

const Perfil = () => {
    const user = useMemo(() => getAuthUser(), []);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

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

    const [form, setForm] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                if (isAdmin()) {
                    setLoading(false);
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error("Erro ao buscar perfil:", err);
                setError("Não foi possível carregar os dados do perfil.");
                setLoading(false);
            }
        };
        fetchData();
    }, [api, user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = null;
            
            if (response) {
                setUserData(response.data);
                setForm(toProfileForm(response.data));
                setIsEditing(false);
                toast.success("Perfil atualizado com sucesso!");
            }
        } catch (err) {
            console.error("Erro ao salvar perfil:", err);
            const message = err.response?.data?.message
                || err.response?.data?.erro
                || "Erro ao salvar alterações.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleEditing = () => {
        if (isEditing) {
            setForm(toProfileForm(userData));
        }
        setIsEditing((current) => !current);
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar />
                    <div className="pt-10 pl-5 pr-8 w-full animate-pulse flex flex-col gap-8">
                        <div className="h-40 w-full bg-accent/10 rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-24 bg-accent/10 rounded-2xl" />
                            <div className="h-24 bg-accent/10 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (isAdmin() && !userData) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar />
                    <div className="pt-10 pl-5 pr-8 w-full flex flex-col gap-6">
                        <h1 className="text-4xl font-primary text-primary font-bold">Meu Perfil</h1>
                        <p className="text-primary/60 font-secondary">Você está logado como Administrador. Perfis administrativos não possuem dados editáveis nesta seção.</p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error || !userData) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar />
                    <div className="pt-10 pl-5 pr-8 w-full flex items-center justify-center">
                        <div className="text-error font-secondary text-center p-12 bg-error/5 rounded-3xl border border-dashed border-error/20">
                            {error || "Dados de perfil não encontrados."}
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-8 pb-10">
                    
                    {/* Cabeçalho do Perfil */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-accent/20 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="flex items-center gap-6 z-10">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 rounded-full border-4 border-accent shadow-lg flex-shrink-0 overflow-hidden bg-accent/20"
                            >
                                {userData.foto ? (
                                    <img src={userData.foto} alt="Perfil" className="w-full h-full object-cover" />
                                ) : (
                                    <Avatar email={userData.email} nome={userData.nome} className="w-full h-full rounded-full" />
                                )}
                            </motion.div>
                            <div className="flex flex-col">
                                <h1 className="text-4xl font-primary text-primary font-bold">{userData.nome}</h1>
                                <p className="text-primary/60 font-secondary">Usuário</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={toggleEditing}
                            className={`btn border-0 rounded-xl shadow-none font-secondary text-primary z-10 ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                        >
                            {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                            {isEditing ? "Cancelar" : "Editar Perfil"}
                        </button>
                        
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.form 
                                key="edit-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onSubmit={handleSave}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-8 rounded-3xl border border-accent/10"
                            >
                                <h2 className="text-2xl font-primary text-primary font-bold md:col-span-2">Editar Dados Pessoais</h2>
                                
                                <Field label="Nome Completo">
                                    <input required className="w-full p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary" value={form.nome || ""} onChange={e => updateForm("nome", e.target.value)} />
                                </Field>

                                <Field label="CPF">
                                    <input required maxLength={14} inputMode="numeric" className="w-full p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary" value={form.cpf || ""} onChange={e => updateForm("cpf", formatCpf(e.target.value))} />
                                </Field>

                                <Field label="E-mail">
                                    <input required type="email" className="w-full p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary" value={form.email || ""} onChange={e => updateForm("email", e.target.value)} />
                                </Field>

                                <button 
                                    disabled={saving}
                                    type="submit"
                                    className="md:col-span-2 w-full py-4 bg-accent text-primary rounded-xl font-primary font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? <CircleNotchIcon size={24} className="animate-spin" /> : <><CheckCircleIcon size={24} /> Salvar Alterações</>}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div 
                                key="view-profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={userData.cpf} />
                                    <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail" value={userData.email} />
                                    
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
};

const Field = ({ label, children, className = "" }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-sm font-secondary font-bold text-primary/60 uppercase">{label}</label>
        {children}
    </div>
);

const InfoCard = ({ icon, label, value }) => (
    <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10 flex items-center gap-4">
        <div className="bg-accent/20 p-3 rounded-xl text-primary">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-secondary text-primary/50 uppercase tracking-wider">{label}</span>
            <span className="text-lg font-primary font-bold text-primary">{value || "Não informado"}</span>
        </div>
    </div>
);

export default Perfil;
