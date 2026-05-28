import { useState } from "react";
import Select from 'react-select';

const EventoForm = ({ setObjeto, setEtapa }) => {
    const [titulo, setTitulo] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [local, setLocal] = useState("");

    // Mock de locais
    const locaisDisponiveis = [
        { value: "1", label: "Auditório Principal" },
        { value: "2", label: "Laboratório 1" },
        { value: "3", label: "Sala de Reuniões" }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setObjeto({
            titulo: titulo,
            dataInicio: dataInicio,
            local: local
        });
        setEtapa(3);
    };

    return (
        <form className="flex flex-col gap-5 -mt-5 min-h-[68vh]" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Título do Evento*</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        placeholder="Nome do evento" 
                        value={titulo} 
                        onChange={(e) => setTitulo(e.target.value)} 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Data de Início*</label>
                    <input 
                        required 
                        type="date" 
                        className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" 
                        value={dataInicio} 
                        onChange={(e) => setDataInicio(e.target.value)} 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-secondary text-primary font-semibold">Local*</label>
                    <Select
                        options={locaisDisponiveis}
                        unstyled
                        onChange={(selectedOption) => setLocal(selectedOption ? selectedOption.label : "")}
                        placeholder="Selecione um local"
                        classNames={{
                            control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
                            menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                            placeholder: () => "text-primary/75 font-secondary text-sm",
                            option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                        }}
                        required
                    />
                </div>
            </div>

            <button type="submit" className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer">
                Finalizar
            </button>
        </form>
    );
};

export default EventoForm;
