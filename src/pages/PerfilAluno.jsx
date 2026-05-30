import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { UserIcon, BookOpenIcon, MedalIcon, IdentificationCardIcon, EnvelopeIcon, HashIcon } from "@phosphor-icons/react";
import AlunoAvatar from "../utils/AlunoAvatar";
import { useParams } from "react-router-dom";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion, AnimatePresence } from "framer-motion"

const PerfilAluno = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("dados");

    // Mock data for the student
    const aluno = {
        id: id || 4,
        nome: "Miguel Victor",
        cpf: "123.456.789-10",
        emailPessoal: "miguel.balbo@yahoo.com.br",
        emailFatec: "miguel.victor@fatec.sp.gov.br",
        ra: "1234567890123",
        palestras: [
            { id: 1, titulo: "Inteligência Artificial na Prática", data: "20/05/2026", palestrante: "Dr. Alan Turing" },
            { id: 2, titulo: "Desenvolvimento Web com React 19", data: "15/05/2026", palestrante: "Jordan Walke" },
            { id: 3, titulo: "Segurança da Informação e LGPD", data: "10/05/2026", palestrante: "Edward Snowden" }
        ],
        competencias: [
            { nome: "React", nivel: "Avançado" },
            { nome: "JavaScript", nivel: "Avançado" },
            { nome: "Tailwind CSS", nivel: "Intermediário" },
            { nome: "Node.js", nivel: "Intermediário" },
            { nome: "Git", nivel: "Avançado" }
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
                            <AlunoAvatar email={aluno.emailPessoal} nome={aluno.nome} className="w-full h-full rounded-full" />
                        </motion.div>
                        <div className="flex flex-col z-10">
                            <h1 className="text-4xl font-primary text-primary font-bold">{aluno.nome}</h1>
                            <p className="text-primary/60 font-secondary">Estudante de Tecnologia</p>
                        </div>
                        {/* Subtle background decoration */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                    </motion.div>

                    {/* Navegação por Abas */}
                    <motion.div variants={itemVariants} className="flex gap-4 border-b border-primary/10">
                        {["dados", "palestras", "competencias"].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-6 py-3 font-primary font-bold transition-all relative ${activeTab === tab ? "text-primary" : "text-primary/40 hover:text-primary/60"}`}
                            >
                                {tab === "dados" && <><UserIcon size={20} /> Dados Pessoais</>}
                                {tab === "palestras" && <><BookOpenIcon size={20} /> Palestras</>}
                                {tab === "competencias" && <><MedalIcon size={20} /> Competências</>}
                                
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoCard icon={<IdentificationCardIcon size={24} />} label="CPF" value={aluno.cpf} index={0} />
                                        <InfoCard icon={<HashIcon size={24} />} label="RA" value={aluno.ra} index={1} />
                                        <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail Pessoal" value={aluno.emailPessoal} index={2} />
                                        <InfoCard icon={<EnvelopeIcon size={24} />} label="E-mail Fatec" value={aluno.emailFatec} index={3} />
                                    </div>
                                )}

                                {activeTab === "palestras" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col gap-4">
                                        {aluno.palestras.length > 0 ? (
                                            aluno.palestras.map((palestra, idx) => (
                                                <motion.div 
                                                    key={palestra.id} 
                                                    variants={itemVariants}
                                                    whileHover={{ x: 4 }}
                                                    className="bg-accent/10 p-5 rounded-2xl flex justify-between items-center hover:bg-accent/20 transition-all border border-accent/5"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-lg font-primary font-bold text-primary">{palestra.titulo}</span>
                                                        <span className="text-sm font-secondary text-primary/60">Palestrante: {palestra.palestrante}</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-sm font-secondary font-bold text-primary">{palestra.data}</span>
                                                        <span className="badge badge-accent badge-outline mt-1 font-secondary text-[10px] py-2 px-2">Participou</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-primary/40 text-center py-10 font-secondary">Nenhuma palestra registrada.</p>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "competencias" && (
                                    <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-wrap gap-4">
                                        {aluno.competencias.map((comp, index) => (
                                            <motion.div 
                                                key={index} 
                                                variants={itemVariants}
                                                whileHover={{ y: -4, scale: 1.05 }}
                                                className="bg-accent/40 px-6 py-4 rounded-2xl flex flex-col gap-1 min-w-40 border border-primary/5 hover:bg-accent/60 transition-all cursor-default"
                                            >
                                                <span className="text-primary font-primary font-bold">{comp.nome}</span>
                                                <span className="text-xs font-secondary text-primary/70">{comp.nivel}</span>
                                            </motion.div>
                                        ))}
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

export default PerfilAluno;
