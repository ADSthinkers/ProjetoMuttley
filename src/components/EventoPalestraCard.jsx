import Textura from "../assets/textura.webp"
import { LecternIcon, CalendarStarIcon, CaretRightIcon } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom";
import { getPalestraStatusBadgeClass, getPalestraStatusLabel } from "../utils/palestraStatus";


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

const Badge = ({ tipo }) => (
    <span className="bg-primary/10 px-3 py-1.5 rounded-full w-fit">
        <div className="flex gap-1.5 text-primary/90 text-xs font-secondary font-medium self-center">
            {tipo.toLowerCase() === "palestra" ? <LecternIcon size={13} weight="light" /> : <CalendarStarIcon size={13} weight="light" />}
            {tipo}
        </div>
    </span>
)

const StatusBadge = ({ item }) => {
    if (item.tipo?.toLowerCase() !== "palestra") return null;

    return (
        <span className={`px-3 py-1.5 rounded-full w-fit text-xs font-secondary font-medium ${getPalestraStatusBadgeClass(item.status || "PENDENTE")}`}>
            {getPalestraStatusLabel(item.status)}
        </span>
    );
};

// ── Variante FULL (com imagem) ────────────────────────────────────────────────
const CardFull = ({ item, navegarItem }) => (

    <div onClick={navegarItem} className="flex flex-col rounded-3xl overflow-hidden bg-accent/70 hover:bg-accent/90 transition-all group w-72">
        {/* Imagem */}
        <div className="h-50 overflow-hidden">
            <img src={item.imagem ?? Textura} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col justify-between py-5 px-4 h-50"> 
            {/* 1. Badge fica no topo */}
            <div className="flex flex-wrap gap-2">
                <Badge tipo={item.tipo} />
                <StatusBadge item={item} />
            </div>

            {/* 2. O Título ocupará o espaço central */}
            <h3 className={`font-primary font-bold text-primary leading-snug ${item.titulo.length > 50 ? "text-base" : "text-xl"}`}>
                {item.titulo}
            </h3>

            {/* 3. A div de data/ícone fica no rodapé */}
            <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-secondary text-primary/50">
                    {formatarData(item.inicio)}{item.tipo.toLowerCase() === "evento" ? ` - ${formatarData(item.fim)}` : ""}  
                </span>
                <CaretRightIcon size={18} weight="light" className="text-primary/50 group-hover:translate-x-0.5 transition-transform"/>
            </div>
        </div>
    </div>
)



// ── Variante COMPACT (sem imagem) ─────────────────────────────────────────────
const CardCompact = ({ item, navegarItem}) => (
    <div onClick={navegarItem} className="flex items-center gap-4 bg-accent/70 rounded-2xl px-6 py-5 hover:bg-accent/90 transition-all group w-full">
        {/* Conteúdo */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Data + Badge */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-secondary text-primary/50 shrink-0">
                    {formatarData(item.data)}
                </span>
                <Badge tipo={item.tipo} />
                <StatusBadge item={item} />
            </div>

            {/* Título + Descrição */}
            <h3 className="text-lg font-primary font-bold text-primary leading-snug truncate">
                {item.titulo}
            </h3>
            {item.descricao && (
                <p className="text-sm font-secondary text-primary/60 truncate">
                    {item.descricao}
                </p>
            )}
        </div>

        {/* Seta */}
        <CaretRightIcon
            size={18}
            weight="light"
            className="text-primary/50 shrink-0 group-hover:translate-x-0.5 transition-transform"
        />
    </div>
)

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
