import { useState } from "react";
import { DotsThreeIcon, CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import AlunoAvatar from '../utils/AlunoAvatar';
import { useNavigate } from "react-router-dom";



// Card de aluno
const AlunoCard = ({ aluno, check }) => {
    const [selecionado, setSelecionado] = useState(false)
    console.log(check);

    const navigate = useNavigate();

    const navegarAluno = () => {
        navigate(`/aluno/${aluno.id}`)
    }
    

    return (
        <div onClick={navegarAluno} className={`flex items-center gap-4 bg-accent/60 rounded-2xl px-5 py-4 transition-all hover:bg-accent/80 group cursor-pointer ${selecionado ? "ring-2 ring-primary/30" : ""}`}>
            {/* Checkbox */}
            {check ? <div className="relative">
                <button onClick={() => setSelecionado(!selecionado)} className={`w-7 h-7 rounded-lg border-2 shrink-0 transition-all cursor-pointer ${selecionado ? "bg-primary/10 border-primary/40" : "bg-accent/30 border-primary/20 hover:border-primary/40"}`}/>
                <CheckIcon size={20} weight="light" className={`absolute text-primary top-1 left-1 pointer-events-none ${selecionado ? "opacity-75" : "opacity-0"}`}/>
            </div> : null}

            {/* Avatar */}
            <AlunoAvatar email={aluno.emailPessoal} nome={aluno.nome} />

            {/* Infos */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-base font-primary font-bold text-primary truncate">{aluno.nome}</span>
                <span className="text-xs font-secondary text-primary/60 truncate">
                    {aluno.emailPessoal}
                    <span className="mx-2 text-primary/30">|</span>
                    {aluno.emailFatec}
                </span>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 shrink-0">
                <button className="text-primary/50 hover:text-primary transition-colors cursor-pointer p-1">
                    <CaretRightIcon size={18} weight="light" />
                </button>
            </div>
        </div>
    )
}

export default AlunoCard