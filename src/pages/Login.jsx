import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Textura from "../assets/textura.webp";
import MuttleyLogo from "../assets/muttley_logo.svg";
import { CircleNotchIcon, EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { setAuthCookie } from "../utils/auth";

const Login = () => {
    const navigate = useNavigate();
    const dbURL = import.meta.env.VITE_DB_API_URL;

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [isSenhaOpen, setIsSenhaOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const posLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${dbURL}/auth/login`, { login, senha }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            setAuthCookie(JSON.stringify({
                login: response.data.login,
                role: response.data.role,
                loggedAt: Date.now()
            }));
            navigate("/home", { replace: true });
        } catch (err) {
            console.error("Erro ao fazer login:", err);
            setError("Não foi possível autenticar. Confira login e senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-base-100">
            <img className="fixed inset-0 w-screen h-screen object-cover" src={Textura} alt="" />

            <div className="min-h-screen w-full lg:w-[45%] xl:w-[42%] lg:min-w-[620px] bg-base-100 relative z-10 rounded-r-[40px] shadow-2xl shadow-primary/10">
                <form onSubmit={posLogin} className="min-h-screen w-full bg-base-100 rounded-r-[40px] flex flex-col justify-between px-8 sm:px-12 py-10">
                    <div>
                        <img src={MuttleyLogo} alt="Logo do muttley" className="w-52" />
                    </div>

                    <div className="flex flex-col gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-5xl font-bold font-primary text-primary">Login</h1>
                            <p className="text-md font-secondary text-primary/60">Para continuar, precisamos que você faça login.</p>
                        </div>

                        <div className="border-t border-primary/25 w-full" />

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col font-secondary gap-2">
                                <label htmlFor="login" className="text-sm font-medium text-primary">Login</label>
                                <input
                                    required
                                    id="login"
                                    type="text"
                                    placeholder="Digite seu login ou e-mail"
                                    value={login}
                                    onChange={(event) => setLogin(event.target.value)}
                                    className="w-full h-15 px-6 py-3 rounded-2xl bg-accent/20 border border-accent/40 focus:outline-none focus:border-accent placeholder:text-primary/30 text-sm text-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col font-secondary gap-2">
                                <label htmlFor="senha" className="text-sm font-medium text-primary">Senha</label>
                                <div className="relative">
                                    <input
                                        required
                                        id="senha"
                                        type={isSenhaOpen ? "password" : "text"}
                                        placeholder="Digite sua senha"
                                        value={senha}
                                        onChange={(event) => setSenha(event.target.value)}
                                        className="w-full px-6 h-15 py-3 pr-14 rounded-2xl bg-accent/20 border border-accent/40 focus:outline-none focus:border-accent placeholder:text-primary/30 text-sm text-primary transition-all"
                                    />
                                    <button type="button" className="text-primary/50 hover:text-primary absolute top-1/2 -translate-y-1/2 right-5 cursor-pointer" onClick={() => setIsSenhaOpen(!isSenhaOpen)}>
                                        {isSenhaOpen ? <EyeIcon size={24} weight="light" /> : <EyeClosedIcon size={24} weight="light" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-secondary text-error">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 items-center">
                        <a href="/" className="text-sm text-primary/50 underline underline-offset-2 hover:text-primary transition-colors font-secondary">
                            Problemas ao fazer login?
                        </a>
                        <button disabled={loading} className="w-full h-15 py-4 rounded-2xl bg-linear-to-br from-accent to-accent/80 text-primary font-light font-primary text-xl hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center">
                            {loading ? <CircleNotchIcon size={24} className="animate-spin" /> : "Continuar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
