import { useState } from "react";
import { CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import AlunoAvatar from '../utils/AlunoAvatar';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Card de palestrante
const PalestranteCard = ({ palestrante, check }) => {
    const [selecionado, setSelecionado] = useState(false)
    const navigate = useNavigate();

    const navegarPalestrante = () => {
        navigate(`/palestrante/${palestrante.id}`)
    }

    return (
        <motion.div 
            onClick={navegarPalestrante} 
            whileHover={{ scale: 1.01, x: 4, backgroundColor: "rgba(252, 209, 96, 0.8)" }}
            whileTap={{ scale: 0.99 }}
            className={`flex items-center gap-4 bg-accent/60 rounded-2xl px-5 py-4 transition-all group cursor-pointer ${selecionado ? "ring-2 ring-primary/30" : ""}`}
        >
            {/* Checkbox */}
            {check ? <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setSelecionado(!selecionado); }} className={`w-7 h-7 rounded-lg border-2 shrink-0 transition-all cursor-pointer ${selecionado ? "bg-primary/10 border-primary/40" : "bg-accent/30 border-primary/20 hover:border-primary/40"}`}/>
                <CheckIcon size={20} weight="light" className={`absolute text-primary top-1 left-1 pointer-events-none ${selecionado ? "opacity-75" : "opacity-0"}`}/>
            </div> : null}

            {/* Avatar */}
            <AlunoAvatar email={palestrante.email} nome={palestrante.nome} />

            {/* Infos */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-base font-primary font-bold text-primary truncate">{palestrante.nome}</span>
                    <div className="badge badge-primary badge-outline text-[10px] h-4 font-secondary">Palestrante</div>
                </div>
                <span className="text-xs font-secondary text-primary/60 truncate">
                    {palestrante.email}
                    <span className="mx-2 text-primary/30">|</span>
                    CPF: {palestrante.cpf}
                </span>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="text-primary/50 group-hover:text-primary transition-colors p-1 group-hover:translate-x-1 transition-transform">
                    <CaretRightIcon size={18} weight="light" />
                </div>
            </div>
        </motion.div>
    )
}

export default PalestranteCard;
