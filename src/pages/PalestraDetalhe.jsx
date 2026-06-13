import Sidebar from "../components/Sidebar";
import Select from "react-select";
import QRCode from "qrcode";
import {
    ArrowLeftIcon,
    ArchiveIcon,
    CalendarIcon,
    CheckCircleIcon,
    CircleNotchIcon,
    ClockIcon,
    InfoIcon,
    LecternIcon,
    MapPinIcon,
    MedalIcon,
    PencilSimpleIcon,
    QrCodeIcon,
    SlidersHorizontalIcon,
    TrashSimpleIcon,
    UserIcon,
    UsersIcon,
    XIcon
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import { getPalestraStatusLabel, PALESTRA_STATUS } from "../utils/palestraStatus";
import { blocksNewPalestras, getActivityStatus, getOperationalStatusBadgeClass, getOperationalStatusLabel, isInactive, setStoredActivityStatus } from "../utils/activityStatus";

const modalidades = [
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "ONLINE", label: "Online" },
    { value: "HIBRIDO", label: "Híbrido" }
];

const tiposPalestra = [
    "PALESTRA", "WORKSHOP", "CURSO", "SEMINARIO", "CONGRESSO",
    "SEMANA_ACADEMICA", "TREINAMENTO", "EXTENSAO", "HACKATHON",
    "PROJETO", "MONITORIA", "ORGANIZACAO"
].map((tipo) => ({ value: tipo, label: formatarEnum(tipo) }));

function formatarEnum(value) {
    if (!value) return "-";
    return value.toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

const formatarData = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
};

const formatarHora = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formatarDataHora = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const toDateInput = (value) => value ? new Date(value).toISOString().split("T")[0] : "";
const toTimeInput = (value) => value ? new Date(value).toTimeString().substring(0, 5) : "";
const toNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const getCheckinTimestamp = (inscricao) => (
    inscricao.dataCheckin ||
    inscricao.dataConfirmacao ||
    inscricao.dataPresenca ||
    inscricao.confirmadoEm ||
    inscricao.checkinEm ||
    null
);

const calcularPicosCheckin = (inscricoes) => {
    const buckets = inscricoes
        .filter((inscricao) => inscricao.status === "CONFIRMADA")
        .map(getCheckinTimestamp)
        .filter(Boolean)
        .reduce((acc, timestamp) => {
            const date = new Date(timestamp);
            if (Number.isNaN(date.getTime())) return acc;
            const hour = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).slice(0, 2);
            const label = `${hour}:00 - ${hour}:59`;
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});

    return Object.entries(buckets)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const montarCheckinsComHorario = (inscricoes) => inscricoes
    .filter((inscricao) => inscricao.status === "CONFIRMADA")
    .map((inscricao) => ({ ...inscricao, horarioCheckin: getCheckinTimestamp(inscricao) }))
    .filter((inscricao) => {
        const date = new Date(inscricao.horarioCheckin);
        return !Number.isNaN(date.getTime());
    })
    .sort((a, b) => new Date(a.horarioCheckin) - new Date(b.horarioCheckin));

const PalestraDetalhe = () => {
    const { idPal } = useParams();
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
    const [palestraData, setPalestraData] = useState(null);
    const [competenciasDisponiveis, setCompetenciasDisponiveis] = useState([]);
    const [palestrantesDisponiveis, setPalestrantesDisponiveis] = useState([]);
    const [eventosDisponiveis, setEventosDisponiveis] = useState([]);
    const [todosEventos, setTodosEventos] = useState([]);
    const [locaisDisponiveis, setLocaisDisponiveis] = useState([]);
    const [inscricoesPresenca, setInscricoesPresenca] = useState([]);
    const [buscaParticipante, setBuscaParticipante] = useState("");
    const [qrAberto, setQrAberto] = useState(false);
    const [qrTipo, setQrTipo] = useState("inscricao");
    const [qrDataUrl, setQrDataUrl] = useState("");

    const [form, setForm] = useState({
        titulo: "",
        descricao: "",
        competenciaIds: [],
        palestranteIds: [],
        eventoId: "",
        localId: "",
        data: "",
        inicio: "",
        fim: "",
        tipo: "",
        modalidade: "",
        cargaHoraria: "",
        vagas: "",
        status: "PENDENTE"
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!idPal) return;

            try {
                const [palRes, compRes, palestrantesRes, eventosRes, locaisRes, inscricoesRes] = await Promise.all([
                    api.get(`/palestras/${idPal}`),
                    api.get("/competencias"),
                    api.get("/palestrantes"),
                    api.get("/eventos"),
                    api.get("/locais"),
                    api.get(`/inscricoes/palestra/${idPal}`)
                ]);

                const palestra = palRes.data;
                setPalestraData(palestra);
                setCompetenciasDisponiveis(compRes.data.map((c) => ({ value: c.id, label: c.nome })));
                setPalestrantesDisponiveis(palestrantesRes.data.map((p) => ({ value: p.id, label: p.nome })));
                const eventos = eventosRes.data.map((e) => ({
                    value: e.id,
                    label: e.titulo,
                    statusOperacional: e.statusOperacional
                }));
                setTodosEventos(eventos);
                setEventosDisponiveis(eventos.filter((e) => !blocksNewPalestras(e, "evento")));
                setLocaisDisponiveis(locaisRes.data.map((local) => ({ value: local.id, label: local.nome, capacidade: local.capacidade })));
                setInscricoesPresenca(inscricoesRes.data);
                setForm({
                    titulo: palestra.titulo || "",
                    descricao: palestra.descricao || "",
                    competenciaIds: palestra.competenciaIds || [],
                    palestranteIds: palestra.palestranteIds || [],
                    eventoId: palestra.eventoId || "",
                    localId: palestra.localId || "",
                    data: toDateInput(palestra.inicio),
                    inicio: toTimeInput(palestra.inicio),
                    fim: toTimeInput(palestra.fim),
                    tipo: palestra.tipo || "",
                    modalidade: palestra.modalidade || "",
                    cargaHoraria: palestra.cargaHoraria ?? "",
                    vagas: palestra.vagas ?? "",
                    status: palestra.status || "PENDENTE"
                });
            } catch (err) {
                console.error("Erro ao buscar palestra:", err);
                setError("Não foi possível carregar os detalhes da palestra.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, idPal]);

    const houveAlteracao = useMemo(() => {
        if (!palestraData) return false;
        return form.titulo !== (palestraData.titulo || "") ||
            form.descricao !== (palestraData.descricao || "") ||
            JSON.stringify(form.competenciaIds) !== JSON.stringify(palestraData.competenciaIds || []) ||
            JSON.stringify(form.palestranteIds) !== JSON.stringify(palestraData.palestranteIds || []) ||
            form.eventoId !== (palestraData.eventoId || "") ||
            form.localId !== (palestraData.localId || "") ||
            form.data !== toDateInput(palestraData.inicio) ||
            form.inicio !== toTimeInput(palestraData.inicio) ||
            form.fim !== toTimeInput(palestraData.fim) ||
            form.tipo !== (palestraData.tipo || "") ||
            form.modalidade !== (palestraData.modalidade || "") ||
            String(form.cargaHoraria) !== String(palestraData.cargaHoraria ?? "") ||
            String(form.vagas) !== String(palestraData.vagas ?? "") ||
            form.status !== (palestraData.status || "PENDENTE");
    }, [form, palestraData]);

    const competenciaNomes = competenciasDisponiveis.filter((c) => (palestraData?.competenciaIds || []).includes(c.value)).map((c) => c.label);
    const palestranteNomes = palestrantesDisponiveis.filter((p) => (palestraData?.palestranteIds || []).includes(p.value)).map((p) => p.label);
    const eventoSelecionadoAtual = todosEventos.find((e) => e.value === palestraData?.eventoId);
    const eventoNome = eventoSelecionadoAtual?.label;
    const localNome = locaisDisponiveis.find((local) => local.value === palestraData?.localId)?.label || palestraData?.localNome;
    const publicInscricaoQrUrl = palestraData?.qrCodeToken ? `${window.location.origin}/inscricao/qrcode/${palestraData.qrCodeToken}` : "";
    const publicCheckinQrUrl = palestraData?.qrCodeCheckinToken ? `${window.location.origin}/checkin/qrcode/${palestraData.qrCodeCheckinToken}` : "";
    const publicQrUrl = qrTipo === "checkin" ? publicCheckinQrUrl : publicInscricaoQrUrl;
    const qrFileName = `qrcode-${qrTipo}-${(palestraData?.titulo || "palestra").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.png`;
    const operationalStatus = getActivityStatus(palestraData, "palestra");
    const eventOperationalStatus = getActivityStatus(eventoSelecionadoAtual || { id: palestraData?.eventoId }, "evento");
    const inactive = isInactive(palestraData, "palestra") || operationalStatus === "FINALIZADO" || eventOperationalStatus === "CANCELADO" || eventOperationalStatus === "FINALIZADO" || eventOperationalStatus === "ARQUIVADO";
    const inscricoesAtivas = inscricoesPresenca.filter((inscricao) => inscricao.status !== "CANCELADA");
    const fallbackInscricoesCount = Math.max(
        toNumber(palestraData?.inscritos),
        toNumber(palestraData?.totalInscritos),
        toNumber(palestraData?.quantidadeInscritos),
        toNumber(palestraData?.inscricoesCount),
        Array.isArray(palestraData?.inscricoes) ? palestraData.inscricoes.filter((inscricao) => inscricao.status !== "CANCELADA").length : 0
    );
    const inscricoesAtivasCount = Math.max(inscricoesAtivas.length, fallbackInscricoesCount);
    const hasInscricoes = inscricoesAtivasCount > 0;
    const hasCheckins = inscricoesAtivas.some((inscricao) => inscricao.status === "CONFIRMADA");
    const hasCertificados = palestraData?.status === "CERTIFICADOS_EMITIDOS" || hasCheckins;
    const canDelete = !hasInscricoes && !hasCertificados && !operationalStatus;
    const canCancel = hasInscricoes && !hasCertificados && !operationalStatus;
    const canFinalize = hasCertificados && !operationalStatus;
    const canArchive = operationalStatus === "FINALIZADO";
    const showDadosTab = operationalStatus === "FINALIZADO" || operationalStatus === "ARQUIVADO";
    const totalPresentes = inscricoesAtivas.filter((inscricao) => inscricao.status === "CONFIRMADA").length;
    const taxaComparecimento = inscricoesAtivasCount > 0 ? Math.round((totalPresentes / inscricoesAtivasCount) * 100) : 0;
    const picosCheckin = calcularPicosCheckin(inscricoesAtivas);
    const checkinsComHorario = montarCheckinsComHorario(inscricoesAtivas);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    useEffect(() => {
        if (!qrAberto || !publicQrUrl) return;
        setQrDataUrl("");

        QRCode.toDataURL(publicQrUrl, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: "M",
            color: {
                dark: "#17130f",
                light: "#ffffff"
            }
        })
            .then(setQrDataUrl)
            .catch((error) => {
                console.error("Erro ao gerar QR Code:", error);
                toast.error("Erro ao gerar QR Code.");
            });
    }, [publicQrUrl, qrAberto]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.localId) {
            toast.error("Selecione um local para a palestra.");
            return;
        }
        const eventoSelecionado = todosEventos.find((evento) => evento.value === form.eventoId);
        if (blocksNewPalestras(eventoSelecionado, "evento")) {
            toast.error(`Eventos ${getOperationalStatusLabel(eventoSelecionado.statusOperacional).toLowerCase()}s não aceitam palestras associadas.`);
            return;
        }
        if (!eventosDisponiveis.some((evento) => evento.value === form.eventoId)) {
            toast.error("Selecione um evento ativo para salvar a palestra.");
            return;
        }
        setSaving(true);

        const payload = {
            titulo: form.titulo,
            descricao: form.descricao,
            competenciaIds: form.competenciaIds,
            palestranteIds: form.palestranteIds,
            eventoId: form.eventoId || null,
            localId: form.localId || null,
            inicio: `${form.data}T${form.inicio}:00`,
            fim: `${form.data}T${form.fim}:00`,
            tipo: form.tipo || null,
            modalidade: form.modalidade || null,
            cargaHoraria: form.cargaHoraria ? Number(form.cargaHoraria) : null,
            vagas: form.vagas ? Number(form.vagas) : null,
            status: form.status || "PENDENTE"
        };

        try {
            const response = await api.put(`/palestras/${idPal}`, payload);
            setPalestraData(response.data);
            setIsEditing(false);
            toast.success("Palestra atualizada com sucesso.");
        } catch (err) {
            console.error("Erro ao salvar palestra:", err);
            toast.error(err.response?.data?.erro || err.response?.data?.message || "Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/palestras/${idPal}`);
            toast.success("Palestra removida.");
            window.history.back();
        } catch (err) {
            console.error("Erro ao remover palestra:", err);
            toast.error("Erro ao remover palestra.");
        }
    };

    const updateOperationalStatus = async (status) => {
        try {
            const response = await api.patch(`/palestras/${idPal}/status-operacional`, { statusOperacional: status });
            setStoredActivityStatus("palestra", idPal, status);
            setPalestraData(response.data);
            const successMessages = {
                CANCELADO: "Palestra cancelada.",
                FINALIZADO: "Palestra finalizada.",
                ARQUIVADO: "Palestra arquivada.",
            };
            toast.success(successMessages[status] || "Status atualizado.");
        } catch (err) {
            console.error("Erro ao atualizar status operacional da palestra:", err);
            toast.error(err.response?.data?.message || err.response?.data?.erro || "Erro ao atualizar status da palestra.");
        }
    };

    const handleCancel = () => {
        if (!window.confirm("Cancelar esta palestra? Esta ação é irreversível e bloqueará novos QRs.")) return;
        updateOperationalStatus("CANCELADO");
    };

    const handleFinalize = () => {
        if (!window.confirm("Finalizar esta palestra? Após a finalização, a opção de arquivamento ficará disponível.")) return;
        updateOperationalStatus("FINALIZADO");
    };

    const handleArchive = () => {
        if (!window.confirm("Arquivar esta palestra finalizada? Esta ação é irreversível.")) return;
        updateOperationalStatus("ARQUIVADO");
    };

    const abrirPresenca = async () => {
        try {
            const inscricoesRes = await api.get(`/inscricoes/palestra/${idPal}`);
            setInscricoesPresenca(inscricoesRes.data);
        } catch (err) {
            console.error("Erro ao atualizar lista de presença:", err);
            toast.error("Não foi possível atualizar a lista de presença.");
        }
        document.getElementById("modal_lancar_presenca").showModal();
    };

    const abrirQr = (tipo) => {
        if (inactive) {
            toast.error(eventOperationalStatus ? "O evento desta palestra está inativo." : "Esta palestra está inativa.");
            return;
        }
        const url = tipo === "checkin" ? publicCheckinQrUrl : publicInscricaoQrUrl;
        if (!url) {
            toast.error("Token de QR Code indisponível para esta palestra.");
            return;
        }
        setQrTipo(tipo);
        setQrAberto(true);
    };

    const participantesFiltrados = inscricoesPresenca.filter((inscricao) => {
        const termo = buscaParticipante.toLowerCase();
        return inscricao.participanteNome?.toLowerCase().includes(termo) ||
            inscricao.email?.toLowerCase().includes(termo) ||
            inscricao.email2?.toLowerCase().includes(termo) ||
            inscricao.cpf?.toLowerCase().includes(termo);
    });

    if (loading) {
        return (
            <PageTransition>
                <div className="flex bg-base-100 min-h-screen">
                    <Sidebar compact={true} />
                    <div className="pt-10 pl-5 pr-12 w-full animate-pulse flex flex-col gap-6">
                        <div className="h-28 w-full bg-accent/10 rounded-3xl" />
                        <div className="h-14 w-full bg-accent/10 rounded-2xl" />
                        <div className="h-80 bg-accent/10 rounded-3xl" />
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
                                    <LecternIcon size={16} />
                                    Palestra
                                </div>
                                <h1 className="text-4xl font-primary text-primary font-bold truncate">{palestraData?.titulo}</h1>
                                <p className="text-sm font-secondary text-primary/65 max-w-4xl">{palestraData?.descricao || "Sem descrição cadastrada."}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("detalhes");
                                    setIsEditing((current) => !current);
                                }}
                                className={`btn border-0 rounded-xl shadow-none font-secondary text-primary ${isEditing ? "bg-error/20 hover:bg-error/30" : "bg-accent hover:bg-accent/80"}`}
                            >
                                {isEditing ? <XIcon size={20} /> : <PencilSimpleIcon size={20} />}
                                {isEditing ? "Cancelar" : "Editar"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <SummaryPill icon={<CalendarIcon size={18} />} label="Data" value={formatarData(palestraData?.inicio)} />
                            <SummaryPill icon={<ClockIcon size={18} />} label="Horário" value={`${formatarHora(palestraData?.inicio)} - ${formatarHora(palestraData?.fim)}`} />
                            <SummaryPill icon={<UserIcon size={18} />} label="Palestrantes" value={palestranteNomes.join(", ") || "-"} />
                            <SummaryPill icon={<CheckCircleIcon size={18} />} label="Status" value={operationalStatus ? getOperationalStatusLabel(operationalStatus) : getPalestraStatusLabel(palestraData?.status)} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="tabs tabs-box bg-accent/30 rounded-2xl p-1 w-full">
                        <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "detalhes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`} onClick={() => setActiveTab("detalhes")}>
                            <InfoIcon size={20} />
                            Detalhes
                        </button>
                        {showDadosTab && (
                            <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "dados" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`} onClick={() => setActiveTab("dados")}>
                                <UsersIcon size={20} />
                                Dados
                            </button>
                        )}
                        <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "acoes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`} onClick={() => setActiveTab("acoes")}>
                            <SlidersHorizontalIcon size={20} />
                            Ações
                        </button>
                    </motion.div>

                    {activeTab === "detalhes" && (
                        isEditing ? (
                            <PalestraEditForm
                                form={form}
                                updateForm={updateForm}
                                competenciasDisponiveis={competenciasDisponiveis}
                                palestrantesDisponiveis={palestrantesDisponiveis}
                                eventosDisponiveis={eventosDisponiveis}
                                todosEventos={todosEventos}
                                locaisDisponiveis={locaisDisponiveis}
                                saving={saving}
                                houveAlteracao={houveAlteracao}
                                handleSave={handleSave}
                            />
                        ) : (
                            <PalestraDetails
                                palestraData={palestraData}
                                competenciaNomes={competenciaNomes}
                                palestranteNomes={palestranteNomes}
                                eventoNome={eventoNome}
                                localNome={localNome}
                                totalInscritos={inscricoesAtivasCount}
                                totalPresentes={totalPresentes}
                            />
                        )
                    )}

                    {activeTab === "dados" && showDadosTab && (
                        <PalestraDataTab
                            totalInscritos={inscricoesAtivasCount}
                            totalPresentes={totalPresentes}
                            taxaComparecimento={taxaComparecimento}
                            picosCheckin={picosCheckin}
                            checkinsComHorario={checkinsComHorario}
                        />
                    )}

                    {activeTab === "acoes" && (
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                            <ActionCard
                                icon={<CheckCircleIcon size={44} />}
                                title="Lista de presença"
                                description={`${inscricoesAtivasCount} participante(s) inscrito(s). A lista é apenas consulta; check-in é feito pelo QR Code.`}
                                buttonLabel="Consultar presença"
                                onClick={abrirPresenca}
                            />
                            <ActionCard
                                icon={<QrCodeIcon size={44} />}
                                title="QR de inscrição"
                                description={inactive ? "Bloqueado para palestra ou evento cancelado/arquivado." : "Link público para o participante se inscrever na palestra usando CPF."}
                                buttonLabel={inactive ? "QR bloqueado" : "Abrir QR de inscrição"}
                                onClick={() => abrirQr("inscricao")}
                                disabled={inactive}
                            />
                            <ActionCard
                                icon={<QrCodeIcon size={44} />}
                                title="QR de check-in"
                                description={inactive ? "Bloqueado para palestra ou evento cancelado/arquivado." : "Link público para confirmar presença apenas de participantes já inscritos."}
                                buttonLabel={inactive ? "QR bloqueado" : "Abrir QR de check-in"}
                                onClick={() => abrirQr("checkin")}
                                disabled={inactive}
                            />
                            {canDelete && (
                                <ActionCard
                                    danger
                                    icon={<TrashSimpleIcon size={44} />}
                                    title="Apagar palestra"
                                    description="Remove esta palestra permanentemente do sistema."
                                    buttonLabel="Apagar permanentemente"
                                    onClick={() => document.getElementById("modal_confirmar_apagar_palestra").showModal()}
                                />
                            )}
                            {canCancel && (
                                <ActionCard
                                    danger
                                    icon={<XIcon size={44} />}
                                    title="Cancelar palestra"
                                    description="Bloqueia inscrições e check-ins. A ação é irreversível."
                                    buttonLabel="Cancelar palestra"
                                    onClick={handleCancel}
                                />
                            )}
                            {canFinalize && (
                                <ActionCard
                                    icon={<CheckCircleIcon size={44} />}
                                    title="Finalizar palestra"
                                    description="Disponível após o primeiro check-in. Depois disso, o arquivamento ficará disponível."
                                    buttonLabel="Finalizar palestra"
                                    onClick={handleFinalize}
                                />
                            )}
                            {canArchive && (
                                <ActionCard
                                    icon={<ArchiveIcon size={44} />}
                                    title="Arquivar palestra"
                                    description="Arquiva uma palestra já finalizada. Esta ação é irreversível."
                                    buttonLabel="Arquivar palestra"
                                    onClick={handleArchive}
                                />
                            )}
                            {operationalStatus && operationalStatus !== "FINALIZADO" && (
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

            <dialog id="modal_lancar_presenca" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-base-100 rounded-2xl p-7 max-w-3xl flex flex-col gap-5">
                    <form method="dialog">
                        <button className="btn btn-sm btn-ghost btn-circle absolute right-5 top-5 bg-accent/30 border-none text-primary hover:bg-accent/50 shadow-none">x</button>
                    </form>
                    <div>
                        <h3 className="text-3xl font-primary text-primary font-bold">Lista de presença</h3>
                        <p className="text-sm font-secondary text-primary/60">Consulta dos participantes inscritos e dos check-ins confirmados pelo QR Code.</p>
                    </div>
                    <input
                        type="text"
                        value={buscaParticipante}
                        onChange={(e) => setBuscaParticipante(e.target.value)}
                        placeholder="Buscar por nome, CPF ou e-mail"
                        className="w-full text-sm p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary/80 outline-none focus:border-accent"
                    />
                    <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
                        {participantesFiltrados.length === 0 && (
                            <div className="bg-accent/10 rounded-2xl p-6 text-center text-sm font-secondary text-primary/50">
                                Nenhuma inscrição encontrada para esta palestra.
                            </div>
                        )}
                        {participantesFiltrados.map((inscricao) => (
                            <div key={inscricao.id} className="bg-accent/20 rounded-2xl p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inscricao.status === "CONFIRMADA" ? "bg-right/20 text-right" : "bg-warning/20 text-primary"}`}>
                                    <CheckCircleIcon size={22} weight={inscricao.status === "CONFIRMADA" ? "fill" : "regular"} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-primary font-bold text-primary truncate">{inscricao.participanteNome}</p>
                                        <span className={`badge badge-sm border-0 font-secondary ${inscricao.status === "CONFIRMADA" ? "bg-right/20 text-primary" : "bg-warning/20 text-primary"}`}>
                                            {inscricao.status === "CONFIRMADA" ? "Check-in confirmado" : "Inscrito"}
                                        </span>
                                    </div>
                                    <p className="font-secondary text-xs text-primary/60 truncate">{inscricao.email} | CPF: {inscricao.cpf}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

            <dialog id="modal_confirmar_apagar_palestra" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-[color-mix(in_srgb,var(--color-error),white_80%)] border border-error/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <form method="dialog">
                        <button className="btn btn-sm btn-error btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">x</button>
                    </form>
                    <div className="w-20 h-20 bg-error/20 rounded-xl flex items-center justify-center">
                        <TrashSimpleIcon size={36} className="text-error" weight="fill" />
                    </div>
                    <h3 className="text-2xl font-primary text-primary font-bold">Apagar palestra?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a apagar <span className="font-semibold text-primary">"{palestraData?.titulo}"</span>. Esta ação não poderá ser desfeita.
                    </p>
                    <button onClick={handleDelete} className="w-full bg-error hover:bg-error/80 transition-colors text-secondary text-sm font-secondary font-bold py-4 rounded-xl cursor-pointer">
                        Apagar
                    </button>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

            {qrAberto && (
                <div className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setQrAberto(false)}>
                    <div className="bg-base-100 rounded-3xl p-7 max-w-sm w-full flex flex-col gap-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-primary font-bold text-primary">QR Code de {qrTipo === "checkin" ? "check-in" : "inscrição"}</h3>
                                <p className="text-sm font-secondary text-primary/60">
                                    {qrTipo === "checkin" ? "Confirma presença de participantes já inscritos." : "Registra inscrições para a palestra."}
                                </p>
                            </div>
                            <button className="btn btn-sm btn-circle border-0 bg-accent/30 text-primary" onClick={() => setQrAberto(false)}>x</button>
                        </div>
                        <div className="bg-white rounded-2xl p-5 flex items-center justify-center">
                            {qrDataUrl ? (
                                <img src={qrDataUrl} alt="QR Code da palestra" className="w-56 h-56 object-contain" />
                            ) : (
                                <CircleNotchIcon size={32} className="animate-spin text-primary/50" />
                            )}
                        </div>
                        {publicQrUrl && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <a href={publicQrUrl} target="_blank" rel="noreferrer" className="btn border-0 rounded-xl bg-accent text-primary font-secondary">
                                    Abrir rota pública
                                </a>
                                <a href={qrDataUrl || "#"} download={qrFileName} className={`btn border-0 rounded-xl bg-accent/30 text-primary font-secondary ${qrDataUrl ? "" : "btn-disabled"}`}>
                                    Baixar QR Code
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageTransition>
    );
};

const PalestraEditForm = ({ form, updateForm, competenciasDisponiveis, palestrantesDisponiveis, eventosDisponiveis, todosEventos, locaisDisponiveis, saving, houveAlteracao, handleSave }) => (
    <motion.form variants={itemVariants} className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-5" onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Field label="Título da palestra*" className="lg:col-span-2">
                <input required className={inputClass} value={form.titulo} onChange={(e) => updateForm("titulo", e.target.value)} />
            </Field>
            <Field label="Descrição*" className="lg:col-span-2">
                <textarea required className={`${inputClass} min-h-30`} value={form.descricao} onChange={(e) => updateForm("descricao", e.target.value)} />
            </Field>
            <Field label="Palestrantes*">
                <Select isMulti options={palestrantesDisponiveis} value={palestrantesDisponiveis.filter((p) => form.palestranteIds.includes(p.value))} unstyled onChange={(options) => updateForm("palestranteIds", (options || []).map((o) => o.value))} placeholder="Selecione palestrantes" classNames={selectClasses} />
            </Field>
            <Field label="Competências*">
                <Select isMulti options={competenciasDisponiveis} value={competenciasDisponiveis.filter((c) => form.competenciaIds.includes(c.value))} unstyled onChange={(options) => updateForm("competenciaIds", (options || []).map((o) => o.value))} placeholder="Selecione competências" classNames={selectClasses} />
            </Field>
            <Field label="Evento" optional>
                <Select
                    options={eventosDisponiveis}
                    value={eventosDisponiveis.find((e) => e.value === form.eventoId)}
                    unstyled
                    isClearable
                    onChange={(option) => updateForm("eventoId", option ? option.value : "")}
                    placeholder="Selecione um evento"
                    classNames={selectClasses}
                />
                {todosEventos.some((evento) => blocksNewPalestras(evento, "evento")) && (
                    <span className="text-xs font-secondary text-primary/45">Eventos cancelados, finalizados ou arquivados não aceitam novas palestras.</span>
                )}
            </Field>
            <Field label="Local / Sala*">
                <Select
                    options={locaisDisponiveis}
                    value={locaisDisponiveis.find((local) => local.value === form.localId)}
                    unstyled
                    onChange={(option) => {
                        updateForm("localId", option ? option.value : "");
                        updateForm("vagas", option?.capacidade ?? "");
                    }}
                    placeholder="Selecione um local"
                    classNames={selectClasses}
                />
            </Field>
            <Field label="Tipo" optional>
                <Select options={tiposPalestra} value={tiposPalestra.find((t) => t.value === form.tipo)} unstyled isClearable onChange={(option) => updateForm("tipo", option ? option.value : "")} placeholder="Selecione um tipo" classNames={selectClasses} />
            </Field>
            <Field label="Modalidade" optional>
                <Select options={modalidades} value={modalidades.find((m) => m.value === form.modalidade)} unstyled isClearable onChange={(option) => updateForm("modalidade", option ? option.value : "")} placeholder="Selecione uma modalidade" classNames={selectClasses} />
            </Field>
            <Field label="Status">
                <Select options={PALESTRA_STATUS} value={PALESTRA_STATUS.find((s) => s.value === form.status)} unstyled onChange={(option) => updateForm("status", option ? option.value : "PENDENTE")} placeholder="Selecione um status" classNames={selectClasses} />
            </Field>
            <Field label="Data*">
                <input required type="date" className={inputClass} value={form.data} onChange={(e) => updateForm("data", e.target.value)} />
            </Field>
            <Field label="Início*">
                <input required type="time" className={inputClass} value={form.inicio} onChange={(e) => updateForm("inicio", e.target.value)} />
            </Field>
            <Field label="Fim*">
                <input required type="time" className={inputClass} value={form.fim} onChange={(e) => updateForm("fim", e.target.value)} />
            </Field>
            <Field label="Carga horária" optional>
                <input min="0" type="number" step="0.5" className={inputClass} value={form.cargaHoraria} onChange={(e) => updateForm("cargaHoraria", e.target.value)} />
            </Field>
            <Field label="Capacidade" optional>
                <input min="1" type="number" className={inputClass} value={form.vagas} onChange={(e) => updateForm("vagas", e.target.value)} />
            </Field>
        </div>
        <button disabled={!houveAlteracao || saving} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl flex items-center justify-center gap-2 ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            {saving ? <CircleNotchIcon size={20} className="animate-spin" /> : "Salvar alterações"}
        </button>
    </motion.form>
);

const PalestraDetails = ({ palestraData, competenciaNomes, palestranteNomes, eventoNome, localNome, totalInscritos, totalPresentes }) => {
    const operationalStatus = getActivityStatus(palestraData, "palestra");

    return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Informações principais" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<CalendarIcon size={24} />} label="Data" value={formatarData(palestraData?.inicio)} />
                <DetailCard icon={<ClockIcon size={24} />} label="Horário" value={`${formatarHora(palestraData?.inicio)} - ${formatarHora(palestraData?.fim)}`} />
                <DetailCard icon={<UserIcon size={24} />} label="Palestrantes" value={palestranteNomes.join(", ")} />
                <DetailCard icon={<MedalIcon size={24} />} label="Competências" value={competenciaNomes.join(", ")} />
                <DetailCard icon={<LecternIcon size={24} />} label="Evento" value={eventoNome || "Sem evento"} />
                <DetailCard icon={<MapPinIcon size={24} />} label="Local / Sala" value={localNome || "Sem local"} />
                <DetailCard icon={<InfoIcon size={24} />} label="Tipo" value={formatarEnum(palestraData?.tipo)} />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-xs font-secondary text-primary/50 uppercase">Descrição</span>
                <p className="text-sm font-secondary text-primary/75 leading-relaxed bg-accent/20 rounded-2xl p-5 min-h-28">
                    {palestraData?.descricao || "Sem descrição cadastrada."}
                </p>
            </div>
        </div>
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Operação" />
            <div className="grid grid-cols-1 gap-4">
                <DetailCard icon={<SlidersHorizontalIcon size={24} />} label="Modalidade" value={formatarEnum(palestraData?.modalidade)} />
                <DetailCard
                    icon={<CheckCircleIcon size={24} />}
                    label="Status"
                    value={operationalStatus ? getOperationalStatusLabel(operationalStatus) : getPalestraStatusLabel(palestraData?.status)}
                    badgeClass={operationalStatus ? getOperationalStatusBadgeClass(operationalStatus) : ""}
                />
                <DetailCard icon={<ClockIcon size={24} />} label="Carga horária" value={palestraData?.cargaHoraria ? `${palestraData.cargaHoraria}h` : "-"} />
                <DetailCard icon={<UsersIcon size={24} />} label="Capacidade" value={palestraData?.vagas} />
                <DetailCard icon={<UsersIcon size={24} />} label="Inscritos" value={totalInscritos} />
                <DetailCard icon={<CheckCircleIcon size={24} />} label="Check-ins" value={totalPresentes} />
                <DetailCard icon={<QrCodeIcon size={24} />} label="QR inscrição" value={palestraData?.qrCodeToken ? "Disponível" : "-"} />
                <DetailCard icon={<QrCodeIcon size={24} />} label="QR check-in" value={palestraData?.qrCodeCheckinToken ? "Disponível" : "-"} />
            </div>
        </div>
    </motion.div>
    );
};

const PalestraDataTab = ({ totalInscritos, totalPresentes, taxaComparecimento, picosCheckin, checkinsComHorario }) => (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-5">
            <SectionTitle title="Comparecimento" />
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-4">
                <DataMetric icon={<UsersIcon size={24} />} label="Total de inscritos" value={totalInscritos} />
                <DataMetric icon={<CheckCircleIcon size={24} />} label="Total de presentes" value={totalPresentes} />
                <DataMetric icon={<ClockIcon size={24} />} label="Taxa de comparecimento" value={`${taxaComparecimento}%`} />
            </div>
            <div className="w-full h-3 rounded-full bg-accent/20 overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(taxaComparecimento, 100)}%` }} />
            </div>
            <p className="text-sm font-secondary text-primary/55">
                {totalPresentes} de {totalInscritos} inscrito(s) confirmaram presença.
            </p>
        </div>

        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-5">
            <SectionTitle title="Horários de pico de check-in" />
            {picosCheckin.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {picosCheckin.slice(0, 6).map((pico, index) => {
                        const max = picosCheckin[0]?.count || 1;
                        const width = Math.max((pico.count / max) * 100, 8);

                        return (
                            <div key={pico.label} className="bg-accent/15 rounded-2xl p-4 border border-accent/10">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <span className="font-primary font-bold text-primary">{index + 1}. {pico.label}</span>
                                    <span className="text-sm font-secondary text-primary/60">{pico.count} check-in(s)</span>
                                </div>
                                <div className="h-2 rounded-full bg-base-100/65 overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: `${width}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-accent/15 rounded-2xl p-5 border border-dashed border-accent/25 text-sm font-secondary text-primary/55">
                    Nenhum horário de check-in foi encontrado para esta palestra.
                </div>
            )}

            <div className="flex flex-col gap-3">
                <h3 className="text-base font-primary font-bold text-primary">Check-ins registrados</h3>
                {checkinsComHorario.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2">
                        {checkinsComHorario.map((checkin) => (
                            <div key={checkin.id} className="bg-accent/15 rounded-2xl p-4 border border-accent/10 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-primary font-bold text-primary truncate">{checkin.participanteNome || "Participante"}</p>
                                    <p className="text-xs font-secondary text-primary/55 truncate">{checkin.email || checkin.cpf || "Sem contato cadastrado"}</p>
                                </div>
                                <span className="text-sm font-secondary font-semibold text-primary whitespace-nowrap">
                                    {formatarDataHora(checkin.horarioCheckin)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-accent/15 rounded-2xl p-5 border border-dashed border-accent/25 text-sm font-secondary text-primary/55">
                        Nenhum check-in com horário registrado.
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const DataMetric = ({ icon, label, value }) => (
    <div className="bg-accent/20 rounded-2xl p-5 flex items-center gap-4 min-h-24">
        <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">{icon}</div>
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-secondary text-primary/50 uppercase">{label}</span>
            <span className="text-3xl font-primary font-bold text-primary">{value}</span>
        </div>
    </div>
);

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
        <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">{icon}</div>
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-secondary text-primary/50 uppercase">{label}</span>
            <span className={`text-lg font-primary font-bold break-words ${badgeClass ? `${badgeClass} rounded-xl px-3 py-1 w-fit` : "text-primary"}`}>{value || "-"}</span>
        </div>
    </div>
);

const SummaryPill = ({ icon, label, value }) => (
    <div className="bg-base-100/50 rounded-2xl px-4 py-3 flex items-center gap-3 border border-accent/10 min-w-0">
        <div className="text-primary/60 shrink-0">{icon}</div>
        <div className="min-w-0">
            <p className="text-[10px] font-secondary text-primary/40 uppercase">{label}</p>
            <p className="text-sm font-primary font-bold text-primary truncate">{value}</p>
        </div>
    </div>
);

const SectionTitle = ({ title }) => <h2 className="text-xl font-primary font-bold text-primary">{title}</h2>;

const ActionCard = ({ icon, title, description, buttonLabel, onClick, danger, disabled }) => (
    <div className={`rounded-3xl p-7 flex flex-col gap-5 border ${disabled ? "opacity-60 bg-primary/5 border-primary/10" : danger ? "bg-error/10 border-error/20" : "bg-accent/10 border-accent/15"}`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${danger ? "bg-error/20 text-error" : "bg-accent/30 text-primary"}`}>{icon}</div>
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-primary font-bold text-primary">{title}</h2>
            <p className="text-sm font-secondary text-primary/60">{description}</p>
        </div>
        <button type="button" disabled={disabled} onClick={onClick} className={`w-full text-sm font-secondary py-4 rounded-xl transition-colors ${disabled ? "bg-primary/10 text-primary/45 cursor-not-allowed" : danger ? "bg-error/80 hover:bg-error text-secondary cursor-pointer" : "bg-accent hover:bg-accent/80 text-primary cursor-pointer"}`}>
            {buttonLabel}
        </button>
    </div>
);

const inputClass = "w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 outline-none focus:border-accent transition-colors";
const selectClasses = {
    control: () => "basic-multi-select bg-accent/30 px-4 py-2 min-h-15 border border-accent/20 rounded-xl text-primary text-sm",
    multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
    multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
    menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
    placeholder: () => "text-primary/75 font-secondary text-sm",
    option: ({ isFocused }) => `px-4 py-3 ${isFocused ? "bg-accent/50 rounded-xl" : ""}`
};

export default PalestraDetalhe;
