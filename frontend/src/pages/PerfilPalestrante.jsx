import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { 
    UserIcon, 
    MicrophoneStageIcon, 
    IdentificationCardIcon, 
    EnvelopeIcon, 
    GraduationCapIcon, 
    BriefcaseIcon,
    CalendarIcon
} from "@phosphor-icons/react";
import AlunoAvatar from "../utils/AlunoAvatar";
import { useParams } from "react-router-dom";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"

const PerfilPalestrante = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("dados");

    // Mock data for the speaker
    const palestrante = {
        id: id || 1,
        nome: "Dr. Alan Turing",
        cpf: "111.222.333-44",
        email: "alan.turing@bletchley.park",
        formacao: "Doutorado em Matemática e Ciência da Computação",
        especialidade: "Criptografia, Inteligência Artificial e Lógica",
        biografia: "Pioneiro da computação teórica e inteligência artificial. Conhecido por decifrar o código Enigma durante a Segunda Guerra Mundial e por propor o Teste de Turing.",
        palestrasMinistradas: [
            { id: 101, titulo: "O Nascimento da Inteligência Artificial", data: "20/05/2026", local: "Auditório Central", publico: 150 },
            { id: 102, titulo: "Criptografia Moderna e Segurança", data: "12/04/2026", local: "Laboratório de Redes", publico: 80 },
            { id: 103, titulo: "Máquinas de Computação e Inteligência", data: "05/03/2026", local: "Sala de Conferências", publico: 120 }
        ]
    };

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-8">
                    
                    {/* Cabeçalho do Perfil */}
                    <motion.div variants={itemVariants} className="flex items-center gap-6 bg-accent/20 p-8 rounded-3xl relative overflow-hidden group">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-24 h-24 rounded-full border-4 border-accent shadow-lg flex-shrink-0 z-10"
                        >
                            <AlunoAvatar email={palestrante.email} nome={palestrante.nome} className="w-full h-full rounded-full" />
                        </motion.div>
                        <div className="flex flex-col z-10">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-primary text-primary font-bold">{palestrante.nome}</h1>
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="badge badge-primary font-secondary"
                                >
                                    Especialista
                                </motion.div>
                            </div>
                            <p className="text-primary/60 font-secondary mt-1">{palestrante.especialidade}</p>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                    </motion.div>

                    {/* Navegação por Abas */}
                    <motion.div variants={itemVariants} className="flex gap-4 border-b border-primary/10">
                        {["dados", "palestras"].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-6 py-3 font-primary font-bold transition-all relative ${activeTab === tab ? "text-primary" : "text-primary/40 hover:text-primary/60"}`}
                            >
                                {tab === "dados" && <><UserIcon size={20} /> Dados e Formação</>}
                                {tab === "palestras" && <><MicrophoneStageIcon size={20} /> Palestras Ministradas</>}
                                
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTabPalestrante"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>

                    {/* Conteúdo das Abas */}
                    <div className="flex-1 pb-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "dados" && (
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={palestrante.cpf} index={0} />
                                            <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail Profissional" value={palestrante.email} index={1} />
                                        </div>

                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-accent/5 p-8 rounded-3xl border border-accent/10 flex flex-col gap-6"
                                        >
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-primary font-primary font-bold text-xl">
                                                    <GraduationCapIcon size={24} weight="bold" />
                                                    Formação Acadêmica
                                                </div>
                                                <p className="text-primary/80 font-secondary text-lg ml-8">{palestrante.formacao}</p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-primary font-primary font-bold text-xl">
                                                    <BriefcaseIcon size={24} weight="bold" />
                                                    Biografia Profissional
                                                </div>
                                                <p className="text-primary/80 font-secondary leading-relaxed ml-8">{palestrante.biografia}</p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {activeTab === "palestras" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">
                                        {palestrante.palestrasMinistradas.length > 0 ? (
                                            palestrante.palestrasMinistradas.map((palestra, idx) => (
                                                <motion.div 
                                                    key={palestra.id} 
                                                    variants={itemVariants}
                                                    whileHover={{ x: 4 }}
                                                    className="bg-accent/10 p-6 rounded-2xl flex justify-between items-center hover:bg-accent/20 transition-all border border-accent/5"
                                                >
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-xl font-primary font-bold text-primary">{palestra.titulo}</span>
                                                        <div className="flex items-center gap-4 text-sm font-secondary text-primary/60">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon size={16} />
                                                                {palestra.data}
                                                            </span>
                                                            <span className="mx-2 text-primary/20">|</span>
                                                            <span>Local: {palestra.local}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <div className="badge badge-accent font-secondary text-xs p-3">
                                                            {palestra.publico} Participantes
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-primary/40 text-center py-10 font-secondary">Nenhuma palestra ministrada registrada.</p>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

const InfoCard = ({ icon, label, value, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -4 }}
        className="bg-accent/5 p-6 rounded-2xl border border-accent/10 flex items-center gap-4"
    >
        <div className="bg-accent/20 p-3 rounded-xl text-primary">
            {icon}
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-secondary text-primary/50 uppercase tracking-wider">{label}</span>
            <span className="text-lg font-primary font-bold text-primary">{value}</span>
        </div>
    </motion.div>
);

export default PerfilPalestrante;
