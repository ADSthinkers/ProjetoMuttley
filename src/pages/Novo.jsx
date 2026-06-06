import Sidebar from "../components/Sidebar"
import { useState, useMemo } from "react"
import { 
    LecternIcon, 
    CalendarStarIcon, 
    MedalIcon, 
    UsersIcon, 
    PlusCircleIcon, 
    PlusIcon,
    MapPinIcon,
    MicrophoneStageIcon,
    HandshakeIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    PrinterIcon,
    FileTextIcon,
    CircleNotchIcon,
    EyeIcon,
    EyeSlashIcon,
    SparkleIcon
} from "@phosphor-icons/react"
import ParticipanteForm from "../components/ParticipanteForm"
import PalestraForm from "../components/PalestraForm"
import LocalForm from "../components/LocalForm"
import PalestranteForm from "../components/PalestranteForm"
import PatrocinadorForm from "../components/PatrocinadorForm"
import EventoForm from "../components/EventoForm"
import CompetenciaForm from "../components/CompetenciaForm"
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import { isAdmin, isPalestrante } from "../utils/auth";

const getApiErrorMessage = (err) => {
    if (!err.response) {
        return err.request
            ? "Não foi possível conectar ao servidor. Verifique sua conexão."
            : "Ocorreu um erro ao realizar o cadastro.";
    }

    const responseData = err.response.data;

    if (typeof responseData === "string") return responseData;
    if (!responseData || typeof responseData !== "object") return "Erro na validação dos dados.";

    if (responseData.message) return responseData.message;
    if (responseData.error) return responseData.error;
    if (Array.isArray(responseData.errors)) {
        return responseData.errors
            .map((error) => error.defaultMessage || error.message || String(error))
            .join(", ");
    }

    const messages = Object.entries(responseData)
        .map(([field, message]) => {
            if (Array.isArray(message)) return `${field}: ${message.join(", ")}`;
            if (message && typeof message === "object") return `${field}: ${message.message || JSON.stringify(message)}`;
            return `${field}: ${message}`;
        });

    return messages.length > 0 ? messages.join(", ") : "Erro na validação dos dados.";
};

const Novo = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': dbKEY,
            'Accept': 'application/json',
        }
    }), [dbURL, dbKEY]);

    const [ etapa, setEtapa ] = useState(1)
    const [ tipo, setTipo ] = useState("")
    const [ objeto, setObjeto ] = useState({})
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ showPassword, setShowPassword ] = useState(false)
    
    const passos = [
        { id: 1, label: "Categoria" },
        { id: 2, label: "Dados" },
        { id: 3, label: "Revisão" },
        { id: 4, label: "Sucesso" }
    ];

    const categorias = [
        { id: "palestra", label: "Palestra", icon: <LecternIcon size={40} /> },
        { id: "evento", label: "Evento", icon: <CalendarStarIcon size={40} />, roles: ["ADMIN"] },
        { id: "participante", label: "Participante", icon: <UsersIcon size={40} /> },
        { id: "local", label: "Local", icon: <MapPinIcon size={40} />, roles: ["ADMIN"] },
        { id: "palestrante", label: "Palestrante", icon: <MicrophoneStageIcon size={40} /> },
        { id: "patrocinador", label: "Patrocinador", icon: <HandshakeIcon size={40} />, roles: ["ADMIN"] },
        { id: "competência", label: "Competência", icon: <MedalIcon size={40} /> },
    ].filter(cat => {
        if (cat.roles && cat.roles.includes("ADMIN") && !isAdmin()) return false;
        if (cat.id === "evento" && isPalestrante()) return false;
        return true;
    })

    const handleSelectTipo = (t) => {
        setTipo(t);
        setObjeto({}); // Limpa os dados do item anterior ao trocar de categoria
        setError(null);
        setEtapa(2);
    }

    const renderForm = () => {
        const props = { setObjeto, setEtapa, objeto };
        switch (tipo.toLowerCase()) {
            case "participante": return <ParticipanteForm {...props} />;
            case "palestra": return <PalestraForm {...props} />;
            case "local": return <LocalForm {...props} />;
            case "palestrante": return <PalestranteForm {...props} />;
            case "patrocinador": return <PatrocinadorForm {...props} />;
            case "evento": return <EventoForm {...props} />;
            case "competência": return <CompetenciaForm {...props} />;
            default: return null;
        }
    };

    const handlePrint = () => {
        window.print();
    }

    const handleConfirmar = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = "";
            let data = { ...objeto };

            switch (tipo.toLowerCase()) {
                case "participante":
                    endpoint = "/participantes";
                    break;
                case "palestrante":
                    endpoint = "/palestrantes";
                    break;
                case "evento":
                    endpoint = "/eventos";
                    data = {
                        titulo: data.titulo,
                        descricao: data.descricao,
                        dataInicio: data.dataInicio,
                        dataFim: data.dataFim || null,
                        categoria: data.categoria,
                        modalidade: data.modalidade || null,
                        banner: data.banner,
                        patrocinadorId: data.patrocinadorId || null
                    };
                    break;
                case "competência":
                    endpoint = "/competencias";
                    break;
                case "palestra":
                    endpoint = "/palestras";
                    data = {
                        ...data,
                        eventoId: data.eventoId || null,
                        status: data.status || "PENDENTE"
                    };
                    break;
                case "patrocinador":
                    endpoint = "/patrocinadores";
                    break;
                case "local":
                    endpoint = "/locais";
                    break;
                default:
                    throw new Error("Tipo desconhecido");
            }

            await api.post(endpoint, data);
            setEtapa(4);
        } catch (err) {
            console.error("Erro ao salvar:", err);
            
            const errorMessage = getApiErrorMessage(err);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex bg-base-100 min-h-screen print:bg-white">
                <div className="print:hidden">
                    <Sidebar />
                </div>
                <div className="pt-8 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6 print:p-0 print:h-auto print:overflow-visible">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 print:hidden">
                        <motion.div variants={itemVariants}>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <SparkleIcon size={16} weight="fill" />
                                Assistente de cadastro
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Novo Cadastro</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">Escolha uma categoria, preencha os dados e revise antes de salvar.</p>
                        </motion.div>
                        {etapa > 1 && etapa < 4 && (
                            <motion.button 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setEtapa(etapa - 1)}
                                className="btn border-0 rounded-2xl bg-accent/20 hover:bg-accent/35 text-primary font-secondary shadow-none"
                            >
                                <ArrowLeftIcon size={20} />
                                Voltar
                            </motion.button>
                        )}
                    </div>

                    {/* Stepper Moderno */}
                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-5 flex items-center justify-center w-full max-w-5xl mx-auto print:hidden">
                        {passos.map((passo, idx) => (
                            <div key={passo.id} className="flex items-center flex-1 last:flex-none">
                                <div 
                                    onClick={() => etapa > passo.id && setEtapa(passo.id)}
                                    className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${etapa === passo.id ? "scale-105" : "opacity-65 hover:opacity-100"}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-primary transition-all duration-300 ${etapa >= passo.id ? "bg-accent text-primary shadow-sm" : "bg-base-100/60 text-primary/35 border border-accent/10"}`}>
                                        {etapa > passo.id ? <CheckCircleIcon size={28} weight="fill" className="text-secondary/75"/> : passo.id}
                                    </div>
                                    <span className={`text-[10px] font-secondary uppercase tracking-tighter ${etapa >= passo.id ? "text-primary font-bold" : "text-primary/30"}`}>
                                        {passo.label}
                                    </span>
                                </div>
                                {idx < passos.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-4 bg-base-100/60 relative overflow-hidden rounded-full">
                                        <motion.div 
                                            initial={false}
                                            animate={{ width: etapa > passo.id ? "100%" : "0%" }}
                                            className="absolute top-0 left-0 h-full bg-accent"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                    
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {etapa === 1 && (
                                <motion.div 
                                    key="step1"
                                    variants={containerVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 print:hidden"
                                >
                                    {categorias.map((cat) => (
                                        <motion.div 
                                            key={cat.id}
                                            variants={itemVariants}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectTipo(cat.id)}
                                            className="relative overflow-hidden bg-accent/25 hover:bg-accent/35 rounded-3xl p-7 flex flex-col items-start justify-between gap-8 cursor-pointer border border-accent/15 transition-colors group min-h-64"
                                        >
                                            <div className="absolute right-0 top-0 w-24 h-24 bg-accent/20 rounded-bl-[40px]" />
                                            <div className="w-18 h-18 bg-accent/50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:rotate-3 transition-all duration-300 border border-accent/20 z-10">
                                                {cat.icon}
                                            </div>
                                            <div className="z-10 w-full">
                                                <h2 className="text-2xl font-primary text-primary font-bold">{cat.label}</h2>
                                                <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4">
                                                    <p className="text-xs font-secondary text-primary/45 uppercase tracking-widest">Iniciar cadastro</p>
                                                    <div className="w-10 h-10 rounded-xl bg-base-100/60 group-hover:bg-accent flex items-center justify-center text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                                        <ArrowRightIcon size={18} weight="light" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {etapa === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="max-w-2xl mx-auto w-full bg-accent/15 p-8 md:p-10 rounded-3xl border border-accent/15 print:hidden"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary shadow-lg shadow-accent/20">
                                            {categorias.find(c => c.id === tipo)?.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-primary text-primary font-bold">Dados do {tipo}</h2>
                                            <p className="text-sm font-secondary text-primary/50">Preencha todos os campos obrigatórios para continuar.</p>
                                        </div>
                                    </div>
                                    {renderForm()}
                                </motion.div>
                            )}

                            {etapa === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="max-w-3xl mx-auto w-full flex flex-col gap-8 print:block"
                                >
                                    <div className="bg-accent/15 p-8 md:p-10 rounded-3xl border border-accent/15 print:bg-white print:border-none print:p-0">
                                        <div className="flex items-center justify-between mb-8 print:mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary print:hidden">
                                                    <FileTextIcon size={28} />
                                                </div>
                                                <h2 className="text-2xl font-primary text-primary font-bold">Confirmação de Dados</h2>
                                            </div>
                                            <button 
                                                onClick={handlePrint}
                                                className="flex items-center gap-2 bg-accent/30 hover:bg-accent/50 text-primary px-4 py-2 rounded-xl transition-all cursor-pointer font-secondary text-sm print:hidden"
                                            >
                                                <PrinterIcon size={20} />
                                                Imprimir
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-1">
                                            {Object.entries(objeto).map(([key, value]) => {
                                                if (typeof value === 'object' && !Array.isArray(value)) return null;
                                                
                                                const label = key.replace(/([A-Z])/g, ' $1');
                                                const isPassword = key.toLowerCase() === "senha";

                                                return (
                                                    <div key={key} className="flex flex-col gap-1 border-b border-accent/20 pb-2 print:border-black/10 relative">
                                                        <span className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">{label}</span>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-lg font-primary text-primary font-medium">
                                                                {isPassword && !showPassword 
                                                                    ? "••••••••" 
                                                                    : (Array.isArray(value) ? value.join(", ") : String(value))}
                                                            </span>
                                                            {isPassword && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                                                                >
                                                                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {error && (
                                            <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-secondary">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mt-12 flex gap-4 print:hidden">
                                            <button 
                                                disabled={loading}
                                                className="flex-1 bg-accent text-primary py-5 rounded-2xl font-primary font-bold hover:bg-accent/80 transition-all cursor-pointer shadow-lg shadow-accent/20 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                                onClick={handleConfirmar}
                                            >
                                                {loading ? (
                                                    <CircleNotchIcon size={24} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Confirmar e Finalizar</span>
                                                        <ArrowRightIcon size={20} weight="bold" />
                                                    </>
                                                )}
                                            </button>
                                            <button 
                                                disabled={loading}
                                                className="px-10 bg-accent/20 text-primary rounded-2xl font-primary font-bold hover:bg-accent/30 transition-all cursor-pointer disabled:opacity-50"
                                                onClick={() => setEtapa(2)}
                                            >
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {etapa === 4 && (
                                <motion.div 
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center gap-8 py-12 text-center print:hidden"
                                >
                                    <div className="relative">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", damping: 12, delay: 0.2 }}
                                            className="w-32 h-32 bg-right/20 rounded-full flex items-center justify-center"
                                        >
                                            <CheckCircleIcon size={80} className="text-right text-accent" weight="fill" />
                                        </motion.div>
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-right/30 rounded-full -z-10"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-primary text-primary font-bold">Sucesso!</h2>
                                        <p className="text-lg font-secondary text-primary/60 mt-2">O cadastro de {tipo} foi realizado com sucesso.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            className="flex items-center gap-2 bg-accent/90 text-primary px-8 py-4 rounded-2xl font-primary font-bold hover:opacity-90 transition-all cursor-pointer" 
                                            onClick={() => { setEtapa(1); setObjeto({}); }}
                                        >
                                            <PlusIcon size={20} weight="bold" />
                                            Novo {tipo}
                                        </button>
                                        <button 
                                            className="bg-accent/20 text-primary px-8 py-4 rounded-2xl font-primary font-bold hover:bg-accent/30 transition-all cursor-pointer" 
                                            onClick={() => window.history.back()}
                                        >
                                            Sair
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { position: absolute; left: 0; top: 0; width: 100%; }
                }
            ` }} />
        </PageTransition>
    );
};

export default Novo;
