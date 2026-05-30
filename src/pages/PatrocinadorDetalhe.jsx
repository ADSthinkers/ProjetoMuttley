import Sidebar from "../components/Sidebar";
import {
    ArrowLeftIcon,
    BuildingsIcon,
    CircleNotchIcon,
    IdentificationCardIcon,
    LinkIcon,
    MapPinIcon,
    PencilSimpleIcon,
    PhoneIcon,
    SlidersHorizontalIcon,
    TrashSimpleIcon,
    XIcon,
    InfoIcon,
    EnvelopeIcon,
    UserIcon
} from "@phosphor-icons/react";
import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";

const tipos = [
    { value: "PJ", label: "Pessoa Jurídica" },
    { value: "PF", label: "Pessoa Física" }
];

const getNomePatrocinador = (p) => {
    if (!p) return "-";
    return p.nomeFantasia || p.razaoSocial || p.nomeCompleto || p.email || `Patrocinador #${p.id}`;
};

const PatrocinadorDetalhe = () => {
    const { idPat } = useParams();
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

    const [activeTab, setActiveTab] = useState("detalhes");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [patData, setPatData] = useState(null);

    const [form, setForm] = useState({
        tipo: "PJ",
        razaoSocial: "",
        nomeFantasia: "",
        cnpj: "",
        inscricaoEstadual: "",
        nomeCompleto: "",
        cpf: "",
        telefone: "",
        email: "",
        nomeResponsavel: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cep: "",
        cidade: "",
        uf: "",
        linkedin: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!idPat) return;

            try {
                const response = await api.get(`/patrocinadores/${idPat}`);
                const pat = response.data;

                setPatData(pat);
                setForm({
                    tipo: pat.tipo || "PJ",
                    razaoSocial: pat.razaoSocial || "",
                    nomeFantasia: pat.nomeFantasia || "",
                    cnpj: pat.cnpj || "",
                    inscricaoEstadual: pat.inscricaoEstadual || "",
                    nomeCompleto: pat.nomeCompleto || "",
                    cpf: pat.cpf || "",
                    telefone: pat.telefone || "",
                    email: pat.email || "",
                    nomeResponsavel: pat.nomeResponsavel || "",
                    logradouro: pat.logradouro || "",
                    numero: pat.numero || "",
                    complemento: pat.complemento || "",
                    bairro: pat.bairro || "",
                    cep: pat.cep || "",
                    cidade: pat.cidade || "",
                    uf: pat.uf || "",
                    linkedin: pat.linkedin || ""
                });
            } catch (err) {
                console.error("Erro ao buscar patrocinador:", err);
                setError("Não foi possível carregar os detalhes do patrocinador.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, idPat]);

    const houveAlteracao = useMemo(() => {
        if (!patData) return false;

        return Object.keys(form).some(key => form[key] !== (patData[key] || ""));
    }, [patData, form]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await api.put(`/patrocinadores/${idPat}`, form);
            setPatData(response.data);
            setForm({
                tipo: response.data.tipo || "PJ",
                razaoSocial: response.data.razaoSocial || "",
                nomeFantasia: response.data.nomeFantasia || "",
                cnpj: response.data.cnpj || "",
                inscricaoEstadual: response.data.inscricaoEstadual || "",
                nomeCompleto: response.data.nomeCompleto || "",
                cpf: response.data.cpf || "",
                telefone: response.data.telefone || "",
                email: response.data.email || "",
                nomeResponsavel: response.data.nomeResponsavel || "",
                logradouro: response.data.logradouro || "",
                numero: response.data.numero || "",
                complemento: response.data.complemento || "",
                bairro: response.data.bairro || "",
                cep: response.data.cep || "",
                cidade: response.data.cidade || "",
                uf: response.data.uf || "",
                linkedin: response.data.linkedin || ""
            });
            setIsEditing(false);
            toast.success("Patrocinador atualizado com sucesso.");
        } catch (err) {
            console.error("Erro ao salvar patrocinador:", err);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/patrocinadores/${idPat}`);
            toast.success("Patrocinador removido.");
            window.history.back();
        } catch (err) {
            console.error("Erro ao remover patrocinador:", err);
            toast.error("Erro ao remover patrocinador.");
        }
    };

    if (loading) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar compact={true} />
                    <div className="pt-10 pl-5 pr-12 w-full animate-pulse flex flex-col gap-6">
                        <div className="h-28 w-full bg-accent/10 rounded-3xl" />
                        <div className="h-14 w-full bg-accent/10 rounded-2xl" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="h-32 bg-accent/10 rounded-2xl" />
                            <div className="h-32 bg-accent/10 rounded-2xl" />
                            <div className="h-32 bg-accent/10 rounded-2xl" />
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
                    <Sidebar compact={true} />
                    <div className="pt-10 pl-5 pr-12 w-full flex items-center justify-center">
                        <div className="text-error font-secondary text-center p-12 bg-error/5 rounded-3xl border border-dashed border-error/20">
                            {error}
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
                <Sidebar compact={true} />
                <div className="pt-10 pl-5 pr-12 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="self-start btn btn-sm border-0 rounded-xl bg-accent/30 hover:bg-accent/50 text-primary font-secondary shadow-none"
                    >
                        <ArrowLeftIcon size={18} />
                        Voltar
                    </button>

                    <motion.div variants={itemVariants} className="bg-accent/20 rounded-3xl p-7 flex flex-col gap-5 border border-accent/10">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                            <div className="flex flex-col gap-2 min-w-0">
                                <div className="flex items-center gap-2 text-xs font-secondary text-primary/50 uppercase">
                                    {patData?.tipo === "PJ" ? <BuildingsIcon size={16} /> : <IdentificationCardIcon size={16} />}
                                    Patrocinador {patData?.tipo}
                                </div>
                                <h1 className="text-4xl font-primary text-primary font-bold truncate">{getNomePatrocinador(patData)}</h1>
                                <p className="text-sm font-secondary text-primary/65 max-w-4xl">
                                    {patData?.tipo === "PJ" ? patData?.razaoSocial : patData?.email}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("detalhes");
                                    setIsEditing((current) => !current);
                                }}
                                className={`btn border-0 rounded-xl shadow-none font-secondary text-primary ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                                title={isEditing ? "Cancelar edição" : "Editar patrocinador"}
                            >
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <SummaryPill icon={<EnvelopeIcon size={18} />} label="E-mail" value={patData?.email} />
                            <SummaryPill icon={<PhoneIcon size={18} />} label="Telefone" value={patData?.telefone} />
                            <SummaryPill icon={<MapPinIcon size={18} />} label="Localidade" value={`${patData?.cidade}/${patData?.uf}`} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="tabs tabs-box bg-accent/30 rounded-2xl p-1 w-full">
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "detalhes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`}
                            onClick={() => setActiveTab("detalhes")}
                        >
                            <InfoIcon size={20} />
                            Detalhes
                        </button>
                        <button
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "acoes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`}
                            onClick={() => setActiveTab("acoes")}
                        >
                            <SlidersHorizontalIcon size={20} />
                            Ações
                        </button>
                    </motion.div>

                    {activeTab === "detalhes" && (
                        isEditing ? (
                            <PatrocinadorEditForm
                                form={form}
                                updateForm={updateForm}
                                saving={saving}
                                houveAlteracao={houveAlteracao}
                                handleSave={handleSave}
                            />
                        ) : (
                            <PatrocinadorDetails patData={patData} />
                        )
                    )}

                    {activeTab === "acoes" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <ActionCard
                                icon={<ArrowLeftIcon size={44} />}
                                title="Voltar"
                                description="Retorna para a página anterior sem alterar o patrocinador."
                                buttonLabel="Voltar"
                                onClick={() => window.history.back()}
                            />
                            <ActionCard
                                danger
                                icon={<TrashSimpleIcon size={44} />}
                                title="Apagar patrocinador"
                                description="Remove este patrocinador permanentemente do sistema."
                                buttonLabel="Apagar permanentemente"
                                onClick={() => document.getElementById("modal_confirmar_apagar_patrocinador").showModal()}
                            />
                        </div>
                    )}
                </div>
            </div>

            <dialog id="modal_confirmar_apagar_patrocinador" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-[color-mix(in_srgb,var(--color-error),white_80%)] border border-error/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <form method="dialog">
                        <button className="btn btn-sm btn-error btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">x</button>
                    </form>
                    <div className="w-20 h-20 bg-error/20 rounded-xl flex items-center justify-center">
                        <TrashSimpleIcon size={36} className="text-error" weight="fill" />
                    </div>
                    <h3 className="text-2xl font-primary text-primary font-bold">Apagar patrocinador?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a apagar <span className="font-semibold text-primary">"{getNomePatrocinador(patData)}"</span>. Esta ação não poderá ser desfeita.
                    </p>
                    <div className="modal-action w-full flex gap-3 mt-4">
                        <form method="dialog" className="flex-1">
                            <button className="w-full py-4 rounded-xl text-sm font-secondary font-medium text-primary/60 hover:bg-black/5 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                        </form>
                        <button onClick={handleDelete} className="flex-[1.5] bg-error hover:bg-error/80 transition-colors text-secondary text-sm font-secondary font-bold py-4 rounded-xl cursor-pointer">
                            Apagar
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </PageTransition>
    );
};

const PatrocinadorEditForm = ({ form, updateForm, saving, houveAlteracao, handleSave }) => (
    <motion.form variants={itemVariants} className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-8" onSubmit={handleSave}>
        <div className="flex flex-col gap-5">
            <SectionTitle title="Tipo de Patrocinador" />
            <div className="flex gap-3">
                {tipos.map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm("tipo", t.value)}
                        className={`px-6 py-3 rounded-xl text-sm font-secondary border transition-all cursor-pointer ${form.tipo === t.value ? "bg-accent border-accent text-primary" : "bg-accent/20 border-accent/30 text-primary/60 hover:bg-accent/30"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionTitle title="Dados de Identificação" className="lg:col-span-2" />
            {form.tipo === "PJ" ? (
                <>
                    <Field label="Razão Social*">
                        <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.razaoSocial} onChange={(e) => updateForm("razaoSocial", e.target.value)} />
                    </Field>
                    <Field label="Nome Fantasia*">
                        <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.nomeFantasia} onChange={(e) => updateForm("nomeFantasia", e.target.value)} />
                    </Field>
                    <Field label="CNPJ*">
                        <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.cnpj} onChange={(e) => updateForm("cnpj", e.target.value)} />
                    </Field>
                    <Field label="Inscrição Estadual" optional>
                        <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.inscricaoEstadual} onChange={(e) => updateForm("inscricaoEstadual", e.target.value)} />
                    </Field>
                </>
            ) : (
                <>
                    <Field label="Nome Completo*">
                        <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.nomeCompleto} onChange={(e) => updateForm("nomeCompleto", e.target.value)} />
                    </Field>
                    <Field label="CPF*">
                        <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.cpf} onChange={(e) => updateForm("cpf", e.target.value)} />
                    </Field>
                </>
            )}

            <SectionTitle title="Contato" className="lg:col-span-2 mt-4" />
            <Field label="Telefone*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.telefone} onChange={(e) => updateForm("telefone", e.target.value)} />
            </Field>
            <Field label="E-mail*">
                <input required type="email" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
            </Field>
            <Field label="Nome do Responsável*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.nomeResponsavel} onChange={(e) => updateForm("nomeResponsavel", e.target.value)} />
            </Field>
            <Field label="LinkedIn" optional>
                <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.linkedin} onChange={(e) => updateForm("linkedin", e.target.value)} />
            </Field>

            <SectionTitle title="Endereço" className="lg:col-span-2 mt-4" />
            <Field label="CEP*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.cep} onChange={(e) => updateForm("cep", e.target.value)} />
            </Field>
            <Field label="Logradouro*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.logradouro} onChange={(e) => updateForm("logradouro", e.target.value)} />
            </Field>
            <Field label="Número*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.numero} onChange={(e) => updateForm("numero", e.target.value)} />
            </Field>
            <Field label="Complemento" optional>
                <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.complemento} onChange={(e) => updateForm("complemento", e.target.value)} />
            </Field>
            <Field label="Bairro*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.bairro} onChange={(e) => updateForm("bairro", e.target.value)} />
            </Field>
            <Field label="Cidade*">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.cidade} onChange={(e) => updateForm("cidade", e.target.value)} />
            </Field>
            <Field label="UF*">
                <input required maxLength="2" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.uf} onChange={(e) => updateForm("uf", e.target.value.toUpperCase())} />
            </Field>
        </div>

        <button disabled={!houveAlteracao || saving} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl flex items-center justify-center gap-2 ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            {saving ? <CircleNotchIcon size={20} className="animate-spin" /> : "Salvar alterações"}
        </button>
    </motion.form>
);

const PatrocinadorDetails = ({ patData }) => (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Dados Cadastrais" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={patData?.tipo === "PJ" ? <BuildingsIcon size={24} /> : <UserIcon size={24} />} label="Tipo" value={patData?.tipo === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} />
                <DetailCard icon={<IdentificationCardIcon size={24} />} label={patData?.tipo === "PJ" ? "CNPJ" : "CPF"} value={patData?.tipo === "PJ" ? patData?.cnpj : patData?.cpf} />
                {patData?.tipo === "PJ" && (
                    <>
                        <DetailCard icon={<BuildingsIcon size={24} />} label="Razão Social" value={patData?.razaoSocial} />
                        <DetailCard icon={<InfoIcon size={24} />} label="Insc. Estadual" value={patData?.inscricaoEstadual} />
                    </>
                )}
                <DetailCard icon={<UserIcon size={24} />} label="Responsável" value={patData?.nomeResponsavel} />
            </div>

            <SectionTitle title="Contato e Social" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<EnvelopeIcon size={24} />} label="E-mail" value={patData?.email} />
                <DetailCard icon={<PhoneIcon size={24} />} label="Telefone" value={patData?.telefone} />
                {patData?.linkedin && (
                    <div className="md:col-span-2">
                        <DetailCard icon={<LinkIcon size={24} />} label="LinkedIn" value={<a href={patData.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">{patData.linkedin}</a>} />
                    </div>
                )}
            </div>
        </div>

        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Localização" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<MapPinIcon size={24} />} label="CEP" value={patData?.cep} />
                <DetailCard icon={<MapPinIcon size={24} />} label="Cidade/UF" value={`${patData?.cidade}/${patData?.uf}`} />
                <div className="md:col-span-2">
                    <DetailCard icon={<MapPinIcon size={24} />} label="Logradouro" value={`${patData?.logradouro}, ${patData?.numero}`} />
                </div>
                <DetailCard icon={<MapPinIcon size={24} />} label="Bairro" value={patData?.bairro} />
                <DetailCard icon={<MapPinIcon size={24} />} label="Complemento" value={patData?.complemento} />
            </div>
        </div>
    </motion.div>
);

const Field = ({ label, optional, className = "", children }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-base font-secondary font-semibold text-primary">
            {label} {optional && <span className="font-normal text-primary/40 text-sm">(opcional)</span>}
        </label>
        {children}
    </div>
);

const DetailCard = ({ icon, label, value }) => (
    <div className="bg-accent/20 rounded-2xl p-5 flex items-start gap-4 min-h-24">
        <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">
            {icon}
        </div>
        <div className="flex flex-col gap-1 min-w-0 w-full">
            <span className="text-xs font-secondary text-primary/50 uppercase">{label}</span>
            <span className="text-lg font-primary font-bold text-primary break-words">{value || "-"}</span>
        </div>
    </div>
);

const SummaryPill = ({ icon, label, value }) => (
    <div className="bg-base-100/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-accent/10">
        <div className="text-primary/60">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-secondary text-primary/40 uppercase">{label}</p>
            <p className="text-sm font-primary font-bold text-primary truncate">{value}</p>
        </div>
    </div>
);

const SectionTitle = ({ title, className = "" }) => (
    <h2 className={`text-xl font-primary font-bold text-primary ${className}`}>{title}</h2>
);

const ActionCard = ({ icon, title, description, buttonLabel, onClick, danger }) => (
    <div className={`rounded-3xl p-7 flex flex-col gap-5 border ${danger ? "bg-error/10 border-error/20" : "bg-accent/10 border-accent/15"}`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${danger ? "bg-error/20 text-error" : "bg-accent/30 text-primary"}`}>
            {icon}
        </div>
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-primary font-bold text-primary">{title}</h2>
            <p className="text-sm font-secondary text-primary/60">{description}</p>
        </div>
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-sm font-secondary py-4 rounded-xl cursor-pointer transition-colors ${danger ? "bg-error/80 hover:bg-error text-secondary" : "bg-accent hover:bg-accent/80 text-primary"}`}
        >
            {buttonLabel}
        </button>
    </div>
);

export default PatrocinadorDetalhe;
