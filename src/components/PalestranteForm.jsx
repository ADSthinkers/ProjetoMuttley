import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatCpf } from "../utils/formatters";

const PalestranteForm = ({ setObjeto, setEtapa, objeto }) => {
    const [nome, setNome] = useState(objeto?.nome || "");
    const [cpf, setCpf] = useState(formatCpf(objeto?.cpf || ""));
    const [email, setEmail] = useState(objeto?.email || "");
    const [miniCurriculo, setMiniCurriculo] = useState(objeto?.miniCurriculo || "");
    const [formacao, setFormacao] = useState(objeto?.formacao || "");
    const [areaAtuacao, setAreaAtuacao] = useState(objeto?.areaAtuacao || "");
    const [instituicao, setInstituicao] = useState(objeto?.instituicao || "");
    const [linkedin, setLinkedin] = useState(objeto?.linkedin || "");
    const [foto, setFoto] = useState(objeto?.foto || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            ...objeto,
            nome: nome,
            cpf: cpf,
            email: email,
            miniCurriculo: miniCurriculo,
            formacao: formacao,
            areaAtuacao: areaAtuacao,
            instituicao: instituicao,
            linkedin: linkedin,
            foto: foto
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
                        placeholder="Nome do palestrante" 
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
                            onChange={(e) => setCpf(formatCpf(e.target.value))}
                            maxLength={14}
                            inputMode="numeric"
                        />
                    </div>

                    {/* E-mail */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-primary font-bold text-primary ml-1">E-mail Profissional</label>
                        <input 
                            required 
                            type="email" 
                            className="w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm" 
                            placeholder="email@exemplo.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Área de Atuação">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Ex: Inteligência Artificial"
                            value={areaAtuacao}
                            onChange={(e) => setAreaAtuacao(e.target.value)}
                        />
                    </Field>

                    <Field label="Instituição">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Ex: Fatec Zona Leste"
                            value={instituicao}
                            onChange={(e) => setInstituicao(e.target.value)}
                        />
                    </Field>
                </div>

                <Field label="Formação">
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Ex: Doutorado em Computação"
                        value={formacao}
                        onChange={(e) => setFormacao(e.target.value)}
                    />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="LinkedIn">
                        <input
                            type="url"
                            className={inputClass}
                            placeholder="https://linkedin.com/in/nome"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                        />
                    </Field>

                    <Field label="Foto">
                        <input
                            type="url"
                            className={inputClass}
                            placeholder="https://site.com/foto.jpg"
                            value={foto}
                            onChange={(e) => setFoto(e.target.value)}
                        />
                    </Field>
                </div>

                <Field label="Mini currículo">
                    <textarea
                        className={`${inputClass} min-h-28 resize-y`}
                        placeholder="Resumo profissional do palestrante"
                        value={miniCurriculo}
                        onChange={(e) => setMiniCurriculo(e.target.value)}
                    />
                </Field>

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

const inputClass = "w-full text-base p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm";

const Field = ({ label, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-primary font-bold text-primary ml-1">{label}</label>
        {children}
    </div>
);

export default PalestranteForm;
