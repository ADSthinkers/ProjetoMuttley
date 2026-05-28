import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

const Competencias = () => {

    const competencias = [{nome:"Scrum", atribuida: 36}, {nome:"Desenvolvimento Java", atribuida: 12}]
    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")
 
    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Mais atribuídas", "Menos atribuídas"]
 
    const competenciasFiltradas = competencias.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <div className="flex bg-base-100">
            {/* Sidebar */}
            <Sidebar className="" />

            {/* Conteúdo */}
            <div className="pt-5 pl-2 pr-5 w-full overflow-y-auto h-screen flex flex-col gap-5">
                <h1 className="text-4xl font-primary text-primary font-bold mt-8">Competências</h1>

                {/* Busca + Ordenar */}
                <div className="flex flex-col gap-2">
                    <label className="text-base font-primary text-primary/85" htmlFor="busca">Buscar</label>
                    <div className="flex gap-3">
                        {/* Campo de busca */}
                        <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 h-15">
                            <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome de uma competência aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
                            <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                        </div>
 
                        {/* Ordenar por */}
                        <div className="relative">
                            <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full">
                                <option value="" disabled>Ordenar por</option>
                                {ordens.map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                            <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                        </div>
                    </div>
                </div>
 
                {/* Cards de competências */}
                <div className="flex flex-wrap gap-3">
                    {competenciasFiltradas.map((c, index) => (
                        <div key={index} className="bg-accent/50 rounded-2xl px-5 py-4 flex items-start gap-3 min-w-40 hover:bg-accent/70 transition-all group">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-primary font-bold text-primary tracking-wide">
                                    {c.nome}
                                </span>
                                <span className="text-xs font-secondary text-primary/60 underline underline-offset-2">
                                    Atribuído a {c.atribuida} palestras
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}

export default Competencias;