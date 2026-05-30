import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import MuttleyLogo from "../assets/muttley_logo.svg"
import MuttleyLogoRed from "../assets/muttley_logo_red.svg"
import { motion, AnimatePresence } from "framer-motion"
import { HouseIcon, BookOpenIcon, UsersIcon, MedalIcon, MagnifyingGlassIcon, PlusIcon, GearIcon, SignOutIcon, SidebarSimpleIcon, UserIcon, MicrophoneStageIcon, MapPinIcon, BuildingsIcon } from "@phosphor-icons/react"
import { clearAuthCookie, isAdmin } from "../utils/auth";

const Sidebar = ({ className, compact }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const largura = window.innerWidth > 1200
    const [isExpanded, setIsExpanded] = useState(compact ? false : largura);

    const navegarPara = (link) => {
        if (link === "/logout") {
            clearAuthCookie();
            navigate("/");
            return;
        }
        navigate(link)
    }

    const entradasMenu = [
        {"nome": "Home", "icone": <HouseIcon size={28} weight="light" />, "link": "/home"},
        {"nome": "Eventos e Palestras", "icone": <BookOpenIcon size={28} weight="light" />, "link": "/evento-palestra"},
        {"nome": "Participantes", "icone": <UsersIcon size={28} weight="light" />, "link": "/participantes"},
        {"nome": "Palestrantes", "icone": <MicrophoneStageIcon size={28} weight="light" />, "link": "/palestrantes"},
        {"nome": "Locais", "icone": <MapPinIcon size={28} weight="light" />, "link": "/locais"},
        {"nome": "Patrocinadores", "icone": <BuildingsIcon size={28} weight="light" />, "link": "/patrocinadores"},
        {"nome": "Competências", "icone": <MedalIcon size={28} weight="light" />, "link": "/competencias"},
        {"nome": "Buscar", "icone": <MagnifyingGlassIcon size={28} weight="light" />, "link": "/buscar"},
        {"nome": "Meu Perfil", "icone": <UserIcon size={28} weight="light" />, "link": "/perfil"},
        {"nome": "Novo", "icone": <PlusIcon size={28} weight="light" />, "link": "/novo"},
    ]

    const entradasMenuBaixo = [
        {"nome": "Configurações", "icone": <GearIcon size={28} weight="light" />, "link": "/config"},
        {"nome": "Sair", "icone": <SignOutIcon size={28} weight="light" />, "link": "/logout", "danger": true}
    ].filter((item) => item.link !== "/config" || isAdmin())

    return (
        <motion.div 
            initial={false}
            animate={{ width: isExpanded ? 320 : 92 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`h-[95vh] min-h-175 bg-accent/40 text-primary m-5 rounded-3xl flex flex-col justify-between py-4 px-4 font-light overflow-hidden shadow-xl shadow-primary/5 ${className}`}
        >
            {/* Top: Logo + collapse icon */}
            <div>
                <div className={`flex items-center justify-between mt-2 px-2 mb-6 ${isExpanded ? "" : "flex-col gap-6"}`}>
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.div 
                                key="logo-expanded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="w-44"
                            >
                                <img src={MuttleyLogo} className="h-full w-full" alt="Muttley Logo" />
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="logo-collapsed"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                            >
                                <img src={MuttleyLogoRed} className="h-full w-full" alt="Muttley Logo" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-primary/60 hover:text-primary transition-colors cursor-pointer p-1 hover:bg-accent/20 rounded-lg"
                    >
                        <SidebarSimpleIcon size={28} weight="light" />
                    </button>
                </div>

                {/* Main nav */}
                <nav className="flex flex-col gap-1 font-secondary">
                    {entradasMenu.map((item) => {
                        const isActive = item.link === "/" ? location.pathname === "/" : location.pathname.includes(item.link)

                        return (
                            <button 
                                key={item.nome} 
                                onClick={() => navegarPara(item.link)} 
                                className={`flex items-center gap-3 px-4 py-3 h-14 rounded-2xl text-base transition-all cursor-pointer relative group ${isActive ? "bg-accent/60 text-primary font-bold" : "text-primary/80 hover:bg-accent/20 font-light" }`}
                            >
                                <span className="shrink-0">{item.icone}</span>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="whitespace-nowrap ml-2"
                                        > 
                                            {item.nome} 
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {!isExpanded && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-primary text-accent text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                                        {item.nome}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom nav */}
            <nav className="flex flex-col gap-1">
                {entradasMenuBaixo.map((item) => (
                    <button 
                        key={item.nome} 
                        onClick={() => navegarPara(item.link)}
                        className={`flex items-center gap-4 px-4 py-3 h-14 rounded-2xl text-base transition-all relative group ${item.danger ? "text-error hover:bg-error/10" : "text-primary/80 hover:bg-accent/20"}`}
                    >
                        <span className="shrink-0">{item.icone}</span>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="whitespace-nowrap ml-2"
                                > 
                                    {item.nome} 
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                ))}
            </nav>
        </motion.div> 
    )
}

export default Sidebar;
