import { sha256 } from 'js-sha256';
import { useState } from "react";
import { DotsThreeIcon, CaretRightIcon, CheckIcon } from "@phosphor-icons/react";

// Componente de avatar com fallback
const AlunoAvatar = ({ email, nome }) => {
    const [erro, setErro] = useState(false)

    const hash = sha256.create();
    hash.update(email.trim().toLowerCase());

    const url = `https://www.gravatar.com/avatar/${hash}?d=404`;
    console.log(hash.hex());
    
    const nomeFatia = nome.split(" ");
    const letraIni = nomeFatia[0].split("")
    const letraFim = nomeFatia[nomeFatia.length - 1].split("")

    if (erro) {
        return (
            <div className="w-12 h-12 rounded-full bg-accent/60 flex items-center justify-center shrink-0 font-primary text-primary/75 select-none ">
                {letraIni[0]}{letraFim[0]}
            </div>
        )
    }

    return (
        <img src={url} alt={nome} onError={() => setErro(true)} className="w-12 h-12 rounded-full object-cover shrink-0"/>
    )
}

// Card de aluno
const AlunoCard = ({ aluno, pageAluno }) => {
    const [selecionado, setSelecionado] = useState(false)
    console.log(pageAluno);
    

    return (
        <div className={`flex items-center gap-4 bg-accent/60 rounded-2xl px-5 py-4 transition-all hover:bg-accent/80 group cursor-pointer ${selecionado ? "ring-2 ring-primary/30" : ""}`}>
            {/* Checkbox */}
            {pageAluno ? <div className="relative">
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