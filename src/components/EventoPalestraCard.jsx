import Textura from "../assets/textura.webp"
import { LecternIcon, CalendarStarIcon, CaretRightIcon, ClockIcon, MapPinIcon, UsersIcon } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom";
import { getPalestraStatusBadgeClass, getPalestraStatusLabel } from "../utils/palestraStatus";
import { getActivityStatus, getOperationalStatusBadgeClass, getOperationalStatusLabel, isArchived, isCanceled } from "../utils/activityStatus";


/**
 * EventoPalestraCard
 *
 * Props:
 *  - tipo:      "full" | "compact"
 *  - item:      { tipo: "Palestra"|"Evento", titulo, descricao, data, link }
 *               data pode ser string formatada ("27 de março de 2026") ou objeto Date
 */


const formatarData = (data) => {
    if (!data) return ""
    if (typeof data === "string") return data
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

const formatarHora = (data) => {
    if (!data || typeof data === "string") return "";
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const Badge = ({ tipo }) => (
    <span className="bg-base-100/85 border border-accent/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-sm">
        <div className="flex gap-1.5 text-primary text-xs font-secondary font-semibold self-center">
            {tipo.toLowerCase() === "palestra" ? <LecternIcon size={13} weight="light" /> : <CalendarStarIcon size={13} weight="light" />}
            {tipo}
        </div>
    </span>
)

const StatusBadge = ({ item }) => {
    const operationalStatus = getActivityStatus(item, item.tipo?.toLowerCase());
    if (operationalStatus) {
        return (
            <span className={`px-3 py-1.5 rounded-full w-fit text-xs font-secondary font-medium ${getOperationalStatusBadgeClass(operationalStatus)}`}>
                {getOperationalStatusLabel(operationalStatus)}
            </span>
        );
    }

    if (item.tipo?.toLowerCase() !== "palestra") return null;

    return (
        <span className={`px-3 py-1.5 rounded-full w-fit text-xs font-secondary font-medium ${getPalestraStatusBadgeClass(item.status || "PENDENTE")}`}>
            {getPalestraStatusLabel(item.status)}
        </span>
    );
};

const getImagem = (item) => item.banner || item.imagem || Textura;

// ── Variante FULL (com imagem) ────────────────────────────────────────────────
const CardFull = ({ item, navegarItem }) => {
    const type = item.tipo?.toLowerCase();
    const canceled = isCanceled(item, type);
    const archived = isArchived(item, type);

    return (
    <div onClick={navegarItem} className={`flex flex-col rounded-3xl overflow-hidden bg-accent/25 hover:bg-accent/35 border transition-all group w-full min-h-[430px] cursor-pointer ${canceled ? "opacity-45 border-error/20" : archived ? "opacity-70 grayscale border-primary/15" : "border-accent/15"}`}>
        <div className="h-52 overflow-hidden relative bg-accent/20">
            <img src={getImagem(item)} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
            <div className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-2">
                <Badge tipo={item.tipo} />
                <StatusBadge item={item} />
            </div>
            <div className="absolute bottom-4 left-4 bg-base-100/90 rounded-2xl px-4 py-2 border border-accent/20 backdrop-blur-sm">
                <p className="text-[10px] font-secondary uppercase text-primary/45">Data</p>
                <p className="text-sm font-primary font-bold text-primary">{formatarData(item.inicio)}</p>
            </div>
        </div>

        <div className="flex flex-col gap-4 p-5 flex-1"> 
            <div className="min-h-24">
                <h3 className="font-primary font-bold text-primary leading-tight text-2xl line-clamp-2">
                    {item.titulo}
                </h3>
                <p className="text-sm font-secondary text-primary/60 leading-snug mt-2 line-clamp-2">
                    {item.descricao || "Sem descrição cadastrada."}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                <MetaPill icon={<ClockIcon size={15} />} label="Horário" value={formatarHora(item.inicio) || "-"} />
                {item.tipo?.toLowerCase() === "palestra" && (
                    <MetaPill icon={<UsersIcon size={15} />} label="Capacidade" value={item.vagas ?? "Livre"} />
                )}
                {item.tipo?.toLowerCase() === "palestra" && item.localNome && (
                    <MetaPill icon={<MapPinIcon size={15} />} label="Local" value={item.localNome} />
                )}
                {item.tipo?.toLowerCase() === "evento" && (
                    <MetaPill icon={<CalendarStarIcon size={15} />} label="Fim" value={formatarData(item.fim) || "-"} />
                )}
                {item.modalidade && <MetaPill icon={<LecternIcon size={15} />} label="Modalidade" value={formatarEnum(item.modalidade)} />}
            </div>

            <div className="flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="text-xs font-secondary text-primary/45">Abrir detalhes</span>
                <div className="w-10 h-10 rounded-xl bg-base-100/60 group-hover:bg-accent flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <CaretRightIcon size={18} weight="light" />
                </div>
            </div>
        </div>
    </div>
    );
};



// ── Variante COMPACT (sem imagem) ─────────────────────────────────────────────
const CardCompact = ({ item, navegarItem}) => {
    const type = item.tipo?.toLowerCase();
    const canceled = isCanceled(item, type);
    const archived = isArchived(item, type);

    return (
    <div onClick={navegarItem} className={`flex items-center gap-4 bg-accent/25 hover:bg-accent/35 border rounded-2xl px-5 py-4 transition-all group w-full cursor-pointer ${canceled ? "opacity-45 border-error/20" : archived ? "opacity-70 grayscale border-primary/15" : "border-accent/15"}`}>
        <div className="w-18 h-18 rounded-2xl overflow-hidden bg-accent/30 shrink-0">
            <img src={getImagem(item)} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-sm font-secondary text-primary/50 shrink-0">
                    {formatarData(item.data)}
                </span>
                <Badge tipo={item.tipo} />
                <StatusBadge item={item} />
            </div>

            <h3 className="text-lg font-primary font-bold text-primary leading-snug truncate">
                {item.titulo}
            </h3>
            {item.descricao && (
                <p className="text-sm font-secondary text-primary/60 truncate">
                    {item.descricao}
                </p>
            )}
        </div>

        <div className="w-9 h-9 rounded-xl bg-base-100/60 group-hover:bg-accent flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
            <CaretRightIcon size={18} weight="light" />
        </div>
    </div>
    );
};

const MetaPill = ({ icon, label, value }) => (
    <div className="bg-base-100/55 border border-accent/10 rounded-2xl px-3 py-2 min-w-0">
        <div className="flex items-center gap-1.5 text-primary/40">
            {icon}
            <span className="text-[10px] font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-sm font-primary font-bold text-primary truncate mt-0.5">{value}</p>
    </div>
);

const formatarEnum = (value) => {
    if (!value) return "-";
    return value.toLowerCase().replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};

// ── Componente principal ──────────────────────────────────────────────────────
const EventoPalestraCard = ({ tipo = "full", item }) => {

    const navigate = useNavigate();

    const navegarItem = () => {
        navigate(`/${item.tipo.toLowerCase()}/${item.id}`)
    }

    if (tipo === "compact") return <CardCompact item={item} navegarItem={navegarItem} />
    return <CardFull item={item} navegarItem={navegarItem} />
}

export default EventoPalestraCard
