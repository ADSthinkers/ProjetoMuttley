import { useState } from "react";
import { sha256 } from "js-sha256";

const Avatar = ({ email, nome, className }) => {
    const [erro, setErro] = useState(false)
    const safeEmail = email || "";
    const safeNome = nome || "";

    const hash = sha256.create();
    hash.update(safeEmail.trim().toLowerCase());

    const url = `https://www.gravatar.com/avatar/${hash}?d=404`;
    //console.log(hash.hex());
    
    const nomeFatia = safeNome.trim().split(" ").filter(Boolean);
    const primeiroNome = nomeFatia[0] || "?";
    const ultimoNome = nomeFatia[nomeFatia.length - 1] || primeiroNome;
    const letraIni = primeiroNome.split("")
    const letraFim = ultimoNome.split("")

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
        <img src={url} alt={safeNome} onError={() => setErro(true)} className={finalClass}/>
    )
}

export default Avatar
