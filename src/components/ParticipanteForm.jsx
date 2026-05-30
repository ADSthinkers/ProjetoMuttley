import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatCpf } from "../utils/formatters";

const ParticipanteForm = ({ setObjeto, setEtapa, objeto }) => {
    const [nome, setNome] = useState(objeto?.nome || "");
    const [email, setEmail] = useState(objeto?.email || "");
    const [email2, setEmail2] = useState(objeto?.email2 || "");
    const [cpf, setCpf] = useState(formatCpf(objeto?.cpf || ""));
    const [ra, setRa] = useState(objeto?.ra || "");
    const [telefone, setTelefone] = useState(objeto?.telefone || "");
    const [curso, setCurso] = useState(objeto?.curso || "");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            ...objeto,
            nome,
            ra,
            cpf,
            email,
            email2,
            telefone,
            curso
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
                    {/* RA */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">RA (Registro Acadêmico) <span className="font-secondary font-normal text-primary/40">(opcional)</span></label>
                        <input 
                            type="text" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="Ex: 1234567890123" 
                            value={ra} 
                            onChange={(e) => setRa(e.target.value)} 
                        />
                    </div>

                    {/* CPF */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">CPF</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="000.000.000-00" 
                            value={cpf} 
                            onChange={(e) => setCpf(formatCpf(e.target.value))}
                            maxLength={14}
                            inputMode="numeric"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* E-mail principal */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">E-mail principal</label>
                        <input 
                            required
                            type="email" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="participante@email.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    {/* E-mail secundário */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">E-mail secundário <span className="font-secondary font-normal text-primary/40">(opcional)</span></label>
                        <input 
                            type="email" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="exemplo@gmail.com" 
                            value={email2} 
                            onChange={(e) => setEmail2(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">Telefone <span className="font-secondary font-normal text-primary/40">(opcional)</span></label>
                        <input
                            type="text"
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm"
                            placeholder="(11) 99999-9999"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">Curso <span className="font-secondary font-normal text-primary/40">(opcional)</span></label>
                        <input
                            type="text"
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm"
                            placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                            value={curso}
                            onChange={(e) => setCurso(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 text-lg bg-accent text-primary font-primary font-bold py-5 rounded-2xl cursor-pointer shadow-lg shadow-accent/20 hover:bg-accent/80 transition-all mt-4"
            >
                <span>Revisar Cadastro</span>
                <ArrowRightIcon size={20} weight="bold" />
            </motion.button>
        </form>
    );
};

export default ParticipanteForm;
