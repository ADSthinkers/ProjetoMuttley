import Sidebar from "../components/Sidebar";
import Select from "react-select";
import QRCode from "qrcode";
import {
    CalendarIcon,
    CheckCircleIcon,
    CircleNotchIcon,
    ClockIcon,
    InfoIcon,
    LecternIcon,
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

const toDateInput = (value) => value ? new Date(value).toISOString().split("T")[0] : "";
const toTimeInput = (value) => value ? new Date(value).toTimeString().substring(0, 5) : "";

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
    const [participantes, setParticipantes] = useState([]);
    const [participantesSelecionados, setParticipantesSelecionados] = useState([]);
    const [buscaParticipante, setBuscaParticipante] = useState("");
    const [isConcluido, setIsConcluido] = useState(false);
    const [presencaLancada, setPresencaLancada] = useState(false);
    const [qrAberto, setQrAberto] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");

    const [form, setForm] = useState({
        titulo: "",
        descricao: "",
        competenciaIds: [],
        palestranteIds: [],
        eventoId: "",
        data: "",
        inicio: "",
        fim: "",
        tipo: "",
        modalidade: "",
        cargaHoraria: "",
        vagas: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!idPal) return;

            try {
                const [palRes, compRes, palestrantesRes, eventosRes, participantesRes] = await Promise.all([
                    api.get(`/palestras/${idPal}`),
                    api.get("/competencias"),
                    api.get("/palestrantes"),
                    api.get("/eventos"),
                    api.get("/participantes")
                ]);

                const palestra = palRes.data;
                setPalestraData(palestra);
                setIsConcluido(Boolean(palestra.concluido));
                setPresencaLancada(Boolean(palestra.presencaLancada));
                setCompetenciasDisponiveis(compRes.data.map((c) => ({ value: c.id, label: c.nome })));
                setPalestrantesDisponiveis(palestrantesRes.data.map((p) => ({ value: p.id, label: p.nome })));
                setEventosDisponiveis(eventosRes.data.map((e) => ({ value: e.id, label: e.titulo })));
                setParticipantes(participantesRes.data);
                setForm({
                    titulo: palestra.titulo || "",
                    descricao: palestra.descricao || "",
                    competenciaIds: palestra.competenciaIds || [],
                    palestranteIds: palestra.palestranteIds || [],
                    eventoId: palestra.eventoId || "",
                    data: toDateInput(palestra.inicio),
                    inicio: toTimeInput(palestra.inicio),
                    fim: toTimeInput(palestra.fim),
                    tipo: palestra.tipo || "",
                    modalidade: palestra.modalidade || "",
                    cargaHoraria: palestra.cargaHoraria ?? "",
                    vagas: palestra.vagas ?? ""
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
            form.data !== toDateInput(palestraData.inicio) ||
            form.inicio !== toTimeInput(palestraData.inicio) ||
            form.fim !== toTimeInput(palestraData.fim) ||
            form.tipo !== (palestraData.tipo || "") ||
            form.modalidade !== (palestraData.modalidade || "") ||
            String(form.cargaHoraria) !== String(palestraData.cargaHoraria ?? "") ||
            String(form.vagas) !== String(palestraData.vagas ?? "");
    }, [form, palestraData]);

    const competenciaNomes = competenciasDisponiveis.filter((c) => (palestraData?.competenciaIds || []).includes(c.value)).map((c) => c.label);
    const palestranteNomes = palestrantesDisponiveis.filter((p) => (palestraData?.palestranteIds || []).includes(p.value)).map((p) => p.label);
    const eventoNome = eventosDisponiveis.find((e) => e.value === palestraData?.eventoId)?.label;
    const publicQrUrl = palestraData?.qrCodeToken ? `${window.location.origin}/qrcode/${palestraData.qrCodeToken}` : "";
    const qrFileName = `qrcode-${(palestraData?.titulo || "palestra").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.png`;

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    useEffect(() => {
        if (!qrAberto || !publicQrUrl) return;

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

    const calcularHoras = () => {
        if (!palestraData?.inicio || !palestraData?.fim) return 1;
        const horas = Math.floor((new Date(palestraData.fim) - new Date(palestraData.inicio)) / 36e5);
        return Math.max(1, horas);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: form.titulo,
            descricao: form.descricao,
            competenciaIds: form.competenciaIds,
            palestranteIds: form.palestranteIds,
            eventoId: form.eventoId || null,
            inicio: `${form.data}T${form.inicio}:00`,
            fim: `${form.data}T${form.fim}:00`,
            tipo: form.tipo || null,
            modalidade: form.modalidade || null,
            cargaHoraria: form.cargaHoraria ? Number(form.cargaHoraria) : null,
            vagas: form.vagas ? Number(form.vagas) : null
        };

        try {
            const response = await api.put(`/palestras/${idPal}`, payload);
            setPalestraData(response.data);
            setIsEditing(false);
            toast.success("Palestra atualizada com sucesso.");
        } catch (err) {
            console.error("Erro ao salvar palestra:", err);
            toast.error("Erro ao salvar alterações.");
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

    const abrirPresenca = () => {
        setIsConcluido(true);
        document.getElementById("modal_lancar_presenca").showModal();
    };

    const confirmarPresenca = async () => {
        if (participantesSelecionados.length === 0) {
            toast.error("Selecione pelo menos um participante.");
            return;
        }

        try {
            await Promise.all(participantesSelecionados.map((participanteId) => (
                api.post("/participacoes", {
                    horas: calcularHoras(),
                    participanteId,
                    palestraId: Number(idPal)
                }).catch(() => null)
            )));
            setPresencaLancada(true);
            toast.success("Presença lançada com sucesso.");
            document.getElementById("modal_lancar_presenca").close();
        } catch (err) {
            console.error("Erro ao lançar presença:", err);
            toast.error("Erro ao lançar presença.");
        }
    };

    const participantesFiltrados = participantes.filter((participante) => {
        const termo = buscaParticipante.toLowerCase();
        return participante.nome?.toLowerCase().includes(termo) ||
            participante.email?.toLowerCase().includes(termo) ||
            participante.email2?.toLowerCase().includes(termo) ||
            participante.cpf?.toLowerCase().includes(termo);
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
                            <SummaryPill icon={<CheckCircleIcon size={18} />} label="Status" value={isConcluido ? "Concluída" : "Aberta"} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="tabs tabs-box bg-accent/30 rounded-2xl p-1 w-full">
                        <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-secondary text-primary text-sm cursor-pointer ${activeTab === "detalhes" ? "bg-accent font-semibold" : "hover:bg-accent/30"}`} onClick={() => setActiveTab("detalhes")}>
                            <InfoIcon size={20} />
                            Detalhes
                        </button>
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
                            />
                        )
                    )}

                    {activeTab === "acoes" && (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            <ActionCard
                                icon={<CheckCircleIcon size={44} />}
                                title={isConcluido ? "Palestra concluída" : "Concluir palestra"}
                                description="Ao concluir, a lista de presença será aberta para seleção dos participantes."
                                buttonLabel={isConcluido ? (presencaLancada ? "Editar presença" : "Lançar presença") : "Concluir e lançar presença"}
                                onClick={abrirPresenca}
                            />
                            <ActionCard
                                icon={<QrCodeIcon size={44} />}
                                title="Gerar QR Code"
                                description="Gera o QR Code público para registro externo de presença."
                                buttonLabel="Abrir QR Code"
                                onClick={() => setQrAberto(true)}
                            />
                            <ActionCard
                                danger
                                icon={<TrashSimpleIcon size={44} />}
                                title="Apagar palestra"
                                description="Remove esta palestra permanentemente do sistema."
                                buttonLabel="Apagar permanentemente"
                                onClick={() => document.getElementById("modal_confirmar_apagar_palestra").showModal()}
                            />
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
                        <h3 className="text-3xl font-primary text-primary font-bold">{presencaLancada ? "Editar presença" : "Lançar presença"}</h3>
                        <p className="text-sm font-secondary text-primary/60">Selecione os participantes presentes nesta palestra.</p>
                    </div>
                    <input
                        type="text"
                        value={buscaParticipante}
                        onChange={(e) => setBuscaParticipante(e.target.value)}
                        placeholder="Buscar por nome, CPF ou e-mail"
                        className="w-full text-sm p-4 bg-accent/20 border border-accent/20 rounded-xl font-secondary text-primary/80 outline-none focus:border-accent"
                    />
                    <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
                        {participantesFiltrados.map((participante) => {
                            const checked = participantesSelecionados.includes(participante.id);
                            return (
                                <label key={participante.id} className="bg-accent/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-accent/30 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-sm checkbox-accent border-primary/20 rounded-sm"
                                        checked={checked}
                                        onChange={() => {
                                            setParticipantesSelecionados((current) => checked
                                                ? current.filter((id) => id !== participante.id)
                                                : [...current, participante.id]
                                            );
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <p className="font-primary font-bold text-primary truncate">{participante.nome}</p>
                                        <p className="font-secondary text-xs text-primary/60 truncate">{participante.email} | CPF: {participante.cpf}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <button onClick={confirmarPresenca} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary">
                        Confirmar presença
                    </button>
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
                                <h3 className="text-2xl font-primary font-bold text-primary">QR Code da palestra</h3>
                                <p className="text-sm font-secondary text-primary/60">Participantes externos podem acessar a rota pública.</p>
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

const PalestraEditForm = ({ form, updateForm, competenciasDisponiveis, palestrantesDisponiveis, eventosDisponiveis, saving, houveAlteracao, handleSave }) => (
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
                <Select options={eventosDisponiveis} value={eventosDisponiveis.find((e) => e.value === form.eventoId)} unstyled isClearable onChange={(option) => updateForm("eventoId", option ? option.value : "")} placeholder="Selecione um evento" classNames={selectClasses} />
            </Field>
            <Field label="Tipo" optional>
                <Select options={tiposPalestra} value={tiposPalestra.find((t) => t.value === form.tipo)} unstyled isClearable onChange={(option) => updateForm("tipo", option ? option.value : "")} placeholder="Selecione um tipo" classNames={selectClasses} />
            </Field>
            <Field label="Modalidade" optional>
                <Select options={modalidades} value={modalidades.find((m) => m.value === form.modalidade)} unstyled isClearable onChange={(option) => updateForm("modalidade", option ? option.value : "")} placeholder="Selecione uma modalidade" classNames={selectClasses} />
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
            <Field label="Vagas" optional>
                <input min="0" type="number" className={inputClass} value={form.vagas} onChange={(e) => updateForm("vagas", e.target.value)} />
            </Field>
        </div>
        <button disabled={!houveAlteracao || saving} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl flex items-center justify-center gap-2 ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            {saving ? <CircleNotchIcon size={20} className="animate-spin" /> : "Salvar alterações"}
        </button>
    </motion.form>
);

const PalestraDetails = ({ palestraData, competenciaNomes, palestranteNomes, eventoNome }) => (
    <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        <div className="bg-accent/10 border border-accent/15 rounded-3xl p-7 flex flex-col gap-6">
            <SectionTitle title="Informações principais" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard icon={<CalendarIcon size={24} />} label="Data" value={formatarData(palestraData?.inicio)} />
                <DetailCard icon={<ClockIcon size={24} />} label="Horário" value={`${formatarHora(palestraData?.inicio)} - ${formatarHora(palestraData?.fim)}`} />
                <DetailCard icon={<UserIcon size={24} />} label="Palestrantes" value={palestranteNomes.join(", ")} />
                <DetailCard icon={<MedalIcon size={24} />} label="Competências" value={competenciaNomes.join(", ")} />
                <DetailCard icon={<LecternIcon size={24} />} label="Evento" value={eventoNome || "Sem evento"} />
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
                <DetailCard icon={<ClockIcon size={24} />} label="Carga horária" value={palestraData?.cargaHoraria ? `${palestraData.cargaHoraria}h` : "-"} />
                <DetailCard icon={<UsersIcon size={24} />} label="Vagas" value={palestraData?.vagas} />
                <DetailCard icon={<QrCodeIcon size={24} />} label="Token QR" value={palestraData?.qrCodeToken ? "Disponível" : "-"} />
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
        <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">{icon}</div>
        <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-secondary text-primary/50 uppercase">{label}</span>
            <span className="text-lg font-primary font-bold text-primary break-words">{value || "-"}</span>
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

const ActionCard = ({ icon, title, description, buttonLabel, onClick, danger }) => (
    <div className={`rounded-3xl p-7 flex flex-col gap-5 border ${danger ? "bg-error/10 border-error/20" : "bg-accent/10 border-accent/15"}`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${danger ? "bg-error/20 text-error" : "bg-accent/30 text-primary"}`}>{icon}</div>
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-primary font-bold text-primary">{title}</h2>
            <p className="text-sm font-secondary text-primary/60">{description}</p>
        </div>
        <button type="button" onClick={onClick} className={`w-full text-sm font-secondary py-4 rounded-xl cursor-pointer transition-colors ${danger ? "bg-error/80 hover:bg-error text-secondary" : "bg-accent hover:bg-accent/80 text-primary"}`}>
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
