import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    DownloadSimpleIcon, 
    ArrowLeftIcon,
    SealCheckIcon,
    IdentificationCardIcon,
    CalendarBlankIcon,
    ClockIcon,
    BookOpenIcon,
    MicrophoneStageIcon,
    FingerprintIcon,
    CircleNotchIcon
} from "@phosphor-icons/react";
import PageTransition, { itemVariants } from "../components/PageTransition";
import { motion } from "framer-motion";
import axios from "axios";
import MuttleyLogo from "../assets/muttley_logo.svg";

import toast, { Toaster } from "react-hot-toast";

const parseCertificadoDate = (value) => {
    if (!value) return null;

    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }

    if (typeof value === "string") {
        const normalized = value.includes("T") ? value : value.replace(" ", "T");
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatCertificadoDate = (value) => {
    const date = parseCertificadoDate(value);
    return date ? date.toLocaleDateString("pt-BR") : "-";
};

const normalizarNome = (value) => (value || "").trim().toLocaleLowerCase("pt-BR");

const ValidarCertificado = () => {
    const { codigo } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [certificado, setCertificado] = useState(null);
    const [tipoCertificado, setTipoCertificado] = useState("PARTICIPACAO");

    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": dbKEY,
            "Accept": "application/json",
        }
    }), [dbURL, dbKEY]);

    useEffect(() => {
        const fetchCertificado = async () => {
            if (!codigo) return;
            try {
                const [certificadoRes, palestrantesRes] = await Promise.all([
                    api.get(`/certificados/validar/${codigo}`),
                    api.get("/palestrantes").catch(() => ({ data: [] }))
                ]);
                const certificadoData = certificadoRes.data;
                const titular = normalizarNome(certificadoData?.participanteNome);
                const isPalestrante = palestrantesRes.data.some((palestrante) => normalizarNome(palestrante.nome) === titular);

                setCertificado(certificadoData);
                setTipoCertificado(certificadoData?.tipo || (isPalestrante ? "APRESENTACAO" : "PARTICIPACAO"));
            } catch (err) {
                console.error("Erro ao validar certificado:", err);
                setError("Certificado não encontrado ou código inválido.");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificado();
    }, [api, codigo]);

    const handleDownload = async () => {
        try {
            const pdfUrl = certificado?.id
                ? `/certificados/${certificado.id}/pdf`
                : `/certificados/validar/${codigo}/pdf`;

            const response = await api.get(pdfUrl, {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `certificado-${certificado?.codigoValidacao || codigo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erro ao baixar certificado:", err);
            toast.error("Não foi possível baixar o certificado.");
        }
    };

    const isApresentacao = tipoCertificado === "APRESENTACAO";
    const certificadoTitulo = isApresentacao ? "Certificado de Apresentação Válido" : "Certificado de Participação Válido";
    const titularLabel = isApresentacao ? "Palestrante" : "Participante";
    const tipoLabel = isApresentacao ? "Apresentação" : "Participação";
    const tipoDescription = isApresentacao
        ? "Este documento comprova a atuação como palestrante nesta atividade."
        : "Este documento comprova a participação confirmada nesta atividade.";

    if (loading) {
        return (
            <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-6">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-accent"
                >
                    <CircleNotchIcon size={48} />
                </motion.div>
                <p className="mt-4 font-secondary text-primary/60 animate-pulse">Validando autenticidade...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="min-h-screen bg-base-100 flex flex-col items-center py-12 px-6">
                {/* Logo Section */}
                <motion.div variants={itemVariants} className="mb-12">
                    <img src={MuttleyLogo} alt="Muttley Logo" className="h-12" />
                </motion.div>

                <div className="w-full max-w-2xl">
                    {error ? (
                        <motion.div 
                            variants={itemVariants}
                            className="bg-error/10 border border-error/20 rounded-[40px] p-10 flex flex-col items-center text-center gap-6"
                        >
                            <div className="w-20 h-20 bg-error/20 rounded-3xl flex items-center justify-center text-error">
                                <XCircleIcon size={48} weight="fill" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-3xl font-primary text-primary font-bold">Certificado Inválido</h1>
                                <p className="font-secondary text-primary/60 max-w-sm">
                                    Não conseguimos encontrar nenhum registro associado a este código de validação.
                                </p>
                            </div>
                            <div className="bg-error/5 border border-dashed border-error/30 rounded-2xl px-6 py-4 font-mono text-error/80 text-sm break-all">
                                {codigo}
                            </div>
                            <Link 
                                to="/" 
                                className="mt-4 flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-secondary"
                            >
                                <ArrowLeftIcon size={20} />
                                Voltar para o início
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {/* Success Header */}
                            <motion.div 
                                variants={itemVariants}
                                className="bg-accent/20 border border-accent/10 rounded-[40px] p-10 flex flex-col items-center text-center gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <SealCheckIcon size={120} weight="fill" className="text-primary" />
                                </div>
                                
                                <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-primary shadow-lg shadow-accent/20 z-10">
                                    <CheckCircleIcon size={48} weight="fill" />
                                </div>
                                
                                <div className="flex flex-col gap-2 z-10">
                                    <div className="badge badge-accent font-secondary font-bold uppercase tracking-widest text-[10px] py-3 px-4">
                                        {tipoLabel}
                                    </div>
                                    <h1 className="text-4xl font-primary text-primary font-bold mt-2">{certificadoTitulo}</h1>
                                    <p className="font-secondary text-primary/60">
                                        {tipoDescription}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Info Grid */}
                            <motion.div 
                                variants={itemVariants}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <InfoBlock 
                                    icon={isApresentacao ? <MicrophoneStageIcon size={24} /> : <IdentificationCardIcon size={24} />} 
                                    label={titularLabel}
                                    value={certificado?.participanteNome || "-"} 
                                />
                                <InfoBlock 
                                    icon={<BookOpenIcon size={24} />} 
                                    label="Atividade" 
                                    value={certificado?.palestraTitulo || "-"} 
                                />
                                <InfoBlock 
                                    icon={<ClockIcon size={24} />} 
                                    label="Carga Horária" 
                                    value={certificado?.cargaHoraria ? `${certificado.cargaHoraria} horas` : "-"} 
                                />
                                <InfoBlock 
                                    icon={<CalendarBlankIcon size={24} />} 
                                    label="Data de Emissão" 
                                    value={formatCertificadoDate(certificado?.dataEmissao)} 
                                />
                            </motion.div>

                            {/* Validation Code */}
                            <motion.div 
                                variants={itemVariants}
                                className="bg-accent/5 border border-accent/15 rounded-3xl p-8 flex flex-col gap-4"
                            >
                                <div className="flex items-center gap-2 text-primary/40">
                                    <FingerprintIcon size={20} />
                                    <span className="text-xs font-secondary font-bold uppercase tracking-wider">Código de Validação</span>
                                </div>
                                <div className="bg-base-100/50 border border-accent/10 rounded-2xl px-6 py-4 font-mono text-primary text-lg text-center break-all shadow-inner">
                                    {certificado?.codigoValidacao}
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div 
                                variants={itemVariants}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <button 
                                    onClick={handleDownload}
                                    className="flex-1 bg-accent text-primary h-16 rounded-2xl font-primary font-bold flex items-center justify-center gap-3 hover:bg-accent/80 transition-all shadow-lg shadow-accent/10 text-lg cursor-pointer"
                                >
                                    <DownloadSimpleIcon size={24} weight="bold" />
                                    Baixar Certificado
                                </button>
                                <Link 
                                    to="/"
                                    className="sm:w-48 bg-accent/10 text-primary h-16 rounded-2xl font-primary font-bold flex items-center justify-center hover:bg-accent/20 transition-all"
                                >
                                    Voltar
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

const InfoBlock = ({ icon, label, value }) => (
    <div className="bg-accent/10 border border-accent/10 rounded-3xl p-6 flex flex-col gap-3">
        <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-primary">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] font-secondary font-bold uppercase tracking-widest text-primary/40">{label}</span>
            <span className="text-lg font-primary font-bold text-primary truncate">{value}</span>
        </div>
    </div>
);

export default ValidarCertificado;
