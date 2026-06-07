import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CertificateIcon,
    CheckCircleIcon,
    CircleNotchIcon,
    WarningCircleIcon
} from "@phosphor-icons/react";
import MuttleyLogo from "../assets/muttley_logo.svg";
import { formatCpf, isValidCpf } from "../utils/formatters";

const QrCode = ({ tipo = "inscricao" }) => {
    const { token: tokenParam } = useParams();
    const [searchParams] = useSearchParams();
    const token = tokenParam || searchParams.get("token") || "";
    const isScannerMode = !token;
    const isCheckin = tipo === "checkin";

    const dbURL = import.meta.env.VITE_DB_API_URL;
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
    const [sucesso, setSucesso] = useState(null);
    const [participante, setParticipante] = useState(null);
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [nome, setNome] = useState("");
    const [scannerError, setScannerError] = useState("");
    const [scannerInfo, setScannerInfo] = useState("");
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const endpointBase = isCheckin ? `/qrcode/checkin/${token}` : `/qrcode/${token}`;
    const flowLabel = isCheckin ? "Check-in" : "Inscrição";

    useEffect(() => {
        const fetchPalestra = async () => {
            if (isScannerMode) {
                setLoading(false);
                return;
            }

            if (!token || !dbURL) {
                setErro("QR Code inválido ou incompleto.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(endpointBase);
                setPalestra(response.data);
            } catch (error) {
                setErro(error.response?.data?.erro || "Este QR Code não é válido ou a palestra não foi encontrada.");
            } finally {
                setLoading(false);
            }
        };

        fetchPalestra();
    }, [api, dbURL, endpointBase, isScannerMode, token]);

    useEffect(() => {
        if (!isScannerMode || loading) return;

        let intervalId;
        let stopped = false;

        const redirectIfValid = (value) => {
            if (!value) return;

            if (!value.startsWith(window.location.origin)) {
                setScannerError("QR Code inválido. Ele não pertence a este site.");
                return;
            }

            window.location.href = value;
        };

        const startScanner = async () => {
            setScannerError("");
            setScannerInfo("");

            if (!window.isSecureContext) {
                setScannerError("A câmera só pode ser usada em HTTPS ou localhost.");
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                setScannerError("Seu navegador não permite acesso à câmera nesta página.");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });

                if (stopped) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true");
                    videoRef.current.muted = true;
                    await videoRef.current.play();
                }

                if (!("BarcodeDetector" in window)) {
                    setScannerInfo("Câmera iniciada. Este navegador não oferece leitura automática de QR Code; use Chrome/Edge ou abra o link do QR diretamente.");
                    return;
                }

                const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
                intervalId = window.setInterval(async () => {
                    if (!videoRef.current || videoRef.current.readyState < 2) return;

                    try {
                        const codes = await detector.detect(videoRef.current);
                        const value = codes[0]?.rawValue;
                        if (!value) return;
                        redirectIfValid(value);
                    } catch (error) {
                        console.error("Erro ao ler QR Code:", error);
                    }
                }, 700);
            } catch (error) {
                console.error("Erro ao acessar câmera:", error);
                setScannerError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
            }
        };

        startScanner();

        return () => {
            stopped = true;
            if (intervalId) window.clearInterval(intervalId);
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [isScannerMode, loading]);

    const validarCpfAtual = () => {
        if (!isValidCpf(cpf)) {
            setErro("Informe um CPF válido.");
            return false;
        }
        return true;
    };

    const handleIdentificacao = async (e) => {
        e.preventDefault();
        setErro("");
        setParticipante(null);
        if (!validarCpfAtual()) return;

        setSubmitting(true);
        try {
            const response = await api.post(`${endpointBase}/identificar`, { cpf });
            const data = response.data;

            if (data.status === "CADASTRO_NECESSARIO") {
                if (isCheckin) {
                    setErro("Participante não encontrado. Faça a inscrição antes do check-in.");
                    return;
                }
                setCpf(formatCpf(data.cpf || cpf));
                setStep("cadastro");
                return;
            }

            if (data.status === "PARTICIPANTE_ENCONTRADO") {
                setParticipante(data);
                setStep("confirmacao");
                return;
            }

            setSucesso(data);
            setStep("sucesso");
        } catch (error) {
            setErro(error.response?.data?.erro || `Não foi possível concluir a identificação de ${flowLabel.toLowerCase()}.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmacao = async () => {
        setErro("");
        if (!validarCpfAtual()) return;

        setSubmitting(true);
        try {
            const response = await api.post(`${endpointBase}/confirmar`, { cpf });
            setSucesso(response.data);
            setStep("sucesso");
        } catch (error) {
            setErro(error.response?.data?.erro || `Não foi possível confirmar ${flowLabel.toLowerCase()}.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setErro("");
        if (!validarCpfAtual()) return;

        setSubmitting(true);
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

    const resetCpf = () => {
        setParticipante(null);
        setErro("");
        setCpf("");
        setStep("identificacao");
    };

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center px-4 py-8 font-secondary">
            <div className="w-full max-w-md">
                {loading ? (
                    <QrShell>
                        <div className="flex flex-col items-center gap-5 py-12">
                            <CircleNotchIcon size={36} className="animate-spin text-primary/60" />
                            <p className="text-sm text-primary/50">Carregando {flowLabel.toLowerCase()}...</p>
                        </div>
                    </QrShell>
                ) : isScannerMode ? (
                    <QrShell badge="Leitor de QR Code">
                        <div className="text-center">
                            <h1 className="text-3xl font-primary font-bold text-primary">Escanear QR Code</h1>
                            <p className="text-sm text-primary/60 mt-2">
                                Aponte a câmera para um QR Code gerado pelo Muttley.
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl bg-primary/10 border border-accent/20 aspect-square">
                            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                            <div className="absolute inset-8 border-2 border-accent rounded-2xl pointer-events-none" />
                            <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/60 pointer-events-none" />
                        </div>

                        {scannerError ? (
                            <Alert tone="error">{scannerError}</Alert>
                        ) : scannerInfo ? (
                            <div className="bg-accent/20 border border-accent/20 rounded-2xl p-4 text-sm text-primary/60">
                                {scannerInfo}
                            </div>
                        ) : (
                            <div className="bg-accent/20 border border-accent/20 rounded-2xl p-4 text-sm text-primary/60">
                                O QR Code só será aceito se o link começar com <span className="font-bold text-primary">{window.location.origin}</span>.
                            </div>
                        )}
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
                            <h1 className="text-3xl font-primary font-bold text-primary">{isCheckin ? "Check-in confirmado" : "Inscrição registrada"}</h1>
                            <p className="text-sm text-primary/60 mt-2">
                                Olá, <span className="font-bold text-primary">{sucesso?.nomeParticipante}</span>.
                            </p>
                        </div>

                        <div className="bg-right/10 border border-right/15 rounded-2xl p-4 flex items-center gap-3 text-primary">
                            <CheckCircleIcon size={24} weight="fill" className="text-right shrink-0" />
                            <span className="text-sm">
                                {sucesso?.mensagem || (isCheckin ? "Sua presença foi confirmada." : "Sua inscrição foi registrada.")}
                            </span>
                        </div>
                    </QrShell>
                ) : step === "cadastro" ? (
                    <QrShell palestra={palestra} badge="Primeiro acesso">
                        <div className="text-center">
                            <h1 className="text-2xl font-primary font-bold text-primary">Complete seu cadastro</h1>
                            <p className="text-sm text-primary/60 mt-1">Informe seus dados para concluir a inscrição.</p>
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
                                {submitting ? <CircleNotchIcon size={22} className="animate-spin" /> : "Cadastrar e inscrever"}
                            </button>
                        </form>

                        <button type="button" onClick={() => setStep("identificacao")} className="btn btn-sm border-0 rounded-xl bg-accent/20 text-primary font-secondary">
                            <ArrowLeftIcon size={16} />
                            Voltar
                        </button>
                    </QrShell>
                ) : step === "confirmacao" ? (
                    <QrShell palestra={palestra} badge={flowLabel}>
                        <div className="text-center">
                            <h1 className="text-2xl font-primary font-bold text-primary">Este cadastro é seu?</h1>
                            <p className="text-sm text-primary/60 mt-2">
                                Encontramos <span className="font-bold text-primary">{participante?.nomeParticipante}</span> para o CPF informado.
                            </p>
                        </div>

                        {erro && <Alert tone="error">{erro}</Alert>}

                        <div className="grid grid-cols-1 gap-3">
                            <button type="button" disabled={submitting} onClick={handleConfirmacao} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary min-h-13">
                                {submitting ? <CircleNotchIcon size={22} className="animate-spin" /> : (
                                    <>
                                        Sim, sou eu
                                        <ArrowRightIcon size={18} weight="bold" />
                                    </>
                                )}
                            </button>
                            <button type="button" onClick={resetCpf} className="btn border-0 rounded-xl bg-accent/20 text-primary font-secondary min-h-13">
                                Digitar outro CPF
                            </button>
                        </div>
                    </QrShell>
                ) : (
                    <QrShell palestra={palestra} badge={flowLabel}>
                        <div className="text-center">
                            <h1 className="text-2xl font-primary font-bold text-primary">{palestra?.titulo}</h1>
                            {palestra?.descricao && <p className="text-sm text-primary/60 mt-2">{palestra.descricao}</p>}
                        </div>

                        {erro && <Alert tone="error">{erro}</Alert>}

                        <form className="flex flex-col gap-4" onSubmit={handleIdentificacao}>
                            <Field label="CPF*">
                                <input required type="text" className={inputClass} placeholder="000.000.000-00" value={cpf} maxLength={14} inputMode="numeric" onChange={(e) => setCpf(formatCpf(e.target.value))} />
                            </Field>
                            <button disabled={submitting} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary min-h-13">
                                {submitting ? <CircleNotchIcon size={22} className="animate-spin" /> : (
                                    <>
                                        Continuar
                                        <ArrowRightIcon size={18} weight="bold" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-xs text-primary/45 text-center">
                            {isCheckin ? "O check-in só é permitido para participantes já inscritos nesta palestra." : "Se seu CPF ainda não existir, o cadastro será aberto automaticamente."}
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

const inputClass = "w-full text-base p-4 bg-base-100/80 border-2 border-accent/20 focus:border-accent focus:bg-base-100 rounded-2xl font-secondary text-primary caret-accent transition-all outline-none shadow-sm placeholder:text-primary/40";

export default QrCode;
