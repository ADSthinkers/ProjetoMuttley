import { useState } from "react";

const CompetenciaForm = ({ setObjeto, setEtapa }) => {
    const [nome, setNome] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            nome: nome
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-5 -mt-5 min-h-[68vh]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Nome da Competência*</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        placeholder="Ex: Scrum, UX Design..." 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                    />
                </div>
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer shadow-lg shadow-accent/10">
                Revisar
            </button>
        </form>
    );
};

export default CompetenciaForm;
