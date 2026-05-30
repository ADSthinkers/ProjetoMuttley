import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, PencilSimpleIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';

const tiposCompetencia = [
    { value: "HARD_SKILL", label: "Hard Skill" },
    { value: "SOFT_SKILL", label: "Soft Skill" }
];

const formatarTipo = (tipo) => tiposCompetencia.find((t) => t.value === tipo)?.label || "Sem tipo";

const getApiErrorMessage = (err) => {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (data?.erro) return data.erro;
    if (data?.message) return data.message;
    return "Não foi possível concluir a operação.";
};

const Competencias = () => {
    const dbURL = import.meta.env.VITE_DB_API_URL;
    const dbKEY = import.meta.env.VITE_DB_API_KEY;

    // useMemo evita recriar a instância do axios em cada render
    const api = useMemo(() => axios.create({
        baseURL: dbURL,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': dbKEY,
            'Accept': 'application/json',
        }
    }), [dbURL, dbKEY]);

    const [competencias, setCompetencias] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [competenciaEditando, setCompetenciaEditando] = useState(null);
    const [competenciaExcluindo, setCompetenciaExcluindo] = useState(null);
    const [form, setForm] = useState({ nome: "", tipo: "" });

    const fetchData = async () => {
        if (!dbURL || !dbKEY) {
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('/competencias');
            setCompetencias(response.data);
            setError(null);
        } catch (error) {
            console.error("Erro ao buscar dados", error);
            setError("Não foi possível resgatar os dados. Verifique sua conexão ou tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [api]);

    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")
 
    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Mais atribuídas", "Menos atribuídas"]
 
    const competenciasFiltradas = (competencias || [])
        .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.nome.localeCompare(b.nome)
            if (ordenar === "Nome (Z-A)") return b.nome.localeCompare(a.nome)
            // Para as outras ordens, precisaria do campo 'atribuida' vindo da API. 
            // Como a entidade Competencia só tem 'id' e 'nome', vou manter o padrão ou ignorar.
            return 0
        })

    const abrirEdicao = (competencia) => {
        setCompetenciaEditando(competencia);
        setForm({ nome: competencia.nome || "", tipo: competencia.tipo || "" });
    };

    const salvarEdicao = async (e) => {
        e.preventDefault();
        if (!competenciaEditando) return;

        setSaving(true);
        try {
            const response = await api.put(`/competencias/${competenciaEditando.id}`, {
                nome: form.nome,
                tipo: form.tipo || null
            });

            setCompetencias((current) => (current || []).map((competencia) => (
                competencia.id === competenciaEditando.id ? response.data : competencia
            )));
            setCompetenciaEditando(null);
            toast.success("Competência atualizada.");
        } catch (err) {
            console.error("Erro ao atualizar competência:", err);
            toast.error(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const confirmarExclusao = async () => {
        if (!competenciaExcluindo) return;

        setDeleting(true);
        try {
            await api.delete(`/competencias/${competenciaExcluindo.id}`);
            setCompetencias((current) => (current || []).filter((competencia) => competencia.id !== competenciaExcluindo.id));
            setCompetenciaExcluindo(null);
            toast.success("Competência excluída.");
        } catch (err) {
            console.error("Erro ao excluir competência:", err);
            toast.error(getApiErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <PageTransition>
            <Toaster position="top-center" reverseOrder={false} />
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
                        {loading ? (
                            // Skeleton Loading
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-accent/10 animate-pulse rounded-2xl px-6 py-5 min-w-48 h-20" />
                            ))
                        ) : error ? (
                            // Mensagem de Erro
                            <motion.div variants={itemVariants} className="text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20 w-full">
                                {error}
                            </motion.div>
                        ) : competenciasFiltradas.length > 0 ? (
                            competenciasFiltradas.map((c, index) => (
                                <motion.div 
                                    key={c.id || index} 
                                    variants={itemVariants}
                                    whileHover={{ y: -4, backgroundColor: "rgba(252, 209, 96, 0.7)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-accent/50 rounded-2xl px-6 py-5 flex items-start justify-between gap-5 min-w-64 transition-all group cursor-default border border-primary/5"
                                >
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <span className="text-base font-primary font-bold text-primary tracking-wide">
                                            {c.nome}
                                        </span>
                                        <span className="badge badge-sm badge-outline border-primary/20 text-primary/60 font-secondary">
                                            {formatarTipo(c.tipo)}
                                        </span>
                                        {c.atribuida !== undefined && (
                                            <span className="text-xs font-secondary text-primary/60 underline underline-offset-2 decoration-primary/20 group-hover:decoration-primary/60 transition-colors">
                                                Atribuído a {c.atribuida} palestras
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => abrirEdicao(c)}
                                            className="btn btn-sm btn-circle border-0 bg-base-100/50 hover:bg-base-100 text-primary shadow-none"
                                            title="Editar competência"
                                        >
                                            <PencilSimpleIcon size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCompetenciaExcluindo(c)}
                                            className="btn btn-sm btn-circle border-0 bg-error/10 hover:bg-error/20 text-error shadow-none"
                                            title="Excluir competência"
                                        >
                                            <TrashSimpleIcon size={17} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div variants={itemVariants} className="text-sm font-secondary text-primary/40 py-8 text-center w-full">
                                Nenhuma competência encontrada.
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            {competenciaEditando && (
                <div className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCompetenciaEditando(null)}>
                    <form className="bg-base-100 rounded-3xl p-7 max-w-md w-full flex flex-col gap-5 shadow-xl" onSubmit={salvarEdicao} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-primary font-bold text-primary">Editar competência</h2>
                                <p className="text-sm font-secondary text-primary/60">A edição não altera as associações existentes.</p>
                            </div>
                            <button type="button" className="btn btn-sm btn-circle border-0 bg-accent/30 text-primary" onClick={() => setCompetenciaEditando(null)}>
                                <XIcon size={18} />
                            </button>
                        </div>

                        <Field label="Nome*">
                            <input
                                required
                                type="text"
                                className={inputClass}
                                value={form.nome}
                                onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
                            />
                        </Field>

                        <Field label="Tipo">
                            <select
                                className={inputClass}
                                value={form.tipo}
                                onChange={(e) => setForm((current) => ({ ...current, tipo: e.target.value }))}
                            >
                                <option value="">Sem tipo</option>
                                {tiposCompetencia.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                ))}
                            </select>
                        </Field>

                        <button disabled={saving} className="btn border-0 rounded-xl bg-accent hover:bg-accent/80 text-primary font-secondary">
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </form>
                </div>
            )}

            {competenciaExcluindo && (
                <div className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCompetenciaExcluindo(null)}>
                    <div className="bg-base-100 rounded-3xl p-7 max-w-md w-full flex flex-col gap-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                            <TrashSimpleIcon size={32} weight="fill" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-primary font-bold text-primary">Excluir competência?</h2>
                            <p className="text-sm font-secondary text-primary/60 mt-1">
                                A competência <span className="font-bold text-primary">"{competenciaExcluindo.nome}"</span> só será removida se não estiver associada a nenhuma palestra.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="btn border-0 rounded-xl bg-accent/20 text-primary font-secondary" onClick={() => setCompetenciaExcluindo(null)}>
                                Cancelar
                            </button>
                            <button type="button" disabled={deleting} className="btn border-0 rounded-xl bg-error hover:bg-error/80 text-secondary font-secondary" onClick={confirmarExclusao}>
                                {deleting ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    )
}

const inputClass = "w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 outline-none focus:border-accent";

const Field = ({ label, children }) => (
    <label className="flex flex-col gap-2">
        <span className="text-sm font-secondary text-primary font-semibold">{label}</span>
        {children}
    </label>
);

export default Competencias;
