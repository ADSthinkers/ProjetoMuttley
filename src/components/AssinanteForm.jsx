import { useState } from "react";
import { ArrowRightIcon, ImageSquareIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatCpf } from "../utils/formatters";

const getBase64FromFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const result = String(reader.result || "");
        resolve({
            base64: result.split(",")[1] || "",
            preview: result,
        });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const AssinanteForm = ({ setObjeto, setEtapa, objeto }) => {
    const [nome, setNome] = useState(objeto?.nome || "");
    const [cpf, setCpf] = useState(formatCpf(objeto?.cpf || ""));
    const [email, setEmail] = useState(objeto?.email || "");
    const [cargo, setCargo] = useState(objeto?.cargo || "");
    const [assinatura, setAssinatura] = useState(objeto?.assinatura || "");
    const [assinaturaPreview, setAssinaturaPreview] = useState(objeto?.assinaturaPreview || "");
    const [assinaturaNome, setAssinaturaNome] = useState(objeto?.assinaturaNome || "");

    const handleAssinaturaChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const imagem = await getBase64FromFile(file);
        setAssinatura(imagem.base64);
        setAssinaturaPreview(imagem.preview);
        setAssinaturaNome(file.name);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setObjeto({
            ...objeto,
            nome,
            cpf,
            email,
            cargo,
            assinatura,
            assinaturaPreview,
            assinaturaNome,
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
                <Field label="Nome Completo">
                    <input required type="text" className={inputClass} placeholder="Nome do assinante" value={nome} onChange={(e) => setNome(e.target.value)} />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="CPF">
                        <input required type="text" className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} maxLength={14} inputMode="numeric" />
                    </Field>

                    <Field label="E-mail">
                        <input required type="email" className={inputClass} placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                </div>

                <Field label="Cargo">
                    <input required type="text" className={inputClass} placeholder="Ex: Coordenador de Curso" value={cargo} onChange={(e) => setCargo(e.target.value)} />
                </Field>

                <Field label="Imagem da assinatura">
                    <label className="flex flex-col items-center justify-center gap-3 min-h-44 rounded-2xl border-2 border-dashed border-accent/35 bg-base-100/45 hover:bg-accent/15 cursor-pointer transition-colors p-5">
                        {assinaturaPreview ? (
                            <img src={assinaturaPreview} alt="Prévia da assinatura" className="max-h-28 max-w-full object-contain rounded-xl bg-white p-3" />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-accent/25 flex items-center justify-center text-primary">
                                <ImageSquareIcon size={28} />
                            </div>
                        )}
                        <span className="text-sm font-secondary text-primary/65 text-center">
                            {assinaturaNome || "Selecione uma imagem PNG ou JPG da assinatura"}
                        </span>
                        <input required={!assinatura} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAssinaturaChange} />
                    </label>
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

export default AssinanteForm;
