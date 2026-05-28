import { useState } from "react";

const AlunoForm = ({ setObjeto, setEtapa }) => {
    
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [emailFatec, setEmailFatec] = useState("");
    const [cpf, setCpf] = useState("");
    
    return (
        <form className="flex flex-col gap-5 -mt-5 min-h-[68vh]" onSubmit={(event) => {setObjeto({
                nomeAluno: nome,
                emailPessoalAluno: email,
                emailFatecAluno: emailFatec,
                cpfAluno: cpf 
            }); event.preventDefault(); setEtapa(4)}}>

            <div className="flex flex-col gap-5 flex-1">
                {/* Nome */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary">Nome Completo</label>
                    <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" placeholder="Nome completo" value={nome} onChange={(e) => {setNome(e.target.value);}} required/>
                </div>

                {/* Email Pessoal */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary">Email Pessoal</label>
                    <input required type="email" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" placeholder="Email pessoal" value={email} onChange={(e) => {setEmail(e.target.value);}} required/>
                </div>

                {/* Email Fatec */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary">Email Fatec</label>
                    <input type="email" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" placeholder="email@fatec" value={emailFatec} onChange={(e) => {setEmailFatec(e.target.value);}} required/>
                </div>

                {/* CPF */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary">CPF</label>
                    <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" placeholder="xxx.xxx.xxx-xx" value={cpf} onChange={(e) => {setCpf(e.target.value);}} required/>
                </div>
            </div>

            <button className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer`}>Próximo</button>
            
        </form>
    )
}

export default AlunoForm