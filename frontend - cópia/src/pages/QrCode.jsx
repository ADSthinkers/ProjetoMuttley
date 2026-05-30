import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CertificateIcon,
    CheckCircleIcon,
    CircleNotchIcon,
    IdentificationCardIcon,
    MedalIcon,
    WarningCircleIcon
} from "@phosphor-icons/react";
import MuttleyLogo from "../assets/muttley_logo.svg";
import { formatCpf } from "../utils/formatters";

const QrCode = () => {
    const { token: tokenParam } = useParams();
    const [searchParams] = useSearchParams();
    const token = tokenParam || searchParams.get("token") || "";

    const dbURL = import.meta.env.VITE_DB_API_URL;
    const publicBaseURL = (dbURL || "").replace(/\/api\/?$/, "");
    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    }), [dbURL]);

    const [step, setStep] = useState("identificacao");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [palestra, setPalestra] = useState(null);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [sucesso, setSucesso] = useState(null);
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");

    useEffect(() => {
        const fetchPalestra = async () => {
            if (!token || !dbURL) {
                setErro("QR Code inválido ou incompleto.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/qrcode/${token}`);
                setPalestra(response.data);
            } catch (error) {
                setErro(error.response?.data?.erro || "Este QR Code não é válido ou a palestra não foi encontrada.");
            } finally {
                setLoading(false);
            }
        };

        fetchPalestra();
    }, [api, dbURL, token]);

    const handleIdentificacao = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setAviso("");
        setErro("");

        try {
            const response = await api.post(`/qrcode/${token}/identificar`, { cpf, email });
            const data = response.data;

            if (data.status === "CADASTRO_NECESSARIO") {
                setCpf(formatCpf(data.cpf || cpf));
                setEmail(data.email || email);
                setStep("cadastro");
                return;
            }

            if (data.status === "JA_REGISTRADO") {
                setAviso(data.mensagem);
                return;
            }

            setSucesso(data);
            setStep("sucesso");
        } catch (error) {
            setErro(error.response?.data?.erro || "Não foi possível registrar sua presença.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErro("");

        try {
            const response = await api.post(`/qrcode/${token}/cadastro`, { nome, cpf, email });
            setSucesso(response.data);
            setStep("sucesso");
        } catch (error) {
            setErro(error.response?.data?.erro || "Não foi possível concluir seu cadastro.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-8 font-secondary">
            <div className="w-full max-w-md">
                {loading ? (
                    <QrShell>
                        <div className="flex flex-col items-center gap-5 py-12">
                            <CircleNotchIcon size={36} className="animate-spin text-primary/60" />
                            <p className="text-sm text-primary/50">Carregando registro de presença...</p>
                        </div>
                    </QrShell>
                ) : erro && !palestra ? (
                    <QrShell>
                        <StateIcon tone="error" icon={<WarningCircleIcon size={44} weight="fill" />} />
                        <h1 className="text-2xl font-primary font-bold text-primary text-center">Link inválido</h1>
                        <p className="text-sm text-primary/60 text-center">{erro}</p>
                    </QrShell>
                ) : step === "sucesso" ? (
                    <QrShell>
                        <StateIcon tone="success" icon={<CheckCircleIcon size={52} weight="fill" />} />
                        <div className="text-center">
                            <h1 className="text-3xl font-primary font-bold text-primary">Presença confirmada</h1>
                            <p className="text-sm text-primary/60 mt-2">
                                Olá, <span className="font-bold text-primary">{sucesso?.nomeParticipante}</span>. Sua presença foi registrada.
                            </p>
                        </div>

                        <div className="bg-right/10 border border-right/15 rounded-2xl p-4 flex items-center gap-3 text-primary">
                            <MedalIcon size={24} weight="fill" className="text-right shrink-0" />
                            <span className="text-sm">Medalha de participação e certificado emitidos automaticamente.</span>
                        </div>

                        {sucesso?.codigoCertificado && (
                            <div className="bg-accent/20 border border-accent/20 rounded-2xl p-5 flex flex-col gap-4">
                                <div>
                                    <p className="text-[10px] uppercase text-primary/40 font-bold">Código do certificado</p>
                                    <p className="text-xs font-mono text-primary break-all mt-1">{sucesso.codigoCertificado}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <a href={`${publicBaseURL}/certificado/${sucesso.certificadoId}/pdf`} className="btn btn-sm border-0 rounded-xl bg-accent text-primary font-secondary">
                                        Baixar PDF
                                    </a>
                                    <a href={`${publicBaseURL}/certificado/validar/${sucesso.codigoCertificado}`} className="btn btn-sm border-0 rounded-xl bg-base-100 text-primary font-secondary">
                                        Validar
                                    </a>
                                </div>
                            </div>
                        )}
                    </QrShell>
                ) : step === "cadastro" ? (
                    <QrShell palestra={palestra} badge="Primeiro acesso">
                        <div className="text-center">
                            <h1 className="text-2xl font-primary font-bold text-primary">Complete seu cadastro</h1>
                            <p className="text-sm text-primary/60 mt-1">Informe seu nome para confirmar presença.</p>
                        </div>

                        {erro && <Alert tone="error">{erro}</Alert>}

                        <form className="flex flex-col gap-4" onSubmit={handleCadastro}>
                            <Field label="Nome completo*">
                                <input required type="text" className={inputClass} placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
                            </Field>
                            <Field label="CPF*">
                                <input required type="text" className={inputClass} placeholder="000.000.000-00" value={cpf} maxLength={14} inputMode="numeric" onChange={(e) => setCpf(formatCpf(e.target.value))} />
                            </Field>
                            <Field label="E-mail*">
                                <input required type="email" className={inputClass} placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Field>
                            <button disabled={submitting} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary min-h-13">
                                {submitting ? <CircleNotchIcon size={22} className="animate-spin" /> : "Cadastrar e confirmar presença"}
                            </button>
                        </form>

                        <button type="button" onClick={() => setStep("identificacao")} className="btn btn-sm border-0 rounded-xl bg-accent/20 text-primary font-secondary">
                            <ArrowLeftIcon size={16} />
                            Voltar
                        </button>
                    </QrShell>
                ) : (
                    <QrShell palestra={palestra} badge="Registro de presença">
                        <div className="text-center">
                            <h1 className="text-2xl font-primary font-bold text-primary">{palestra?.titulo}</h1>
                            {palestra?.descricao && <p className="text-sm text-primary/60 mt-2">{palestra.descricao}</p>}
                        </div>

                        {aviso && <Alert tone="warning">{aviso}</Alert>}
                        {erro && <Alert tone="error">{erro}</Alert>}

                        <form className="flex flex-col gap-4" onSubmit={handleIdentificacao}>
                            <Field label="CPF*">
                                <input required type="text" className={inputClass} placeholder="000.000.000-00" value={cpf} maxLength={14} inputMode="numeric" onChange={(e) => setCpf(formatCpf(e.target.value))} />
                            </Field>
                            <Field label="E-mail*">
                                <input required type="email" className={inputClass} placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Field>
                            <button disabled={submitting} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary min-h-13">
                                {submitting ? <CircleNotchIcon size={22} className="animate-spin" /> : (
                                    <>
                                        Confirmar presença
                                        <ArrowRightIcon size={18} weight="bold" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-xs text-primary/45 text-center">
                            Primeira vez? Informe CPF e e-mail para abrir o cadastro automaticamente.
                        </p>
                    </QrShell>
                )}
            </div>
        </main>
    );
};

const QrShell = ({ children, palestra, badge }) => (
    <section className="bg-accent/10 border border-accent/20 rounded-3xl shadow-xl shadow-primary/5 p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
            <img src={MuttleyLogo} alt="Muttley" className="h-9 w-auto" />
            {badge && <span className="badge badge-accent badge-outline font-secondary text-[11px] px-3 py-3">{badge}</span>}
        </div>
        {palestra && (
            <div className="bg-base-100/60 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/40 flex items-center justify-center text-primary shrink-0">
                    <CertificateIcon size={24} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-primary/40 uppercase font-bold">Palestra</p>
                    <p className="text-sm font-primary font-bold text-primary truncate">{palestra.titulo}</p>
                </div>
            </div>
        )}
        {children}
    </section>
);

const Field = ({ label, children }) => (
    <label className="flex flex-col gap-2">
        <span className="text-sm font-secondary text-primary font-semibold">{label}</span>
        {children}
    </label>
);

const Alert = ({ tone, children }) => (
    <div className={`rounded-2xl p-4 text-sm font-secondary border ${tone === "warning" ? "bg-warning/15 border-warning/20 text-primary" : "bg-error/10 border-error/20 text-error"}`}>
        {children}
    </div>
);

const StateIcon = ({ icon, tone }) => (
    <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center ${tone === "success" ? "bg-right/15 text-right" : "bg-error/10 text-error"}`}>
        {icon}
    </div>
);

const inputClass = "w-full text-base p-4 bg-white/60 border-2 border-transparent focus:border-accent focus:bg-white rounded-2xl font-secondary text-primary transition-all outline-none shadow-sm placeholder:text-primary/30";

export default QrCode;
