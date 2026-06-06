import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { PlusCircleIcon, XIcon } from "@phosphor-icons/react";

const ADD_CATEGORY_OPTION = {
    value: "__add_category__",
    label: "Adicionar nova categoria",
    isAddAction: true
};

const getCategoriaLabel = (categoria) => (
    categoria?.nome ||
    categoria?.label ||
    (categoria?.id ? `Categoria #${categoria.id}` : "Categoria")
);

const CategoriaEventoSelect = ({ api, value, onChange, onCategoriesChange, classNames, placeholder = "Selecione uma categoria" }) => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeCategoria, setNomeCategoria] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get("/categorias-evento");
                setCategorias(response.data);
                onCategoriesChange?.(response.data);
            } catch (error) {
                console.error("Erro ao buscar categorias de evento:", error);
                toast.error("Não foi possível carregar as categorias.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, [api, onCategoriesChange]);

    const options = useMemo(() => [
        ADD_CATEGORY_OPTION,
        ...categorias.map((categoria) => ({
            value: categoria.id,
            label: getCategoriaLabel(categoria)
        }))
    ], [categorias]);

    const selectedOption = options.find((option) => option.value === value && !option.isAddAction) || null;

    const handleChange = (selectedOption) => {
        if (selectedOption?.isAddAction) {
            setModalAberto(true);
            return;
        }

        onChange(selectedOption ? selectedOption.value : "");
    };

    const handleSalvarCategoria = async () => {
        const nome = nomeCategoria.trim();
        if (!nome) return;

        setSalvando(true);
        try {
            const response = await api.post("/categorias-evento", { nome });
            const novaCategoria = response.data;
            const categoriasAtualizadas = [...categorias, novaCategoria];

            setCategorias(categoriasAtualizadas);
            onCategoriesChange?.(categoriasAtualizadas);
            onChange(novaCategoria.id);
            setNomeCategoria("");
            setModalAberto(false);
            toast.success("Categoria adicionada.");
        } catch (error) {
            console.error("Erro ao criar categoria de evento:", error);
            const mensagem = error.response?.data?.message || error.response?.data?.error || "Não foi possível adicionar a categoria.";
            toast.error(mensagem);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <>
            <Select
                isLoading={loading}
                options={options}
                value={selectedOption}
                unstyled
                isClearable
                onChange={handleChange}
                placeholder={placeholder}
                formatOptionLabel={(option) => (
                    <span className={`flex items-center gap-2 ${option.isAddAction ? "font-semibold" : ""}`}>
                        {option.isAddAction && <PlusCircleIcon size={18} weight="fill" />}
                        {option.label}
                    </span>
                )}
                classNames={classNames}
            />

            {modalAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/25 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md bg-base-100 border border-accent/20 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-primary font-bold text-primary">Nova categoria</h2>
                                <p className="text-sm font-secondary text-primary/55 mt-1">Informe o nome para salvar na API.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                className="w-10 h-10 rounded-xl bg-accent/25 hover:bg-accent/40 text-primary flex items-center justify-center cursor-pointer"
                                title="Fechar"
                            >
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-secondary text-primary font-semibold">Nome da categoria*</label>
                            <input
                                required
                                autoFocus
                                type="text"
                                className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80"
                                placeholder="Ex: Semana acadêmica"
                                value={nomeCategoria}
                                onChange={(event) => setNomeCategoria(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        handleSalvarCategoria();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setModalAberto(false)}
                                className="flex-1 text-sm font-secondary py-4 rounded-xl text-primary/65 hover:bg-accent/20 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={salvando || !nomeCategoria.trim()}
                                onClick={handleSalvarCategoria}
                                className="flex-1 text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {salvando ? "Salvando..." : "Adicionar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoriaEventoSelect;
