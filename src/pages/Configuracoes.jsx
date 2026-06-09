import Sidebar from "../components/Sidebar";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getAuthUser } from "../utils/auth";
import { applyTheme, getInitialTheme, getResolvedTheme, saveTheme } from "../utils/theme";
import {
    CircleNotchIcon,
    DesktopIcon,
    EyeClosedIcon,
    EyeIcon,
    FloppyDiskIcon,
    MoonIcon,
    PencilSimpleIcon,
    PlusIcon,
    ShieldCheckIcon,
    SunIcon,
    TrashIcon,
    XIcon,
} from "@phosphor-icons/react";

const emptyAdmin = {
    id: null,
    login: "",
    senha: "",
    nome: "",
    cpf: "",
    email: "",
};

const acoesAuditoria = [
    "CRIADO",
    "ALTERADO",
    "DELETADO",
    "CHECK_IN",
    "PRESENCA_VALIDADA",
    "CERTIFICADO_EMITIDO",
    "MEDALHA_CONCEDIDA",
    "INSCRICAO_CRIADA",
    "INSCRICAO_CANCELADA",
    "STATUS_ATUALIZADO",
];

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
};

const apiErrorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.erro) return data.erro;
    if (data?.erros) return Object.values(data.erros).join(", ");
    return fallback;
};

const formatCpf = (value) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const Configuracoes = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;
    const authUser = getAuthUser();

    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            "Content-Type": "application/json",
            "x-api-key": dbKEY,
            "x-ator": authUser?.login || "admin",
            "Accept": "application/json",
        },
    }), [dbURL, dbKEY, authUser?.login]);

    const [theme, setTheme] = useState(getInitialTheme);
    const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(getInitialTheme()));
    const [admins, setAdmins] = useState([]);
    const [auditorias, setAuditorias] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [loadingAuditoria, setLoadingAuditoria] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adminForm, setAdminForm] = useState(emptyAdmin);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [filters, setFilters] = useState({ entidade: "", acao: "", realizadoPor: "" });

    useEffect(() => {
        applyTheme(theme);
        setResolvedTheme(getResolvedTheme(theme));
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!mediaQuery) return;

        const handleSystemThemeChange = () => {
            if (theme === "system") {
                applyTheme("system");
                setResolvedTheme(getResolvedTheme("system"));
            }
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);
        return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }, [theme]);

    const updateTheme = (nextTheme) => {
        setTheme(nextTheme);
        saveTheme(nextTheme);
        setResolvedTheme(getResolvedTheme(nextTheme));
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const response = await api.get("/admins");
            setAdmins(response.data);
        } catch (err) {
            toast.error(apiErrorMessage(err, "Não foi possível carregar os admins."));
        } finally {
            setLoadingAdmins(false);
        }
    };

    const fetchAuditoria = async () => {
        setLoadingAuditoria(true);
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => value)
            );
            const response = await api.get("/auditoria", { params });
            setAuditorias(response.data);
        } catch (err) {
            toast.error(apiErrorMessage(err, "Não foi possível carregar a auditoria."));
        } finally {
            setLoadingAuditoria(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [api]);

    useEffect(() => {
        fetchAuditoria();
    }, [api, filters]);

    const openCreate = () => {
        setAdminForm(emptyAdmin);
        setIsFormOpen(true);
        setShowPassword(false);
    };

    const openEdit = (admin) => {
        setAdminForm({ ...admin, cpf: formatCpf(admin.cpf || ""), senha: "" });
        setIsFormOpen(true);
        setShowPassword(false);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setAdminForm(emptyAdmin);
        setShowPassword(false);
    };

    const saveAdmin = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...adminForm };
            if (payload.id && !payload.senha) delete payload.senha;

            if (payload.id) {
                await api.put(`/admins/${payload.id}`, payload);
                toast.success("Admin atualizado.");
            } else {
                await api.post("/admins", payload);
                toast.success("Admin criado.");
            }

            closeForm();
            fetchAdmins();
            fetchAuditoria();
        } catch (err) {
            toast.error(apiErrorMessage(err, "Não foi possível salvar o admin."));
        } finally {
            setSaving(false);
        }
    };

    const deleteAdmin = async (admin) => {
        if (!window.confirm(`Excluir o admin ${admin.nome}?`)) return;

        try {
            await api.delete(`/admins/${admin.id}`);
            toast.success("Admin excluído.");
            fetchAdmins();
            fetchAuditoria();
        } catch (err) {
            toast.error(apiErrorMessage(err, "Não foi possível excluir o admin."));
        }
    };

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex bg-base-100 min-h-screen overflow-hidden">
                <Sidebar className="shrink-0" />
                <div className="pt-10 pl-5 pr-8 pb-8 w-full h-screen overflow-y-auto flex flex-col gap-8">
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Configurações</h1>
                            <p className="font-secondary text-primary/50 mt-2">Controles administrativos e auditoria do sistema.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-accent/30 rounded-2xl p-1 w-fit">
                            <button
                                onClick={() => updateTheme("system")}
                                className={`flex items-center gap-2 h-11 px-4 rounded-xl font-secondary text-sm transition-all cursor-pointer ${theme === "system" ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}
                                title={`Usando modo ${resolvedTheme === "dark" ? "escuro" : "claro"} do computador`}
                            >
                                <DesktopIcon size={18} weight="light" />
                                Sistema
                            </button>
                            <button
                                onClick={() => updateTheme("light")}
                                className={`flex items-center gap-2 h-11 px-4 rounded-xl font-secondary text-sm transition-all cursor-pointer ${theme === "light" ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}
                            >
                                <SunIcon size={18} weight="light" />
                                Claro
                            </button>
                            <button
                                onClick={() => updateTheme("dark")}
                                className={`flex items-center gap-2 h-11 px-4 rounded-xl font-secondary text-sm transition-all cursor-pointer ${theme === "dark" ? "bg-accent text-primary shadow-sm" : "text-primary/70 hover:text-primary"}`}
                            >
                                <MoonIcon size={18} weight="light" />
                                Escuro
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 2xl:grid-cols-[minmax(420px,0.8fr)_1.4fr] gap-8"
                    >
                        <motion.section variants={itemVariants} className="bg-accent/40 rounded-3xl border border-accent/10 shadow-sm p-6 flex flex-col gap-5 min-h-[520px]">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary">
                                        <ShieldCheckIcon size={26} weight="light" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-primary text-primary font-light">Admins</h2>
                                        <p className="font-secondary text-sm text-primary/50">{admins.length} cadastrados</p>
                                    </div>
                                </div>
                                <button onClick={openCreate} className="btn bg-accent text-primary border-0 hover:bg-accent/80 rounded-2xl font-secondary shadow-sm shadow-primary/5">
                                    <PlusIcon size={18} />
                                    Novo
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isFormOpen && (
                                    <motion.form
                                        key="admin-form"
                                        initial={{ opacity: 0, y: -12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        onSubmit={saveAdmin}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-base-100/80 rounded-3xl p-4 border border-accent/20"
                                    >
                                        {[
                                            ["nome", "Nome", "text"],
                                            ["login", "Login", "text"],
                                            ["email", "E-mail", "email"],
                                            ["cpf", "CPF", "text"],
                                        ].map(([field, label, type]) => (
                                            <label key={field}>
                                                <span className="text-xs font-secondary text-primary/60">{label}</span>
                                                <input
                                                    required
                                                    type={type}
                                                    inputMode={field === "cpf" ? "numeric" : undefined}
                                                    maxLength={field === "cpf" ? 14 : undefined}
                                                    value={adminForm[field] || ""}
                                                    onChange={(event) => {
                                                        const value = field === "cpf" ? formatCpf(event.target.value) : event.target.value;
                                                        setAdminForm((current) => ({ ...current, [field]: value }));
                                                    }}
                                                    className="input w-full h-12 rounded-2xl bg-accent/20 border-accent/40 focus:outline-none focus:border-accent text-primary placeholder:text-primary/30"
                                                />
                                            </label>
                                        ))}
                                        <label className="md:col-span-2">
                                            <span className="text-xs font-secondary text-primary/60">{adminForm.id ? "Nova senha" : "Senha"}</span>
                                            <div className="relative">
                                                <input
                                                    required={!adminForm.id}
                                                    type={showPassword ? "text" : "password"}
                                                    value={adminForm.senha || ""}
                                                    onChange={(event) => setAdminForm((current) => ({ ...current, senha: event.target.value }))}
                                                    className="input w-full h-12 pr-12 rounded-2xl bg-accent/20 border-accent/40 focus:outline-none focus:border-accent text-primary placeholder:text-primary/30"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((current) => !current)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    {showPassword ? <EyeClosedIcon size={22} weight="light" /> : <EyeIcon size={22} weight="light" />}
                                                </button>
                                            </div>
                                        </label>
                                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                                            <button type="button" onClick={closeForm} className="btn btn-ghost rounded-2xl text-primary/70 font-secondary">
                                                <XIcon size={18} />
                                                Cancelar
                                            </button>
                                            <button disabled={saving} className="btn bg-accent border-0 text-primary hover:bg-accent/80 rounded-2xl font-secondary">
                                                {saving ? <CircleNotchIcon size={18} className="animate-spin" /> : <FloppyDiskIcon size={18} />}
                                                Salvar
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                                {loadingAdmins ? (
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="h-24 bg-accent/30 animate-pulse rounded-3xl" />
                                    ))
                                ) : admins.length > 0 ? admins.map((admin) => (
                                    <motion.div
                                        key={admin.id}
                                        whileHover={{ y: -2, scale: 1.005 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-base-100/75 rounded-3xl border border-accent/20 p-4 flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-accent/70 flex items-center justify-center text-primary font-primary text-lg font-bold shrink-0">
                                            {(admin.nome || admin.login || "A").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <h3 className="font-primary text-primary font-bold truncate">{admin.nome}</h3>
                                                <span className="badge bg-accent/70 border-0 text-primary rounded-xl shrink-0">ADMIN</span>
                                            </div>
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-1 mt-2 font-secondary text-sm text-primary/55">
                                                <span className="truncate">@{admin.login}</span>
                                                <span className="truncate">{admin.email}</span>
                                                <span className="truncate">CPF {admin.cpf}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => openEdit(admin)} className="btn btn-sm bg-accent/70 border-0 hover:bg-accent rounded-xl text-primary">
                                                <PencilSimpleIcon size={16} />
                                            </button>
                                            <button onClick={() => deleteAdmin(admin)} className="btn btn-sm bg-error/10 border-0 hover:bg-error/20 rounded-xl text-error">
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center text-primary/40 py-12 font-secondary bg-base-100/50 rounded-3xl">Nenhum admin cadastrado.</div>
                                )}
                            </div>
                        </motion.section>

                        <motion.section variants={itemVariants} className="bg-accent/40 rounded-3xl border border-accent/10 shadow-sm p-6 flex flex-col gap-5 min-w-0 min-h-[520px]">
                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-primary text-primary font-light">Auditoria</h2>
                                    <p className="font-secondary text-sm text-primary/50">Log com filtros por entidade, ação e ator.</p>
                                </div>
                                <div className="bg-base-100/70 border border-accent/20 rounded-2xl px-4 py-3 font-secondary text-sm text-primary/60 w-fit">
                                    <span className="font-bold text-primary">{auditorias.length}</span> registros
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-base-100/55 border border-accent/20 rounded-3xl p-3">
                                <input
                                    value={filters.entidade}
                                    onChange={(event) => setFilters((current) => ({ ...current, entidade: event.target.value }))}
                                    placeholder="Entidade"
                                    className="input h-12 rounded-2xl bg-accent/15 border-accent/30 text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent"
                                />
                                <select
                                    value={filters.acao}
                                    onChange={(event) => setFilters((current) => ({ ...current, acao: event.target.value }))}
                                    className="select h-12 rounded-2xl bg-accent/15 border-accent/30 text-primary focus:outline-none focus:border-accent"
                                >
                                    <option value="">Todas as ações</option>
                                    {acoesAuditoria.map((acao) => <option key={acao} value={acao}>{acao}</option>)}
                                </select>
                                <input
                                    value={filters.realizadoPor}
                                    onChange={(event) => setFilters((current) => ({ ...current, realizadoPor: event.target.value }))}
                                    placeholder="Ator"
                                    className="input h-12 rounded-2xl bg-accent/15 border-accent/30 text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="grid grid-cols-[150px_150px_160px_1fr] gap-3 px-4 font-secondary text-xs uppercase text-primary/45 min-w-[760px]">
                                <span>Data</span>
                                <span>Entidade</span>
                                <span>Ator</span>
                                <span>Descrição</span>
                            </div>

                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 min-w-0">
                                {loadingAuditoria ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="h-20 bg-accent/30 animate-pulse rounded-3xl" />
                                    ))
                                ) : auditorias.length > 0 ? auditorias.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ y: -2, scale: 1.002 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 lg:grid-cols-[150px_150px_160px_1fr] gap-3 bg-base-100/75 rounded-3xl border border-accent/20 p-4 font-secondary text-sm text-primary items-start"
                                    >
                                        <div className="flex flex-col">
                                            <span className="lg:hidden text-xs uppercase text-primary/40">Data</span>
                                            <span className="whitespace-nowrap">{formatDateTime(item.dataHora)}</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="lg:hidden text-xs uppercase text-primary/40">Entidade</span>
                                            <span className="font-medium">{item.entidade}{item.entidadeId ? ` #${item.entidadeId}` : ""}</span>
                                            <span className="badge bg-accent/70 border-0 text-primary rounded-xl w-fit">{item.acao}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="lg:hidden text-xs uppercase text-primary/40">Ator</span>
                                            <span className="truncate">{item.realizadoPor || "-"}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="lg:hidden text-xs uppercase text-primary/40">Descrição</span>
                                            <span className="text-primary/65 leading-snug">{item.descricao || "-"}</span>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center text-primary/40 py-12 font-secondary bg-base-100/50 rounded-3xl">Nenhum registro encontrado.</div>
                                )}
                            </div>
                        </motion.section>
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Configuracoes;
