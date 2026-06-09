import Sidebar from "../components/Sidebar";
import { useState, useEffect, useMemo } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, MedalIcon, PencilSimpleIcon, SparkleIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import PageTransition, { containerVariants, itemVariants } from "../components/PageTransition"
import { motion } from "framer-motion"
import axios from 'axios';

const tiposCompetencia = [
    { value: "HARD_SKILL", label: "Hard Skill" },
    { value: "SOFT_SKILL", label: "Soft Skill" }
];

const formatarTipo = (tipo) => tiposCompetencia.find((t) => t.value === tipo)?.label || "Sem tipo";
const formatarHorasEvolucao = (horas) => `${Number(horas || 5)}h por nível`;

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
    const [form, setForm] = useState({ nome: "", tipo: "", horasParaEvoluir: "5" });

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
        setForm({
            nome: competencia.nome || "",
            tipo: competencia.tipo || "",
            horasParaEvoluir: String(competencia.horasParaEvoluir || 5)
        });
    };

    const salvarEdicao = async (e) => {
        e.preventDefault();
        if (!competenciaEditando) return;

        setSaving(true);
        try {
            const response = await api.put(`/competencias/${competenciaEditando.id}`, {
                nome: form.nome,
                tipo: form.tipo || null,
                horasParaEvoluir: Number(form.horasParaEvoluir) || 5
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
                <div className="pt-8 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/25 rounded-full px-4 py-2 font-secondary text-xs font-semibold text-primary mb-3">
                                <SparkleIcon size={16} weight="fill" />
                                Matriz de habilidades
                            </div>
                            <h1 className="text-4xl font-primary text-primary font-bold">Competências</h1>
                            <p className="text-sm font-secondary text-primary/55 mt-2">Organize habilidades usadas em palestras, certificados e medalhas.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full xl:w-auto">
                            <MetricCard icon={<MedalIcon size={20} />} label="Exibindo" value={competenciasFiltradas.length} />
                            <MetricCard icon={<MedalIcon size={20} />} label="Hard" value={(competencias || []).filter((c) => c.tipo === "HARD_SKILL").length} />
                            <MetricCard icon={<MedalIcon size={20} />} label="Soft" value={(competencias || []).filter((c) => c.tipo === "SOFT_SKILL").length} />
                        </div>
                    </motion.div>

                    {/* Busca + Ordenar */}
                    <motion.div variants={itemVariants} className="bg-accent/20 border border-accent/10 rounded-3xl p-4 flex flex-col gap-3">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex items-center gap-3 flex-1 bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 h-15 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome de competência" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/35 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>
    
                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-base-100/65 border border-accent/10 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-full lg:min-w-70 h-full hover:bg-accent/20 transition-colors">
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
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
                    >
                        {loading ? (
                            // Skeleton Loading
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-accent/10 animate-pulse rounded-3xl h-44" />
                            ))
                        ) : error ? (
                            // Mensagem de Erro
                            <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-3 2xl:col-span-4 text-sm font-secondary text-error py-12 text-center bg-error/5 rounded-3xl border border-dashed border-error/20 w-full">
                                {error}
                            </motion.div>
                        ) : competenciasFiltradas.length > 0 ? (
                            competenciasFiltradas.map((c, index) => (
                                <motion.div 
                                    key={c.id || index} 
                                    variants={itemVariants}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative overflow-hidden bg-accent/25 hover:bg-accent/35 rounded-3xl p-5 flex flex-col justify-between gap-5 min-h-44 transition-all group cursor-default border border-accent/15"
                                >
                                    <div className="absolute right-0 top-0 w-20 h-20 bg-accent/20 rounded-bl-[36px]" />
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/50 text-primary flex items-center justify-center border border-accent/20 mb-1">
                                            <MedalIcon size={24} weight="light" />
                                        </div>
                                        <span className="text-xl font-primary font-bold text-primary leading-tight">
                                            {c.nome}
                                        </span>
                                        <span className="badge bg-accent/60 border-0 text-primary rounded-xl font-secondary w-fit">
                                            {formatarTipo(c.tipo)}
                                        </span>
                                        <span className="badge bg-base-100/60 border-0 text-primary rounded-xl font-secondary w-fit">
                                            {formatarHorasEvolucao(c.horasParaEvoluir)}
                                        </span>
                                        {c.atribuida !== undefined && (
                                            <span className="text-xs font-secondary text-primary/60 underline underline-offset-2 decoration-primary/20 group-hover:decoration-primary/60 transition-colors">
                                                Atribuído a {c.atribuida} palestras
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 shrink-0 border-t border-primary/10 pt-4">
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
                            <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-3 2xl:col-span-4 text-sm font-secondary text-primary/40 py-12 text-center bg-accent/5 border border-dashed border-accent/20 rounded-3xl w-full">
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

                        <Field label="Horas para evoluir de nível*">
                            <input
                                required
                                min="1"
                                step="1"
                                type="number"
                                className={inputClass}
                                value={form.horasParaEvoluir}
                                onChange={(e) => setForm((current) => ({ ...current, horasParaEvoluir: e.target.value }))}
                            />
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

const MetricCard = ({ icon, label, value }) => (
    <div className="bg-accent/20 border border-accent/10 rounded-2xl px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 text-primary/55">
            {icon}
            <span className="text-xs font-secondary uppercase truncate">{label}</span>
        </div>
        <p className="text-2xl font-primary font-bold text-primary mt-1">{value}</p>
    </div>
);

const Field = ({ label, children }) => (
    <label className="flex flex-col gap-2">
        <span className="text-sm font-secondary text-primary font-semibold">{label}</span>
        {children}
    </label>
);

export default Competencias;
