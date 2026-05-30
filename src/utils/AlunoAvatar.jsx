import { useState } from "react";
import { sha256 } from "js-sha256";

const AlunoAvatar = ({ email, nome, className }) => {
    const [erro, setErro] = useState(false)

    const hash = sha256.create();
    hash.update(email.trim().toLowerCase());

    const url = `https://www.gravatar.com/avatar/${hash}?d=404`;
    //console.log(hash.hex());
    
    const nomeFatia = nome.split(" ");
    const letraIni = nomeFatia[0].split("")
    const letraFim = nomeFatia[nomeFatia.length - 1].split("")

    const defaultClass = "w-12 h-12 rounded-full object-cover shrink-0";
    const finalClass = className || defaultClass;

    if (erro) {
        return (
            <div className={`rounded-full bg-accent/60 flex items-center justify-center shrink-0 font-primary text-primary/75 select-none ${className || "w-12 h-12"}`}>
                {letraIni[0]}{letraFim[0]}
            </div>
        )
    }

    return (
        <img src={url} alt={nome} onError={() => setErro(true)} className={finalClass}/>
    )
}

export default AlunoAvatar