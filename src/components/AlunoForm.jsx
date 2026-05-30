import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const AlunoForm = ({ setObjeto, setEtapa, objeto }) => {
    const [nome, setNome] = useState(objeto?.nomeAluno || "");
    const [email, setEmail] = useState(objeto?.emailPessoalAluno || "");
    const [emailFatec, setEmailFatec] = useState(objeto?.emailFatecAluno || "");
    const [cpf, setCpf] = useState(objeto?.cpfAluno || "");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            ...objeto,
            nomeAluno: nome,
            emailPessoalAluno: email,
            emailFatecAluno: emailFatec,
            cpfAluno: cpf 
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
                {/* Nome */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-primary font-bold text-primary ml-1">Nome Completo</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                        placeholder="Ex: João Silva" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CPF */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">CPF</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="000.000.000-00" 
                            value={cpf} 
                            onChange={(e) => setCpf(e.target.value)} 
                        />
                    </div>

                    {/* Email Fatec */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">Email Fatec</label>
                        <input 
                            required
                            type="email" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="aluno@fatec.sp.gov.br" 
                            value={emailFatec} 
                            onChange={(e) => setEmailFatec(e.target.value)} 
                        />
                    </div>
                </div>

                {/* Email Pessoal */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-primary font-bold text-primary ml-1">Email Pessoal</label>
                    <input 
                        required 
                        type="email" 
                        className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                        placeholder="exemplo@gmail.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
            </div>

            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 text-lg bg-primary text-secondary font-primary font-bold py-5 rounded-2xl cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4"
            >
                <span>Finalizar Cadastro</span>
                <ArrowRightIcon size={20} weight="bold" />
            </motion.button>
        </form>
    );
};

export default AlunoForm;