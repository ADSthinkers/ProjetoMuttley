import { useState } from "react";
import {
    ArrowRightIcon,
    BuildingsIcon,
    IdentificationCardIcon,
    LinkIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon
} from "@phosphor-icons/react";
import { formatCep, formatCnpj, formatCpf, formatInscricaoEstadual, formatPhone } from "../utils/formatters";

const PatrocinadorForm = ({ setObjeto, setEtapa, objeto = {} }) => {
    const [tipo, setTipo] = useState(objeto.tipo || "PJ"); // PJ ou PF
    
    // PJ fields
    const [razaoSocial, setRazaoSocial] = useState(objeto.razaoSocial || "");
    const [nomeFantasia, setNomeFantasia] = useState(objeto.nomeFantasia || "");
    const [cnpj, setCnpj] = useState(formatCnpj(objeto.cnpj || ""));
    const [inscricaoEstadual, setInscricaoEstadual] = useState(formatInscricaoEstadual(objeto.inscricaoEstadual || ""));

    // PF fields
    const [nomeCompleto, setNomeCompleto] = useState(objeto.nomeCompleto || "");
    const [cpf, setCpf] = useState(formatCpf(objeto.cpf || ""));

    // Common fields
    const [telefone, setTelefone] = useState(formatPhone(objeto.telefone || ""));
    const [email, setEmail] = useState(objeto.email || "");
    const [nomeResponsavel, setNomeResponsavel] = useState(objeto.nomeResponsavel || "");
    const [logradouro, setLogradouro] = useState(objeto.logradouro || "");
    const [numero, setNumero] = useState(objeto.numero || "");
    const [complemento, setComplemento] = useState(objeto.complemento || "");
    const [bairro, setBairro] = useState(objeto.bairro || "");
    const [cep, setCep] = useState(formatCep(objeto.cep || ""));
    const [cidade, setCidade] = useState(objeto.cidade || "");
    const [uf, setUf] = useState(objeto.uf || "");
    const [linkedin, setLinkedin] = useState(objeto.linkedin || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const dados = {
            tipo,
            telefone,
            email,
            nomeResponsavel,
            logradouro,
            numero,
            complemento,
            bairro,
            cep,
            cidade,
            uf,
            linkedin
        };

        if (tipo === "PJ") {
            Object.assign(dados, { razaoSocial, nomeFantasia, cnpj, inscricaoEstadual });
        } else {
            Object.assign(dados, { nomeCompleto, cpf });
        }

        setObjeto(dados);
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-7 -mt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-7">
                {/* Seletor de Tipo */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-secondary text-primary font-semibold">Tipo de Patrocinador*</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-accent/20 rounded-2xl p-2">
                        <TipoOption
                            active={tipo === "PJ"}
                            icon={<BuildingsIcon size={24} />}
                            title="Pessoa Jurídica"
                            description="Empresa, instituição ou organização."
                            onClick={() => setTipo("PJ")}
                        />
                        <TipoOption
                            active={tipo === "PF"}
                            icon={<IdentificationCardIcon size={24} />}
                            title="Pessoa Física"
                            description="Patrocinador individual."
                            onClick={() => setTipo("PF")}
                        />
                    </div>
                </div>

                <SectionTitle icon={<UserIcon size={18} />} title={tipo === "PJ" ? "Dados da empresa" : "Dados pessoais"} />

                {tipo === "PJ" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Razão Social*">
                            <input required type="text" className={inputClass} placeholder="Nome jurídico da empresa" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
                        </Field>
                        <Field label="Nome Fantasia" optional>
                            <input type="text" className={inputClass} placeholder="Nome comercial" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
                        </Field>
                        <Field label="CNPJ*">
                            <input required type="text" inputMode="numeric" maxLength={18} className={inputClass} placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} />
                        </Field>
                        <Field label="Inscrição Estadual" optional>
                            <input type="text" inputMode="numeric" maxLength={15} className={inputClass} placeholder="000.000.000.000" value={inscricaoEstadual} onChange={(e) => setInscricaoEstadual(formatInscricaoEstadual(e.target.value))} />
                        </Field>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nome Completo*">
                            <input required type="text" className={inputClass} placeholder="Nome do patrocinador" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                        </Field>
                        <Field label="CPF*">
                            <input required type="text" inputMode="numeric" maxLength={14} className={inputClass} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} />
                        </Field>
                    </div>
                )}

                <SectionTitle icon={<PhoneIcon size={18} />} title="Contato" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Telefone*">
                        <input required type="text" inputMode="numeric" maxLength={15} className={inputClass} placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} />
                    </Field>
                    <Field label="E-mail*">
                        <input required type="email" className={inputClass} placeholder="contato@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field label="Nome do Responsável*" className="md:col-span-2">
                        <input required type="text" className={inputClass} placeholder="Pessoa responsável pelo contato" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
                    </Field>
                </div>

                <SectionTitle icon={<MapPinIcon size={18} />} title="Endereço" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Logradouro*" className="md:col-span-2">
                        <input required type="text" className={inputClass} placeholder="Rua, avenida ou praça" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                    </Field>
                    <Field label="Número*">
                        <input required type="text" className={inputClass} placeholder="Nº" value={numero} onChange={(e) => setNumero(e.target.value)} />
                    </Field>
                    <Field label="CEP*">
                        <input required type="text" inputMode="numeric" maxLength={9} className={inputClass} placeholder="00000-000" value={cep} onChange={(e) => setCep(formatCep(e.target.value))} />
                    </Field>
                    <Field label="Bairro*">
                        <input required type="text" className={inputClass} placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                    </Field>
                    <Field label="Cidade*">
                        <input required type="text" className={inputClass} placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    </Field>
                    <Field label="UF*">
                        <input required type="text" maxLength={2} className={inputClass} placeholder="SP" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
                    </Field>
                </div>

                <SectionTitle icon={<LinkIcon size={18} />} title="Social" />
                <Field label="LinkedIn" optional>
                    <input type="text" className={inputClass} placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </Field>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer mt-2 shadow-lg shadow-accent/10">
                Revisar
                <ArrowRightIcon size={18} weight="bold" />
            </button>
        </form>
    );
};

const inputClass = "w-full text-sm p-4 bg-white/50 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm placeholder:text-primary/30";

const TipoOption = ({ active, icon, title, description, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all cursor-pointer border-2 ${active ? "bg-accent border-accent text-primary shadow-md" : "bg-base-100/40 border-transparent text-primary/70 hover:bg-accent/20"}`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-base-100/50" : "bg-accent/30"}`}>
            {icon}
        </div>
        <span className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-primary font-bold text-primary">{title}</span>
            <span className="text-xs font-secondary text-primary/55">{description}</span>
        </span>
    </button>
);

const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center gap-2 text-primary">
        <div className="w-8 h-8 rounded-lg bg-accent/30 flex items-center justify-center">
            {icon}
        </div>
        <span className="text-sm font-secondary font-bold uppercase tracking-wide">{title}</span>
    </div>
);

const Field = ({ label, optional, className = "", children }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <label className="text-sm font-secondary text-primary font-semibold">
            {label} {optional && <span className="font-normal text-primary/40">(opcional)</span>}
        </label>
        {children}
    </div>
);

export default PatrocinadorForm;
