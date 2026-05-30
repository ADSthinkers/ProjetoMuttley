import { useState } from "react";
import { CaretRightIcon, CheckIcon, EnvelopeIcon, GraduationCapIcon, HashIcon, IdentificationCardIcon } from "@phosphor-icons/react";
import Avatar from '../utils/Avatar';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Card de participante
const ParticipanteCard = ({ participante, check }) => {
    const [selecionado, setSelecionado] = useState(false)
    const navigate = useNavigate();

    const navegarParticipante = () => {
        navigate(`/participante/${participante.id}`)
    }

    return (
        <motion.div 
            onClick={navegarParticipante} 
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`relative overflow-hidden flex flex-col gap-5 bg-accent/25 hover:bg-accent/35 border border-accent/15 rounded-3xl p-5 transition-all group cursor-pointer min-h-72 ${selecionado ? "ring-2 ring-primary/30" : ""}`}
        >
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/20 rounded-bl-[40px]" />

            <div className="flex items-start justify-between gap-4 z-10">
                <div className="flex items-center gap-4 min-w-0">
                    <Avatar email={participante.email} nome={participante.nome} className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-accent/40" />
                    <div className="min-w-0">
                        <h3 className="text-xl font-primary font-bold text-primary leading-tight truncate">{participante.nome}</h3>
                        <p className="text-xs font-secondary text-primary/50 mt-1 truncate">{participante.curso || "Participante"}</p>
                    </div>
                </div>

                {check ? (
                    <div className="relative shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); setSelecionado(!selecionado); }} className={`w-8 h-8 rounded-xl border-2 shrink-0 transition-all cursor-pointer ${selecionado ? "bg-accent border-primary/40" : "bg-base-100/40 border-primary/15 hover:border-primary/40"}`}/>
                        <CheckIcon size={20} weight="light" className={`absolute text-primary top-1.5 left-1.5 pointer-events-none ${selecionado ? "opacity-75" : "opacity-0"}`}/>
                    </div>
                ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2 z-10">
                <InfoLine icon={<EnvelopeIcon size={16} />} value={participante.email} />
                {participante.email2 && <InfoLine icon={<EnvelopeIcon size={16} />} value={participante.email2} muted />}
                <div className="grid grid-cols-2 gap-2">
                    <InfoPill icon={<IdentificationCardIcon size={15} />} value={participante.cpf || "-"} />
                    <InfoPill icon={<HashIcon size={15} />} value={participante.ra || "Sem RA"} />
                </div>
                <InfoLine icon={<GraduationCapIcon size={16} />} value={participante.curso || "Curso não informado"} muted />
            </div>

            <div className="mt-auto z-10 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="badge bg-accent/60 border-0 text-primary rounded-xl font-secondary">Participante</span>
                <div className="w-10 h-10 rounded-xl bg-base-100/60 group-hover:bg-accent flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <CaretRightIcon size={18} weight="light" />
                </div>
            </div>
        </motion.div>
    )
}

const InfoLine = ({ icon, value, muted }) => (
    <div className={`flex items-center gap-2 min-w-0 text-sm font-secondary ${muted ? "text-primary/45" : "text-primary/65"}`}>
        <span className="shrink-0 text-primary/35">{icon}</span>
        <span className="truncate">{value || "-"}</span>
    </div>
);

const InfoPill = ({ icon, value }) => (
    <div className="flex items-center gap-1.5 min-w-0 bg-base-100/50 border border-accent/10 rounded-xl px-3 py-2 text-xs font-secondary text-primary/60">
        <span className="shrink-0 text-primary/35">{icon}</span>
        <span className="truncate">{value}</span>
    </div>
);

export default ParticipanteCard
