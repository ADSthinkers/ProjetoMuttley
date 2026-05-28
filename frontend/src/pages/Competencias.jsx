import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"

const Competencias = () => {
    const competencias = [{nome:"Scrum", atribuida: 36}, {nome:"Desenvolvimento Java", atribuida: 12}]
    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")
 
    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Mais atribuídas", "Menos atribuídas"]
 
    const competenciasFiltradas = competencias.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar className="" />
                <div className="pt-5 pl-2 pr-5 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.h1 variants={itemVariants} className="text-4xl font-primary text-primary font-bold mt-8">Competências</motion.h1>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-base font-primary text-primary/85" htmlFor="busca">Buscar</label>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 h-15 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome de uma competência aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>
    
                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full hover:bg-accent/30 transition-colors">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>
    
                    {/* Cards de competências */}
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="flex flex-wrap gap-4"
                    >
                        {competenciasFiltradas.map((c, index) => (
                            <motion.div 
                                key={index} 
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -4, backgroundColor: "rgba(252, 209, 96, 0.7)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-accent/50 rounded-2xl px-6 py-5 flex items-start gap-3 min-w-48 transition-all group cursor-default border border-primary/5"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-base font-primary font-bold text-primary tracking-wide">
                                        {c.nome}
                                    </span>
                                    <span className="text-xs font-secondary text-primary/60 underline underline-offset-2 decoration-primary/20 group-hover:decoration-primary/60 transition-colors">
                                        Atribuído a {c.atribuida} palestras
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    )
}

export default Competencias;
