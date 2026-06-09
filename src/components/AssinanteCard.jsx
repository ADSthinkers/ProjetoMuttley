import { BriefcaseIcon, CaretRightIcon, EnvelopeIcon, FileTextIcon, IdentificationCardIcon } from "@phosphor-icons/react";
import Avatar from "../utils/Avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AssinanteCard = ({ assinante }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            onClick={() => navigate(`/assinante/${assinante.id}`)}
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative overflow-hidden flex flex-col gap-5 bg-accent/25 hover:bg-accent/35 border border-accent/15 rounded-3xl p-5 transition-all group cursor-pointer min-h-72"
        >
            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/20 rounded-bl-[40px]" />

            <div className="flex items-start gap-4 z-10 min-w-0">
                <Avatar email={assinante.email} nome={assinante.nome} className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-accent/40" />
                <div className="min-w-0">
                    <h3 className="text-xl font-primary font-bold text-primary leading-tight truncate">{assinante.nome}</h3>
                    <p className="text-xs font-secondary text-primary/50 mt-1 truncate">{assinante.cargo || "Assinante"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 z-10">
                <InfoLine icon={<EnvelopeIcon size={16} />} value={assinante.email} />
                <div className="grid grid-cols-2 gap-2">
                    <InfoPill icon={<IdentificationCardIcon size={15} />} value={assinante.cpf || "Sem CPF"} />
                    <InfoPill icon={<BriefcaseIcon size={15} />} value={assinante.cargo || "Sem cargo"} />
                </div>
                <InfoLine icon={<FileTextIcon size={16} />} value="Assinatura cadastrada no backend" muted />
            </div>

            <div className="mt-auto z-10 flex items-center justify-between border-t border-primary/10 pt-4">
                <span className="badge bg-accent/60 border-0 text-primary rounded-xl font-secondary">Assinante</span>
                <div className="w-10 h-10 rounded-xl bg-base-100/60 group-hover:bg-accent flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    <CaretRightIcon size={18} weight="light" />
                </div>
            </div>
        </motion.div>
    );
};

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

export default AssinanteCard;
