import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import AlunoCard from "../components/AlunoCard";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"

const Aluno = () => {
    const alunos = [
        {
            id: 1,
            nome: "Manon Katseye",
            cpf: "213.465.879-10",
            emailPessoal: "ilikethedrama@gameboy.com",
            emailFatec: "manon.katseye@fatec.sp.gov.br"
        },
        {
            id: 2,
            nome: "Rebecca Black",
            cpf: "157.143.271-20",
            emailPessoal: "rebecca@friday.com",
            emailFatec: "rebecca.black@fatec.sp.gov.br"
        },
        {
            id: 3,
            nome: "Charlingtonglaevionbeecheknavare dos Anjos Mendonça",
            cpf: "321.654.987-00",
            emailPessoal: "charlingtonglaevionbeecheknavare@gmail.com",
            emailFatec: "charlingtonglaevionbeecheknavare@aluno.cps.sp.gov.br"
        },{
            id: 4,
            nome: "Miguel Victor",
            cpf: "123.456.789-10",
            emailPessoal: "miguel.balbo@yahoo.com.br",
            emailFatec: "miguel.victor@fatec.sp.gov.br"
        }
    ]

    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")

    const ordens = ["Nome (A-Z)", "Nome (Z-A)"]

    const alunosFiltrados = alunos
        .filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()) || a.emailPessoal.toLowerCase().includes(busca.toLowerCase()) || a.emailFatec.toLowerCase().includes(busca.toLowerCase()) || a.cpf.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.nome.localeCompare(b.nome)
            if (ordenar === "Nome (Z-A)") return b.nome.localeCompare(a.nome)
            return 0
        })

    return (
        <PageTransition>
            <div className="flex bg-base-100 min-h-screen">
                <Sidebar />
                <div className="pt-10 pl-5 pr-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <motion.h1 variants={itemVariants} className="text-4xl font-primary text-primary font-bold">Alunos</motion.h1>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary/70" htmlFor="busca">Buscar</label>
                        <div className="flex gap-3">
                            {/* Campo de busca */}
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Digite o nome de um aluno aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            {/* Ordenar por */}
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

                    {/* Lista de alunos */}
                    <motion.div 
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="flex flex-col gap-3"
                    >
                        {alunosFiltrados.length > 0
                            ? alunosFiltrados.map(aluno => (
                                <motion.div key={aluno.id} variants={itemVariants}>
                                    <AlunoCard aluno={aluno} pageAluno={true}/>
                                </motion.div>
                            ))
                            : (
                                <motion.div variants={itemVariants} className="text-sm font-secondary text-primary/40 py-8 text-center">
                                    Nenhum aluno encontrado.
                                </motion.div>
                            )
                        }
                    </motion.div>

                </div>
            </div>
        </PageTransition>
    )
}

export default Aluno;
