import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeftIcon, BriefcaseIcon, CalendarIcon, CaretRightIcon, CheckCircleIcon, CircleNotchIcon, EnvelopeIcon, FileTextIcon, IdentificationCardIcon, ImageSquareIcon, PencilSimpleIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { formatCpf } from "../utils/formatters";
import Avatar from "../utils/Avatar";

const getBase64FromFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const result = String(reader.result || "");
        resolve({
            base64: result.split(",")[1] || "",
            preview: result,
        });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const toForm = (data = {}) => ({
    id: data.id,
    nome: data.nome || "",
    cpf: formatCpf(data.cpf || ""),
    email: data.email || "",
    cargo: data.cargo || "",
    assinatura: data.assinatura || "",
    assinaturaPreview: data.assinatura ? `data:image/png;base64,${data.assinatura}` : "",
});

const toPayload = (form) => ({
    id: form.id,
    nome: form.nome,
    cpf: form.cpf,
    email: form.email,
    cargo: form.cargo,
    assinatura: form.assinatura,
});

const formatarData = (data) => {
    if (!data) return "-";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
};

const AssinanteDetalhe = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const [assinante, setAssinante] = useState(null);
    const [eventosAssinados, setEventosAssinados] = useState([]);
    const [form, setForm] = useState(toForm());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!dbURL || !dbKEY || !id) {
                setLoading(false);
                return;
            }

            try {
                const [assinanteRes, eventosRes] = await Promise.all([
                    api.get(`/assinantes/${id}`),
                    api.get("/eventos"),
                ]);
                const assinanteData = assinanteRes.data;
                const nomeAssinante = String(assinanteData.nome || "").toLowerCase();

                setAssinante(assinanteData);
                setForm(toForm(assinanteData));
                setEventosAssinados((eventosRes.data || []).filter((evento) => (
                    (evento.assinantes || []).some((nome) => String(nome || "").toLowerCase() === nomeAssinante)
                )));
            } catch (err) {
                console.error("Erro ao buscar assinante", err);
                setError("Não foi possível carregar os dados do assinante.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, dbKEY, dbURL, id]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleAssinaturaChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const imagem = await getBase64FromFile(file);
        setForm((current) => ({
            ...current,
            assinatura: imagem.base64,
            assinaturaPreview: imagem.preview,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            const response = await api.put(`/assinantes/${id}`, toPayload(form));
            setAssinante(response.data);
            setForm(toForm(response.data));
            setIsEditing(false);
            toast.success("Assinante atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao salvar assinante", err);
            toast.error(err.response?.data?.message || err.response?.data?.erro || "Erro ao salvar assinante.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Deseja apagar este assinante?")) return;
        setDeleting(true);

        try {
            await api.delete(`/assinantes/${id}`);
            toast.success("Assinante apagado com sucesso!");
            navigate("/pessoas");
        } catch (err) {
            console.error("Erro ao apagar assinante", err);
            toast.error(err.response?.data?.message || err.response?.data?.erro || "Erro ao apagar assinante.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar compact />
                    <div className="pt-10 pl-5 pr-8 w-full flex flex-col gap-6">
                        <div className="h-40 bg-accent/10 rounded-3xl animate-pulse" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="h-24 bg-accent/10 rounded-2xl animate-pulse" />
                            <div className="h-24 bg-accent/10 rounded-2xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (error || !assinante) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar compact />
                    <div className="pt-10 pl-5 pr-8 w-full flex items-center justify-center">
                        <div className="text-error font-secondary text-center p-12 bg-error/5 rounded-3xl border border-dashed border-error/20">
                            {error || "Assinante não encontrado."}
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
                <Sidebar compact />
                <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <button type="button" onClick={() => navigate("/pessoas")} className="self-start btn btn-sm border-0 rounded-xl bg-accent/30 hover:bg-accent/50 text-primary font-secondary shadow-none">
                        <ArrowLeftIcon size={18} />
                        Pessoas
                    </button>

                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-accent/20 p-8 rounded-3xl relative overflow-hidden">
                        <div className="flex items-center gap-6 min-w-0">
                            <Avatar email={assinante.email} nome={assinante.nome} className="w-24 h-24 rounded-2xl object-cover shrink-0 border-4 border-accent/40" />
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 bg-accent/35 rounded-full px-3 py-1 font-secondary text-xs text-primary/70 mb-2">
                                    <FileTextIcon size={14} />
                                    Assinante
                                </div>
                                <h1 className="text-4xl font-primary text-primary font-bold truncate">{assinante.nome}</h1>
                                <p className="text-primary/60 font-secondary mt-1">{assinante.cargo}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setIsEditing((current) => !current)} className={`btn border-0 rounded-xl shadow-none font-secondary text-primary ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}>
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar"}
                            </button>
                            <button type="button" disabled={deleting} onClick={handleDelete} className="btn border-0 rounded-xl shadow-none font-secondary bg-error/15 hover:bg-error/25 text-error disabled:opacity-50">
                                {deleting ? <CircleNotchIcon size={20} className="animate-spin" /> : <TrashSimpleIcon size={20} />}
                                Apagar
                            </button>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.form key="edit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-8 rounded-3xl border border-accent/10">
                                <h2 className="text-2xl font-primary text-primary font-bold md:col-span-2">Editar Assinante</h2>

                                <Field label="Nome Completo">
                                    <input required className={inputClass} value={form.nome} onChange={(event) => updateForm("nome", event.target.value)} />
                                </Field>
                                <Field label="CPF">
                                    <input required maxLength={14} inputMode="numeric" className={inputClass} value={form.cpf} onChange={(event) => updateForm("cpf", formatCpf(event.target.value))} />
                                </Field>
                                <Field label="E-mail">
                                    <input required type="email" className={inputClass} value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
                                </Field>
                                <Field label="Cargo">
                                    <input required className={inputClass} value={form.cargo} onChange={(event) => updateForm("cargo", event.target.value)} />
                                </Field>
                                <Field label="Imagem da assinatura" className="md:col-span-2">
                                    <label className="flex flex-col items-center justify-center gap-3 min-h-44 rounded-2xl border-2 border-dashed border-accent/35 bg-base-100/45 hover:bg-accent/15 cursor-pointer transition-colors p-5">
                                        {form.assinaturaPreview ? (
                                            <img src={form.assinaturaPreview} alt="Prévia da assinatura" className="max-h-28 max-w-full object-contain rounded-xl bg-white p-3" />
                                        ) : (
                                            <ImageSquareIcon size={28} />
                                        )}
                                        <span className="text-sm font-secondary text-primary/65">Trocar imagem da assinatura</span>
                                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAssinaturaChange} />
                                    </label>
                                </Field>

                                <button disabled={saving} type="submit" className="md:col-span-2 w-full py-4 bg-accent text-primary rounded-xl font-primary font-bold flex items-center justify-center gap-2 hover:bg-accent/80 transition-all cursor-pointer disabled:opacity-50">
                                    {saving ? <CircleNotchIcon size={24} className="animate-spin" /> : <><CheckCircleIcon size={24} /> Salvar Alterações</>}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div key="view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={assinante.cpf} />
                                <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail" value={assinante.email} />
                                <InfoCard icon={<BriefcaseIcon size={24} />} label="Cargo" value={assinante.cargo} />
                                <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-primary font-primary font-bold">
                                        <ImageSquareIcon size={24} />
                                        Assinatura
                                    </div>
                                    {assinante.assinatura ? (
                                        <img src={`data:image/png;base64,${assinante.assinatura}`} alt="Assinatura" className="max-h-32 max-w-full object-contain rounded-xl bg-white p-4 self-start" />
                                    ) : (
                                        <p className="text-primary/45 font-secondary">Sem imagem cadastrada.</p>
                                    )}
                                </div>
                                <div className="md:col-span-2 bg-accent/5 p-6 rounded-2xl border border-accent/10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-primary font-primary font-bold">
                                            <CalendarIcon size={24} />
                                            Eventos assinados
                                        </div>
                                        <span className="text-xs font-secondary text-primary/45">{eventosAssinados.length} evento(s)</span>
                                    </div>

                                    {eventosAssinados.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {eventosAssinados.map((evento) => (
                                                <button
                                                    key={evento.id}
                                                    type="button"
                                                    onClick={() => navigate(`/evento/${evento.id}`)}
                                                    className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 items-center text-left bg-accent/15 hover:bg-accent/25 border border-accent/10 rounded-2xl px-4 py-3 transition-colors cursor-pointer"
                                                >
                                                    <span className="font-primary font-bold text-primary truncate">{evento.titulo}</span>
                                                    <span className="text-xs font-secondary text-primary/60">Início: {formatarData(evento.dataInicio)}</span>
                                                    <span className="flex items-center gap-2 text-xs font-secondary text-primary/60">
                                                        Fim: {formatarData(evento.dataFim)}
                                                        <CaretRightIcon size={16} />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-secondary text-primary/45 bg-accent/15 rounded-2xl p-4">Este assinante ainda não está vinculado a eventos.</p>
                                    )}
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
        <div className="bg-accent/20 p-3 rounded-xl text-primary">{icon}</div>
        <div className="flex flex-col min-w-0">
            <span className="text-xs font-secondary text-primary/50 uppercase tracking-wider">{label}</span>
            <span className="text-lg font-primary font-bold text-primary break-words">{value || "Não informado"}</span>
        </div>
    </div>
);

const inputClass = "w-full p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent";

export default AssinanteDetalhe;
