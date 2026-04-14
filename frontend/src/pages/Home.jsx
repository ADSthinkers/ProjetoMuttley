//import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { LecternIcon, CalendarStarIcon, CaretRightIcon } from "@phosphor-icons/react"


const Home = () => {

    const proximos = [
        {
            tipo: "Palestra",
            dia: "27",
            mes: "mar",
            titulo: "Boas práticas no desenvolvimento de software ágil",
            descricao: "Aula aberta sobre boas práticas ao planejar e arquiteturar softwares",
            link: "/evento/1"
        },
        {
            tipo: "Evento",
            dia: "01",
            mes: "abr",
            titulo: "FATEC Portas Abertas 2026",
            descricao: "Aulas abertas sobre diversos assuntos.",
            link: "/evento/2"
        }
    ]
 
    const [filtro, setFiltro] = useState("Todos")
    const [filtro2, setFiltro2] = useState("Todos")

    const filtros = ["Todos", "Palestra", "Evento"]

    const itensFiltrados = proximos.filter(item =>
        filtro === "Todos" || item.tipo === filtro
    )

    const itensFiltrados2 = proximos.filter(item =>
        filtro2 === "Todos" || item.tipo === filtro2
    )


    return (
        <div className="flex bg-base-100">
            <Sidebar className="" />
            {/* Sidebar */}
            <div className="pt-5 pl-2 pr-5 w-full overflow-y-auto h-screen">
                <h1 className="text-4xl font-primary text-primary font-bold mt-8 ">Home</h1>
                <div className="py-5 flex flex-col xl:flex-row gap-10">
                    <div className="p-6 flex flex-col gap-5 bg-accent/40 rounded-3xl h-[84.75vh] min-h-152 flex-1">

                        {/* Título */}
                        <h2 className="text-3xl font-primary font-light text-primary">Próximos</h2>
            
                        {/* Filter tabs */}
                        <div className="flex items-center bg-accent/30 rounded-2xl p-1 gap-1">
                            {filtros.map((f) => (
                                <button key={f} onClick={() => setFiltro(f)} className={`flex-1 flex font-secondary items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${filtro === f ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}>
                                    {f === "Palestra" && <LecternIcon size={16} weight="light" />}
                                    {f === "Evento" && <CalendarStarIcon size={16} weight="light" />}
                                    {f}
                                </button>
                            ))}
                        </div>
            
                        {/* Cards */}
                        <div className="flex flex-col gap-4">
                            {itensFiltrados.map((item, index) => (
                                <a key={index} href={item.link} className="bg-accent/70 rounded-3xl p-5 flex items-stretch gap-4 hover:bg-accent/90 transition-all group w-full flex-1">
                                    {/* Data */}
                                    <div className="flex flex-col items-center justify-center min-w-14 text-primary font-primary">
                                        <span className="text-4xl font-light leading-none">{item.dia}</span>
                                        <span className="text-xl font-light">{item.mes}</span>
                                    </div>
            
                                    {/* Divider */}
                                    <div className="w-px bg-primary/30 self-stretch" />
            
                                    {/* Content */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* Badge */}
                                        <span className="inline-flex items-center gap-1.5 self-start bg-primary/15 text-primary font-secondary text-xs font-medium px-3 py-1 rounded-full">
                                            {item.tipo === "Palestra" ? <LecternIcon size={12} weight="light" /> : <CalendarStarIcon size={12} weight="light" />}
                                            {item.tipo}
                                        </span>
            
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-base font-medium font-primary text-primary leading-snug">{item.titulo}</h3>
                                                <p className="text-sm font-secondary text-primary/70 leading-snug">{item.descricao}</p>
                                            </div>
                                            <CaretRightIcon size={20} weight="light" className="text-primary/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-6 flex flex-col gap-5 bg-accent/40 rounded-3xl h-[84.75vh] min-h-152 flex-1">

                        {/* Título */}
                        <h2 className="text-3xl font-primary font-light text-primary">Anteriores</h2>
            
                        {/* Filter tabs */}
                        <div className="flex items-center bg-accent/30 rounded-2xl p-1 gap-1">
                            {filtros.map((f) => (
                                <button key={f} onClick={() => setFiltro2(f)} className={`flex-1 flex font-secondary items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${filtro2 === f ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}>
                                    {f === "Palestra" && <LecternIcon size={16} weight="light" />}
                                    {f === "Evento" && <CalendarStarIcon size={16} weight="light" />}
                                    {f}
                                </button>
                            ))}
                        </div>
            
                        {/* Cards */}
                        <div className="flex flex-col gap-4">
                            {itensFiltrados2.map((item, index) => (
                                <a key={index} href={item.link} className="bg-accent/70 rounded-3xl p-5 flex items-stretch gap-4 hover:bg-accent/90 transition-all group w-full flex-1">
                                    {/* Data */}
                                    <div className="flex flex-col items-center justify-center min-w-14 text-primary font-primary">
                                        <span className="text-4xl font-light leading-none">{item.dia}</span>
                                        <span className="text-xl font-light">{item.mes}</span>
                                    </div>
            
                                    {/* Divider */}
                                    <div className="w-px bg-primary/30 self-stretch" />
            
                                    {/* Content */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* Badge */}
                                        <span className="inline-flex items-center gap-1.5 self-start bg-primary/15 text-primary font-secondary text-xs font-medium px-3 py-1 rounded-full">
                                            {item.tipo === "Palestra" ? <LecternIcon size={12} weight="light" /> : <CalendarStarIcon size={12} weight="light" />}
                                            {item.tipo}
                                        </span>
            
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-base font-medium font-primary text-primary leading-snug">{item.titulo}</h3>
                                                <p className="text-sm font-secondary text-primary/70 leading-snug">{item.descricao}</p>
                                            </div>
                                            <CaretRightIcon size={20} weight="light" className="text-primary/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;