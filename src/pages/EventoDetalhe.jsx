import Sidebar from "../components/Sidebar";
import Select from "react-select";
import {
    ArrowLeftIcon,
    ArchiveIcon,
    CalendarStarIcon,
    CircleNotchIcon,
    HandshakeIcon,
    ImageSquareIcon,
    InfoIcon,
    PencilSimpleIcon,
    SlidersHorizontalIcon,
    TagIcon,
    TrashSimpleIcon,
    XIcon
} from "@phosphor-icons/react";
import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import { isAdmin } from "../utils/auth";
import CategoriaEventoSelect from "../components/CategoriaEventoSelect";
import { categoriaSelectClasses } from "../utils/selectStyles";
import { getActivityStatus, getOperationalStatusBadgeClass, getOperationalStatusLabel, setStoredActivityStatus } from "../utils/activityStatus";

const modalidades = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "ONLINE", label: "Online" },
    { value: "HIBRIDO", label: "Híbrido" }
];

const formatarData = (data) => {
    if (!data) return "-";
    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
};

const formatarModalidade = (modalidade) => {
    return modalidades.find((m) => m.value === modalidade)?.label || "-";
};

const formatarPatrocinadorLabel = (patrocinador) => (
    patrocinador?.nomeFantasia ||
    patrocinador?.razaoSocial ||
    patrocinador?.nomeCompleto ||
    patrocinador?.email ||
    (patrocinador?.id ? `Patrocinador #${patrocinador.id}` : "-")
);

const formatarCategoriaLabel = (categoria) => (
    categoria?.nome ||
    categoria?.label ||
    (categoria?.id ? `Categoria #${categoria.id}` : "-")
);

const EventoDetalhe = () => {
    const { idEvento } = useParams();
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
    const [eventData, setEventData] = useState(null);
    const [patrocinadoresDisponiveis, setPatrocinadoresDisponiveis] = useState([]);
    const [assinantesDisponiveis, setAssinantesDisponiveis] = useState([]);
    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
    const [palestrasDoEvento, setPalestrasDoEvento] = useState([]);

    const [form, setForm] = useState({
        titulo: "",
        descricao: "",
        dataInicio: "",
        dataFim: "",
        categoriaId: "",
        modalidade: "",
        banner: "",
        patrocinadorId: "",
        assinanteIds: []
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!idEvento) return;

            try {
                const [eventoRes, patrocinadoresRes, assinantesRes, categoriasRes, palestrasRes] = await Promise.all([
                    api.get(`/eventos/${idEvento}`),
                    api.get("/patrocinadores"),
                    api.get("/assinantes"),
                    api.get("/categorias-evento"),
                    api.get("/palestras")
                ]);

                const evento = eventoRes.data;
                const patrocinadores = patrocinadoresRes.data.map((patrocinador) => ({
                    value: patrocinador.id,
                    label: formatarPatrocinadorLabel(patrocinador)
                }));
                const assinantes = assinantesRes.data.map((assinante) => ({
                    value: assinante.id,
                    label: `${assinante.nome} - ${assinante.cargo}`
                }));

                setEventData(evento);
                setPatrocinadoresDisponiveis(patrocinadores);
                setAssinantesDisponiveis(assinantes);
                setCategoriasDisponiveis(categoriasRes.data);
                const palestrasVinculadas = palestrasRes.data.filter((palestra) => String(palestra.eventoId) === String(idEvento));
                const palestrasComInscricoes = await Promise.all(palestrasVinculadas.map(async (palestra) => {
                    try {
                        const inscricoesRes = await api.get(`/inscricoes/palestra/${palestra.id}`);
                        return { ...palestra, inscricoes: inscricoesRes.data };
                    } catch {
                        return { ...palestra, inscricoes: [] };
                    }
                }));
                setPalestrasDoEvento(palestrasComInscricoes);
                setForm({
                    titulo: evento.titulo || "",
                    descricao: evento.descricao || "",
                    dataInicio: evento.dataInicio || "",
                    dataFim: evento.dataFim || "",
                    categoriaId: evento.categoriaId || "",
                    modalidade: evento.modalidade || "",
                    banner: evento.banner || "",
                    patrocinadorId: evento.patrocinadorId || "",
                    assinanteIds: evento.assinanteIds || []
                });
            } catch (err) {
                console.error("Erro ao buscar evento:", err);
                setError("Não foi possível carregar os detalhes do evento.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, idEvento]);

    const patrocinadorSelecionado = patrocinadoresDisponiveis.find((patrocinador) => patrocinador.value === form.patrocinadorId);
    const categoriaEvento = categoriasDisponiveis.find((categoria) => categoria.id === eventData?.categoriaId);
    const categoriaNome = eventData?.categoria || formatarCategoriaLabel(categoriaEvento);
    const operationalStatus = getActivityStatus(eventData, "evento");
    const hasPalestras = palestrasDoEvento.length > 0;
    const hasCheckinsOrCertificates = palestrasDoEvento.some((palestra) => (
        palestra.status === "CERTIFICADOS_EMITIDOS" ||
        (palestra.inscricoes || []).some((inscricao) => inscricao.status === "CONFIRMADA")
    ));
    const canDelete = !hasPalestras && !operationalStatus;
    const canCancel = hasPalestras && !hasCheckinsOrCertificates && !operationalStatus;
    const canArchive = hasPalestras && hasCheckinsOrCertificates && !operationalStatus;

    const houveAlteracao = useMemo(() => {
        if (!eventData) return false;

        return form.titulo !== (eventData.titulo || "") ||
            form.descricao !== (eventData.descricao || "") ||
            form.dataInicio !== (eventData.dataInicio || "") ||
            form.dataFim !== (eventData.dataFim || "") ||
            form.categoriaId !== (eventData.categoriaId || "") ||
            form.modalidade !== (eventData.modalidade || "") ||
            form.banner !== (eventData.banner || "") ||
            form.patrocinadorId !== (eventData.patrocinadorId || "") ||
            JSON.stringify(form.assinanteIds || []) !== JSON.stringify(eventData.assinanteIds || []);
    }, [eventData, form]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: form.titulo,
            descricao: form.descricao,
            dataInicio: form.dataInicio,
            dataFim: form.dataFim || null,
            categoriaId: form.categoriaId || null,
            modalidade: form.modalidade || null,
            banner: form.banner,
            patrocinadorId: form.patrocinadorId || null,
            assinanteIds: form.assinanteIds || []
        };

        try {
            const response = await api.put(`/eventos/${idEvento}`, payload);
            setEventData(response.data);
            setForm({
                titulo: response.data.titulo || "",
                descricao: response.data.descricao || "",
                dataInicio: response.data.dataInicio || "",
                dataFim: response.data.dataFim || "",
                categoriaId: response.data.categoriaId || "",
                modalidade: response.data.modalidade || "",
                banner: response.data.banner || "",
                patrocinadorId: response.data.patrocinadorId || "",
                assinanteIds: response.data.assinanteIds || []
            });
            setIsEditing(false);
            toast.success("Evento atualizado com sucesso.");
        } catch (err) {
            console.error("Erro ao salvar evento:", err);
            toast.error("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/eventos/${idEvento}`);
            toast.success("Evento removido.");
            window.history.back();
        } catch (err) {
            console.error("Erro ao remover evento:", err);
            toast.error("Erro ao remover evento.");
        }
    };

    const updateOperationalStatus = (status) => {
        setStoredActivityStatus("evento", idEvento, status);
        palestrasDoEvento.forEach((palestra) => setStoredActivityStatus("palestra", palestra.id, status));
        setEventData((current) => current ? { ...current, statusOperacional: status } : current);
        setPalestrasDoEvento((current) => current.map((palestra) => ({ ...palestra, statusOperacional: status })));
        toast.success(status === "CANCELADO" ? "Evento cancelado." : "Evento arquivado.");
    };

    const handleCancel = () => {
        if (!window.confirm("Cancelar este evento? Esta ação é irreversível e bloqueará os QRs das palestras vinculadas.")) return;
        updateOperationalStatus("CANCELADO");
    };

    const handleArchive = () => {
        if (!window.confirm("Arquivar este evento? Esta ação é irreversível e bloqueará os QRs das palestras vinculadas.")) return;
        updateOperationalStatus("ARQUIVADO");
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
                                    <CalendarStarIcon size={16} />
                                    Evento
                                </div>
                                <h1 className="text-4xl font-primary text-primary font-bold truncate">{eventData?.titulo}</h1>
                                <p className="text-sm font-secondary text-primary/65 max-w-4xl">
                                    {eventData?.descricao || "Sem descrição cadastrada."}
                                </p>
                            </div>

                            {isAdmin() && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("detalhes");
                                        setIsEditing((current) => !current);
                                    }}
                                    className={`btn border-0 rounded-xl shadow-none font-secondary text-primary ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                                    title={isEditing ? "Cancelar edição" : "Editar evento"}
                                >
                                    {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                    {isEditing ? "Cancelar" : "Editar"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <SummaryPill icon={<CalendarStarIcon size={18} />} label="Início" value={formatarData(eventData?.dataInicio)} />
                            <SummaryPill icon={<TagIcon size={18} />} label="Categoria" value={categoriaNome} />
                            <SummaryPill icon={<SlidersHorizontalIcon size={18} />} label="Status" value={operationalStatus ? getOperationalStatusLabel(operationalStatus) : formatarModalidade(eventData?.modalidade)} />
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
                        {isAdmin() && (
                            <button
                                type="button"
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "acoes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`}
                                onClick={() => setActiveTab("acoes")}
                            >
                                <SlidersHorizontalIcon size={20} />
                                Ações
                            </button>
                        )}
                    </motion.div>

                    {activeTab === "detalhes" && (
                        isEditing ? (
                            <EventoEditForm
                                form={form}
                                updateForm={updateForm}
                                api={api}
                                setCategoriasDisponiveis={setCategoriasDisponiveis}
                                patrocinadoresDisponiveis={patrocinadoresDisponiveis}
                                assinantesDisponiveis={assinantesDisponiveis}
                                modalidades={modalidades}
                                saving={saving}
                                houveAlteracao={houveAlteracao}
                                handleSave={handleSave}
                            />
                        ) : (
                            <EventoDetails eventData={eventData} patrocinadorNome={patrocinadorSelecionado?.label} categoriaNome={categoriaNome} palestrasCount={palestrasDoEvento.length} />
                        )
                    )}

                    {activeTab === "acoes" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                            <ActionCard
                                icon={<ArrowLeftIcon size={44} />}
                                title="Voltar"
                                description="Retorna para a página anterior sem alterar o evento."
                                buttonLabel="Voltar"
                                onClick={() => window.history.back()}
                            />
                            {canDelete && (
                                <ActionCard
                                    danger
                                    icon={<TrashSimpleIcon size={44} />}
                                    title="Apagar evento"
                                    description="Remove este evento permanentemente do sistema."
                                    buttonLabel="Apagar permanentemente"
                                    onClick={() => document.getElementById("modal_confirmar_apagar_evento").showModal()}
                                />
                            )}
                            {canCancel && (
                                <ActionCard
                                    danger
                                    icon={<XIcon size={44} />}
                                    title="Cancelar evento"
                                    description="Bloqueia inscrições e check-ins das palestras vinculadas. A ação é irreversível."
                                    buttonLabel="Cancelar evento"
                                    onClick={handleCancel}
                                />
                            )}
                            {canArchive && (
                                <ActionCard
                                    icon={<ArchiveIcon size={44} />}
                                    title="Arquivar evento"
                                    description="Eventos com check-ins ou certificados não podem ser cancelados."
                                    buttonLabel="Arquivar evento"
                                    onClick={handleArchive}
                                />
                            )}
                            {operationalStatus && (
                                <ActionCard
                                    disabled
                                    icon={operationalStatus === "ARQUIVADO" ? <ArchiveIcon size={44} /> : <XIcon size={44} />}
                                    title={getOperationalStatusLabel(operationalStatus)}
                                    description="Este estado é irreversível."
                                    buttonLabel="Sem ações disponíveis"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <dialog id="modal_confirmar_apagar_evento" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-[color-mix(in_srgb,var(--color-error),white_80%)] border border-error/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <form method="dialog">
                        <button className="btn btn-sm btn-error btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">x</button>
                    </form>
                    <div className="w-20 h-20 bg-error/20 rounded-xl flex items-center justify-center">
                        <TrashSimpleIcon size={36} className="text-error" weight="fill" />
                    </div>
                    <h3 className="text-2xl font-primary text-primary font-bold">Apagar evento?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a apagar <span className="font-semibold text-primary">"{eventData?.titulo}"</span>. Esta ação não poderá ser desfeita.
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

const EventoEditForm = ({ form, updateForm, api, setCategoriasDisponiveis, patrocinadoresDisponiveis, assinantesDisponiveis, modalidades, saving, houveAlteracao, handleSave }) => (
    <motion.form variants={itemVariants} className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-5" onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Field label="Título do evento*" className="lg:col-span-2">
                <input required className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={form.titulo} onChange={(e) => updateForm("titulo", e.target.value)} />
            </Field>

            <Field label="Descrição" optional className="lg:col-span-2">
                <textarea className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 min-h-30 text-sm" value={form.descricao} onChange={(e) => updateForm("descricao", e.target.value)} />
            </Field>

            <Field label="Data de início*">
                <input required type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" value={form.dataInicio} onChange={(e) => updateForm("dataInicio", e.target.value)} />
            </Field>

            <Field label="Data de fim" optional>
                <input type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" value={form.dataFim} onChange={(e) => updateForm("dataFim", e.target.value)} />
            </Field>

            <Field label="Categoria" optional>
                <CategoriaEventoSelect
                    api={api}
                    value={form.categoriaId}
                    onChange={(value) => updateForm("categoriaId", value)}
                    onCategoriesChange={setCategoriasDisponiveis}
                    classNames={categoriaSelectClasses}
                />
            </Field>

            <Field label="Modalidade" optional>
                <Select
                    options={modalidades}
                    value={modalidades.find((modalidade) => modalidade.value === form.modalidade)}
                    unstyled
                    isClearable
                    onChange={(selectedOption) => updateForm("modalidade", selectedOption ? selectedOption.value : "")}
                    placeholder="Selecione uma modalidade"
                    classNames={selectClasses}
                />
            </Field>

            <Field label="Patrocinador" optional>
                <Select
                    options={patrocinadoresDisponiveis}
                    value={patrocinadoresDisponiveis.find((patrocinador) => patrocinador.value === form.patrocinadorId)}
                    unstyled
                    isClearable
                    onChange={(selectedOption) => updateForm("patrocinadorId", selectedOption ? selectedOption.value : "")}
                    placeholder="Selecione um patrocinador"
                    classNames={selectClasses}
                />
            </Field>

            <Field label="Assinantes*" className="lg:col-span-2">
                <Select
                    isMulti
                    options={assinantesDisponiveis}
                    value={assinantesDisponiveis.filter((assinante) => (form.assinanteIds || []).includes(assinante.value))}
                    unstyled
                    onChange={(selectedOptions) => updateForm("assinanteIds", (selectedOptions || []).map((option) => option.value))}
                    placeholder="Selecione quem assina os certificados deste evento"
                    classNames={selectClasses}
                />
                {(form.assinanteIds || []).length === 0 && (
                    <span className="text-xs font-secondary text-primary/45">Selecione pelo menos um assinante.</span>
                )}
            </Field>

            <Field label="Banner" optional className="lg:col-span-2">
                <input
                    type="url"
                    className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm"
                    placeholder="https://site.com/imagem.jpg"
                    value={form.banner}
                    onChange={(e) => updateForm("banner", e.target.value)}
                />
            </Field>
        </div>

        <button disabled={!houveAlteracao || saving || (form.assinanteIds || []).length === 0} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl flex items-center justify-center gap-2 ${houveAlteracao && (form.assinanteIds || []).length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            {saving ? <CircleNotchIcon size={20} className="animate-spin" /> : "Salvar alterações"}
        </button>
    </motion.form>
);

const EventoDetails = ({ eventData, patrocinadorNome, categoriaNome, palestrasCount }) => {
    const operationalStatus = getActivityStatus(eventData, "evento");

    return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Informações principais" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<CalendarStarIcon size={24} />} label="Data de início" value={formatarData(eventData?.dataInicio)} />
                <DetailCard icon={<CalendarStarIcon size={24} />} label="Data de fim" value={formatarData(eventData?.dataFim)} />
                <DetailCard icon={<TagIcon size={24} />} label="Categoria" value={categoriaNome} />
                <DetailCard icon={<CalendarStarIcon size={24} />} label="Palestras" value={palestrasCount} />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-xs font-secondary text-primary/50 uppercase">Descrição</span>
                <p className="text-sm font-secondary text-primary/75 leading-relaxed bg-accent/20 rounded-2xl p-5 min-h-28">
                    {eventData?.descricao || "Sem descrição cadastrada."}
                </p>
            </div>
        </div>

        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Operação" />
            <div className="grid grid-cols-1 gap-4">
                <DetailCard icon={<SlidersHorizontalIcon size={24} />} label="Modalidade" value={formatarModalidade(eventData?.modalidade)} />
                <DetailCard
                    icon={<SlidersHorizontalIcon size={24} />}
                    label="Status"
                    value={operationalStatus ? getOperationalStatusLabel(operationalStatus) : "Ativo"}
                    badgeClass={operationalStatus ? getOperationalStatusBadgeClass(operationalStatus) : ""}
                />
                <DetailCard icon={<HandshakeIcon size={24} />} label="Patrocinador" value={patrocinadorNome || eventData?.patrocinadorNome} />
                <DetailCard icon={<ImageSquareIcon size={24} />} label="Banner" value={eventData?.banner} />
            </div>
            {eventData?.banner && (
                <div className="overflow-hidden rounded-2xl border border-accent/15 bg-accent/20">
                    <img
                        src={eventData.banner}
                        alt={`Banner de ${eventData?.titulo || "evento"}`}
                        className="w-full aspect-video object-cover"
                    />
                </div>
            )}
        </div>
    </motion.div>
    );
};

const Field = ({ label, optional, className = "", children }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-base font-secondary font-semibold text-primary">
            {label} {optional && <span className="font-normal text-primary/40 text-sm">(opcional)</span>}
        </label>
        {children}
    </div>
);

const DetailCard = ({ icon, label, value, badgeClass = "" }) => (
    <div className="bg-accent/20 rounded-2xl p-5 flex items-start gap-4 min-h-24">
        <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">
            {icon}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-secondary text-primary/50 uppercase">{label}</span>
            <span className={`text-lg font-primary font-bold break-words ${badgeClass ? `${badgeClass} rounded-xl px-3 py-1 w-fit` : "text-primary"}`}>{value || "-"}</span>
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

const ActionCard = ({ icon, title, description, buttonLabel, onClick, danger, disabled }) => (
    <div className={`rounded-3xl p-7 flex flex-col gap-5 border ${disabled ? "opacity-60 bg-primary/5 border-primary/10" : danger ? "bg-error/10 border-error/20" : "bg-accent/10 border-accent/15"}`}>
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
            disabled={disabled}
            className={`w-full text-sm font-secondary py-4 rounded-xl transition-colors ${disabled ? "bg-primary/10 text-primary/45 cursor-not-allowed" : danger ? "bg-error/80 hover:bg-error text-secondary cursor-pointer" : "bg-accent hover:bg-accent/80 text-primary cursor-pointer"}`}
        >
            {buttonLabel}
        </button>
    </div>
);

const selectClasses = {
    control: () => "basic-multi-select bg-accent/30 px-4 py-2 min-h-15 border border-accent/20 rounded-xl text-primary text-sm",
    menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
    placeholder: () => "text-primary/75 font-secondary text-sm",
    option: ({ isFocused }) => `px-4 py-3 ${isFocused ? "bg-accent/50 rounded-xl" : ""}`,
    multiValue: () => "bg-accent/60 rounded-lg px-2 py-1 mr-1 mb-1",
    multiValueLabel: () => "text-primary font-secondary text-xs",
    multiValueRemove: () => "text-primary/50 hover:text-error ml-1"
};

export default EventoDetalhe;
