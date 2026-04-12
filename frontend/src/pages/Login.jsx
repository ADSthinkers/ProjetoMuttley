import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Textura from "../assets/textura.webp"
import MuttleyLogo from "../assets/muttley_logo.svg"
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react";

const Login = () => {

    const navigate = useNavigate();

    const posLogin = () => {
        navigate("/");
    }

    const [isSenhaOpen, setIsSenhaOpen] = useState(true);

    return (
        <div className="relative">
            <img className="w-screen h-screen object-cover" src={Textura} alt="" />
            
            <div className="h-screen w-40/100 min-w-145 bg-base-100 absolute top-0 left-0 z-10 rounded-r-3xl">
                
                <form onSubmit={posLogin} className="absolute top-0 left-0 z-10 h-full w-full bg-base-100 rounded-r-3xl flex flex-col justify-between px-12 py-10">
 
                    {/* Logo */}
                    <div>
                        <img src={MuttleyLogo} alt="Logo do muttley" className="w-52" />
                    </div>
    
                    {/* Form area */}
                    <div className="flex flex-col gap-6 mb-8">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-5xl font-bold font-primary text-primary">Login</h1>
                            <p className="text-md font-secondary text-primary/60">Para continuar, precisamos que você faça login.</p>
                        </div>
    
                        {/* Divider */}
                        <div className="border-t border-primary/20 w-full" />
    
                            <div className="flex flex-col gap-3">
                                {/* Email field */}
                                <div className="flex flex-col font-secondary gap-1">
                                    <label htmlFor="email" className="text-sm font-medium text-primary">Email</label>
                                    <input required id="email" type="email" placeholder="Digite o email de login" className="w-full h-15 px-4 py-3 rounded-2xl bg-accent/20 border border-transparent focus:outline-none focus:border-accent placeholder:text-primary/30 text-sm text-primary transition-all "/>
                                </div>
            
                                {/* Password field */}
                                <div className="flex flex-col font-secondary gap-1">
                                    <label htmlFor="senha" className="text-sm font-medium text-primary">Senha</label>
                                    <div className="relative">
                                        <input required id="senha" type={isSenhaOpen ? "password" : "text"} placeholder="Digite a senha de login" className="w-full px-4 h-15 py-3 rounded-2xl bg-accent/20 border border-transparent focus:outline-none focus:border-accent placeholder:text-primary/30 text-sm text-primary transition-all" />
                                        <div className="text-primary/50 hover:text-primary absolute top-5 right-5 cursor-pointer" onClick={() => setIsSenhaOpen(!isSenhaOpen)}>
                                            { isSenhaOpen ? <EyeIcon size={24} weight="light" /> : <EyeClosedIcon size={24} weight="light" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                    {/* Footer: link + button */}
                    <div className="flex flex-col gap-3 items-center">
                        <a href="/"  className="text-sm text-primary/50 underline underline-offset-2 hover:text-primary transition-colors font-secondary">
                            Problemas ao fazer login?
                        </a>
                        <button className="w-full h-15 py-4 rounded-2xl bg-linear-to-br from-accent to-accent/80 text-primary font-light font-primary text-xl hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer">
                            Continuar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default Login;