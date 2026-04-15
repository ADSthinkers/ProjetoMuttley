import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import MuttleyLogo from "../assets/muttley_logo.svg"
import { HouseIcon, BookOpenIcon, UsersIcon, MedalIcon, MagnifyingGlassIcon, PlusIcon, GearIcon, SignOutIcon, SidebarIcon, SidebarSimpleIcon } from "@phosphor-icons/react"

const Sidebar = (props) => {

    const location = useLocation();
    const navigate = useNavigate();

    const navegarPara = (link) => {
        navigate(link)
    }

    const largura = window.innerWidth > 1200
    

    const [isExpanded, setIsExpanded] = useState(largura);

    const entradasMenu = [
        {"nome": "Home", "icone": <HouseIcon size={28} weight="light" />, "link": "/home"},
        {"nome": "Eventos e Palestras", "icone": <BookOpenIcon size={28} weight="light" />, "link": "/evento-palestra"},
        {"nome": "Alunos", "icone": <UsersIcon size={28} weight="light" />, "link": "/alunos"},
        {"nome": "Competências", "icone": <MedalIcon size={28} weight="light" />, "link": "/competencias"},
        {"nome": "Buscar", "icone": <MagnifyingGlassIcon size={28} weight="light" />, "link": "/busca"},
        {"nome": "Novo", "icone": <PlusIcon size={28} weight="light" />, "link": "/novo"},
    ]

    const entradasMenuBaixo = [
        {"nome": "Configurações", "icone": <GearIcon size={28} weight="light" />, "link": "/config"},
        {"nome": "Sair", "icone": <SignOutIcon size={28} weight="light" />, "link": "/", "danger": true}
    ]


    return (
        <div className={`${props.className}`}>
                <div className={`${isExpanded ? "w-80 min-w-80" : "w-23 min-w-23"} h-[95vh] min-h-175 bg-accent/40 text-primary m-5 rounded-3xl flex flex-col justify-between py-4 px-4 font-light transition-all duration-300`}>
                    {/* Top: Logo + collapse icon */}
                    <div className={isExpanded ? "" : "flex flex-col gap-15 justify-between"}>
                        <div className={`flex items-center justify-between mt-2 px-2 mb-6 ${isExpanded ? null : "flex-col gap-3"}`}>
                            <div className={`h-full w-44 transition-all duration-300 mask-[linear-gradient(to_right,black_var(--cut),transparent_var(--cut))] [-webkit-mask-image:linear-gradient(to_right,black_var(--cut),transparent_var(--cut))] ${isExpanded ? "min-w-44" : "translate-x-17"}`} style={{"--cut": isExpanded ? "100%" : "25%"}}>
                                <img src={MuttleyLogo} className="h-full w-full"/>
                            </div>
                            <button className="text-primary/60 hover:text-primary transition-colors cursor-pointer">
                                <SidebarSimpleIcon size={28} weight="light" onClick={() => setIsExpanded(!isExpanded)}/>
                            </button>
                        </div>
        
                        {/* Main nav */}
                        <nav className="flex flex-col font-secondary">
                            {entradasMenu.map((item) => {
                                const isActive = location.pathname.includes(item.link)
                                return (
                                    <button key={item.nome} onClick={() => navegarPara(item.link)} className={`flex items-center gap-3 px-4 py-2 h-15 rounded-2xl text-base transition-all cursor-pointer ${isActive ? "bg-accent/60 text-primary font-medium" : "text-primary/80 hover:bg-accent/20 font-light" }`}>
                                        <span className="shrink-0">{item.icone}</span>
                                        <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 ml-2 w-auto" : "opacity-0 ml-0 w-0"}`}> {item.nome} </span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
        
                    {/* Bottom nav */}
                    <nav className="flex flex-col gap-1">
                        {entradasMenuBaixo.map((item) => (
                            <a key={item.nome} href={item.link} className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-base transition-all ${item.danger ? "text-error hover:bg-error/10" : "text-primary/80 hover:bg-accent/20"}`}>
                                <span className="shrink-0">{item.icone}</span>
                                <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 ml-2 w-auto" : "opacity-0 ml-0 w-0"}`}> {item.nome} </span>
                            </a>
                        ))}
                    </nav>
                </div> 

        </div>
    )

}

export default Sidebar;

