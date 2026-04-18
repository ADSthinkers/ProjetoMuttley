import Sidebar from "../components/Sidebar"
import { useState } from "react"
import { LecternIcon, CalendarStarIcon, MedalIcon, UsersIcon, PlusCircleIcon, PlusIcon } from "@phosphor-icons/react"
import AlunoForm from "../components/AlunoForm"
import PalestraForm from "../components/PalestraForm"

const Novo = () => {
    
    const [ etapa, setEtapa ] = useState(1)
    const [ tipo, setTipo ] = useState("")
    const [ objeto, setObjeto ] = useState()
    console.log(objeto);
    
    
    const passos = [
        { id: 1, label: "Criação" },
        { id: 2, label: "Dados" },
        { id: 3, label: "Data" },
        { id: 4, label: "Finalização" }
    ];
    
    return (
        <div className="flex">
            <Sidebar />
            <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                <h1 className="text-4xl font-primary text-primary font-bold">Novo</h1>

                {/* Timeline / Stepper */}
                <div className="w-full mx-auto py-8 relative">
                    {/* Linha de conexão de fundo */}
                    <div className="absolute top-15 left-[3.5%] right-[3.5%] h-0.5 bg-accent/20 z-0"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        {passos.map((passo) => (
                            <div key={passo.id} className="flex flex-col items-center gap-3">
                                {/* Círculo com o número */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-primary font-light transition-all duration-300 ${etapa >= passo.id ? "bg-accent text-primary font-medium" : "bg-accent/10 text-primary/30"}`}>
                                    {passo.id}
                                </div>
                                
                                {/* Rótulo do passo */}
                                <span className={`text-sm font-secondary font-light transition-colors duration-300 ${etapa >= passo.id ? "text-primary font-medium" : "text-primary/40"}`}>
                                    {passo.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {etapa == 1 ? <div>
                    {/* Botões de add*/} 
                    <div className="flex gap-5">

                        <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">
                        
                            {/* Container do Ícone */}
                            <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                                <LecternIcon size={48} className="text-secondary" weight="regular" />
                            </div>
            
                            {/* Título Principal */}
                            <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                                Palestra
                            </h2>
            
                            {/* Botão de Ação */}
                            <button className="w-full flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer" onClick={() => {setEtapa(etapa + 1); setTipo("palestra")}}>
                                <PlusIcon size={24} className="text-primary" weight="thin" /> 
                                <span>Novo</span>
                            </button>

                        </div>

                        <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">
                        
                            {/* Container do Ícone */}
                            <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                                <CalendarStarIcon size={48} className="text-secondary" weight="regular" />
                            </div>
            
                            {/* Título Principal */}
                            <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                                Evento
                            </h2>
            
                            {/* Botão de Ação */}
                            <button className="w-full flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer" onClick={() => {setEtapa(etapa + 1); setTipo("Evento")}}>
                                <PlusIcon size={24} className="text-primary" weight="thin" /> 
                                <span>Novo</span>
                            </button>

                        </div>

                        <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">
                        
                            {/* Container do Ícone */}
                            <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                                <MedalIcon size={48} className="text-secondary" weight="regular" />
                            </div>
            
                            {/* Título Principal */}
                            <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                                Competência
                            </h2>
            
                            {/* Botão de Ação */}
                            <button className="w-full flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer" onClick={() => {setEtapa(etapa + 1); setTipo("Competência")}}>
                                <PlusIcon size={24} className="text-primary" weight="thin" /> 
                                <span>Novo</span>
                            </button>

                        </div>

                        <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">
                        
                            {/* Container do Ícone */}
                            <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                                <UsersIcon size={48} className="text-secondary" weight="regular" />
                            </div>
            
                            {/* Título Principal */}
                            <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                                Aluno
                            </h2>
            
                            {/* Botão de Ação */}
                            <button className="w-full flex items-center justify-center gap-2 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer" onClick={() => {setEtapa(etapa + 1); setTipo("Aluno")}}>
                                <PlusIcon size={24} className="text-primary" weight="thin" /> 
                                <span>Novo</span>
                            </button>

                        </div>
                    </div>
                </div> : etapa == 2 ? tipo.toLowerCase === "aluno" ? <AlunoForm setObjeto={setObjeto} setEtapa={setEtapa} /> 
                : tipo.toLowerCase === "palestra" ? <PalestraForm setObjeto={setObjeto} setEtapa={setEtapa} /> : <div></div> : <div></div> }
 
            </div>
        </div>
    )
}

export default Novo