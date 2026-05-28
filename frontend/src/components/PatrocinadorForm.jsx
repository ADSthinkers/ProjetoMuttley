import { useState } from "react";

const PatrocinadorForm = ({ setObjeto, setEtapa }) => {
    const [tipo, setTipo] = useState("PJ"); // PJ ou PF
    
    // PJ fields
    const [razaoSocial, setRazaoSocial] = useState("");
    const [nomeFantasia, setNomeFantasia] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [inscricaoEstadual, setInscricaoEstadual] = useState("");

    // PF fields
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [cpf, setCpf] = useState("");

    // Common fields
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [nomeResponsavel, setNomeResponsavel] = useState("");
    const [logradouro, setLogradouro] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cep, setCep] = useState("");
    const [cidade, setCidade] = useState("");
    const [uf, setUf] = useState("");
    const [linkedin, setLinkedin] = useState("");

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
        <form className="flex flex-col gap-6 -mt-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
                {/* Seletor de Tipo */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Tipo de Patrocinador*</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tipo" value="PJ" checked={tipo === "PJ"} onChange={() => setTipo("PJ")} className="radio radio-accent" />
                            <span className="text-sm font-secondary text-primary">Pessoa Jurídica</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tipo" value="PF" checked={tipo === "PF"} onChange={() => setTipo("PF")} className="radio radio-accent" />
                            <span className="text-sm font-secondary text-primary">Pessoa Física</span>
                        </label>
                    </div>
                </div>

                <div className="divider divider-primary opacity-30"></div>

                {tipo === "PJ" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">Razão Social*</label>
                            <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">Nome Fantasia</label>
                            <input type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">CNPJ*</label>
                            <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">Inscrição Estadual</label>
                            <input type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={inscricaoEstadual} onChange={(e) => setInscricaoEstadual(e.target.value)} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">Nome Completo*</label>
                            <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">CPF*</label>
                            <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="divider divider-primary opacity-30">Contato</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Telefone*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">E-mail*</label>
                        <input required type="email" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Nome do Responsável*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} />
                    </div>
                </div>

                <div className="divider divider-primary opacity-30">Endereço</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Logradouro*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Número*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={numero} onChange={(e) => setNumero(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">CEP*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={cep} onChange={(e) => setCep(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Bairro*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">Cidade*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary font-semibold">UF*</label>
                        <input required type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={uf} onChange={(e) => setUf(e.target.value)} />
                    </div>
                </div>

                <div className="divider divider-primary opacity-30">Social</div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">LinkedIn</label>
                    <input type="text" className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer mt-4">
                Finalizar
            </button>
        </form>
    );
};

export default PatrocinadorForm;
