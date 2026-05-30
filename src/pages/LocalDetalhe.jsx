import Sidebar from "../components/Sidebar";
import {
    ArrowLeftIcon,
    CircleNotchIcon,
    MapPinIcon,
    PencilSimpleIcon,
    SlidersHorizontalIcon,
    TrashSimpleIcon,
    UsersIcon,
    XIcon,
    InfoIcon
} from "@phosphor-icons/react";
import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";

const LocalDetalhe = () => {
    const { idLocal } = useParams();
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
    const [localData, setLocalData] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        capacidade: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!idLocal) return;

            try {
                const response = await api.get(`/locais/${idLocal}`);
                const local = response.data;

                setLocalData(local);
                setForm({
                    nome: local.nome || "",
                    capacidade: local.capacidade ?? ""
                });
            } catch (err) {
                console.error("Erro ao buscar local:", err);
                setError("Não foi possível carregar os detalhes do local.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, idLocal]);

    const houveAlteracao = useMemo(() => {
        if (!localData) return false;

        return form.nome !== (localData.nome || "") ||
            String(form.capacidade) !== String(localData.capacidade ?? "");
    }, [localData, form]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            nome: form.nome,
            capacidade: form.capacidade ? Number(form.capacidade) : null
        };

        try {
            const response = await api.put(`/locais/${idLocal}`, payload);
            setLocalData(response.data);
            setForm({
                nome: response.data.nome || "",
                capacidade: response.data.capacidade ?? ""
            });
            setIsEditing(false);
            toast.success("Local atualizado com sucesso.");
        } catch (err) {
            console.error("Erro ao salvar local:", err);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/locais/${idLocal}`);
            toast.success("Local removido.");
            window.history.back();
        } catch (err) {
            console.error("Erro ao remover local:", err);
            toast.error("Erro ao remover local.");
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <MapPinIcon size={16} />
                                    Local
                                </div>
                                <h1 className="text-4xl font-primary text-primary font-bold truncate">{localData?.nome}</h1>
                                <p className="text-sm font-secondary text-primary/65 max-w-4xl">
                                    Ambiente destinado a eventos e palestras.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("detalhes");
                                    setIsEditing((current) => !current);
                                }}
                                className={`btn border-0 rounded-xl shadow-none font-secondary text-primary ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                                title={isEditing ? "Cancelar edição" : "Editar local"}
                            >
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SummaryPill icon={<MapPinIcon size={18} />} label="Identificador" value={`#${localData?.id}`} />
                            <SummaryPill icon={<UsersIcon size={18} />} label="Capacidade" value={`${localData?.capacidade} pessoas`} />
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
                            <LocalEditForm
                                form={form}
                                updateForm={updateForm}
                                saving={saving}
                                houveAlteracao={houveAlteracao}
                                handleSave={handleSave}
                            />
                        ) : (
                            <LocalDetails localData={localData} />
                        )
                    )}

                    {activeTab === "acoes" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <ActionCard
                                icon={<ArrowLeftIcon size={44} />}
                                title="Voltar"
                                description="Retorna para a página anterior sem alterar o local."
                                buttonLabel="Voltar"
                                onClick={() => window.history.back()}
                            />
                            <ActionCard
                                danger
                                icon={<TrashSimpleIcon size={44} />}
                                title="Apagar local"
                                description="Remove este local permanentemente do sistema."
                                buttonLabel="Apagar permanentemente"
                                onClick={() => document.getElementById("modal_confirmar_apagar_local").showModal()}
                            />
                        </div>
                    )}
                </div>
            </div>

            <dialog id="modal_confirmar_apagar_local" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-[color-mix(in_srgb,var(--color-error),white_80%)] border border-error/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <form method="dialog">
                        <button className="btn btn-sm btn-error btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">x</button>
                    </form>
                    <div className="w-20 h-20 bg-error/20 rounded-xl flex items-center justify-center">
                        <TrashSimpleIcon size={36} className="text-error" weight="fill" />
                    </div>
                    <h3 className="text-2xl font-primary text-primary font-bold">Apagar local?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a apagar <span className="font-semibold text-primary">"{localData?.nome}"</span>. Esta ação não poderá ser desfeita.
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

const LocalEditForm = ({ form, updateForm, saving, houveAlteracao, handleSave }) => (
    <motion.form variants={itemVariants} className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-5" onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Field label="Nome do local*" className="lg:col-span-2">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.nome} onChange={(e) => updateForm("nome", e.target.value)} />
            </Field>

            <Field label="Capacidade*">
                <input required min="1" type="number" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" value={form.capacidade} onChange={(e) => updateForm("capacidade", e.target.value)} />
            </Field>
        </div>

        <button disabled={!houveAlteracao || saving} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl flex items-center justify-center gap-2 ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            {saving ? <CircleNotchIcon size={20} className="animate-spin" /> : "Salvar alterações"}
        </button>
    </motion.form>
);

const LocalDetails = ({ localData }) => (
    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Informações do Local" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<MapPinIcon size={24} />} label="Nome" value={localData?.nome} />
                <DetailCard icon={<UsersIcon size={24} />} label="Capacidade" value={`${localData?.capacidade} pessoas`} />
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
        <div className="flex flex-col gap-1 min-w-0">
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

const SectionTitle = ({ title }) => (
    <h2 className="text-xl font-primary font-bold text-primary">{title}</h2>
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

export default LocalDetalhe;
