import { useState } from "react";

const LocalForm = ({ setObjeto, setEtapa }) => {
    const [nome, setNome] = useState("");
    const [capacidade, setCapacidade] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            nome: nome,
            capacidade: capacidade
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-5 -mt-5 min-h-[68vh]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Nome do Local*</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        placeholder="Ex: Auditório Principal" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Capacidade*</label>
                    <input 
                        required 
                        type="number" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        placeholder="Ex: 100" 
                        value={capacidade} 
                        onChange={(e) => setCapacidade(e.target.value)} 
                    />
                </div>
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer">
                Finalizar
            </button>
        </form>
    );
};

export default LocalForm;
