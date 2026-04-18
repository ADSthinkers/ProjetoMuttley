import { useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import Select from 'react-select';

const PalestraForm = ({ setObjeto, setEtapa }) => {
    
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [palestrantes, setPalestrantes] = useState("");
    const [competencias, setCompetencias] = useState("");
    const [evento, setEvento] = useState("");
    const [data, setData] = useState("");
    const [inicio, setInicio] = useState("");
    const [fim, setFim] = useState("");
    
    //logica de selecao form
    const [inputValue, setInputValue] = useState("");

    //Mock de competencias
    const competenciasDisponiveis = [{value:"Scrum", label:"Scrum"}, {value:"Kanban", label:"Kanban"}, {value:"Agile", label: "Agile"}, {value:"Desenvolvimento de Software", label: "Desenvolvimento de Software"}, {value:"UX Design", label: "UX Design"}]

    return (
        <form className="flex flex-col gap-6">
                    {/* Título */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Título da palestra*</label>
                        <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={titulo} onChange={(e) => {setTitulo(e.target.value);}} required/>
                    </div>
        
                    {/* Descrição */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Descrição da palestra*</label>
                        <textarea className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 min-h-30 text-sm" value={descricao} onChange={(e) => {setDescricao(e.target.value);}} required/>
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Palestrantes e competências</div>
        
                    {/* Palestrantes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Palestrantes* <br /> <span className="text-xs font-normal text-primary/75"> Digite um nome e pressione enter para adicionar</span></label>
                        
                        {/* Container que imita o seu Select */}
                        <div className="flex flex-wrap items-center gap-2 p-2 min-h-15 bg-accent/30 border border-accent/20 rounded-xl focus-within:border-accent transition-all">
                            
                            {/* Renderiza as Tags salvas no seu useState */}
                            {palestrantes.map((nome, index) => (
                                <div key={index} className="flex items-center gap-1 bg-accent/30 text-primary font-secondary text-sm px-3 py-1 rounded-full border border-accent/10">
                                    {nome}
                                    <button type="button" onClick={() => setPalestrantes(palestrantes.filter((_, i) => i !== index))} className="hover:bg-accent/50 rounded-full p-0.5 transition-colors cursor-pointer">
                                        <X size={10} weight="bold" />
                                    </button>
                                </div>
                            ))}
        
                            {/* Input Simples para novos nomes */}
                            <input type="text" value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} placeholder={palestrantes.length === 0 ? "Digite um nome e aperte Enter" : ""} 
                            className="flex-1 bg-transparent border-none outline-none p-2 text-sm font-secondary text-primary placeholder:text-primary/50 min-w-[120px]"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Evita que o formulário recarregue
                                        const valor = inputValue.trim();
                                        
                                        if (valor && !palestrantes.includes(valor)) {
                                            setPalestrantes([...palestrantes, valor]);
                                            setInputValue(""); // Limpa o input
                                        }
                                    } else if (e.key === 'Backspace' && !inputValue && palestrantes.length > 0) {
                                        setPalestrantes(palestrantes.slice(0, -1));
                                    }
                                }}
                            />
                        </div>
                    </div>
        
                    {/* Competências */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Competências*</label>
                        <Select
                            isMulti name="Palestrantes" 
                            options={competenciasDisponiveis}
                            unstyled
                            onChange={(selectedOptions) => {
                                const apenasNomes = selectedOptions.map(option => option.label);
                                setCompetencias(apenasNomes);
                            }}
                            placeholder="Selecione um palestrante"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary",
                                multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
                                multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] rounded-xl mt-2 text-primary text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                            classNamePrefix="select"
                            required
                        />
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Evento</div>
        
                    {/* Evento */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Evento</label>
                        <Select
                            defaultValue={eventosDisponiveis[indexEventos]} 
                            name="Palestrantes" 
                            options={eventosDisponiveis}
                            unstyled
                            isClearable={true}
                            onChange={(selectedOption) => {
                                setEvento(selectedOption ? selectedOption.label : "");
                            }}
                            placeholder="Selecione um evento"
                            classNames={{
                                control: () => "basic-multi-select bg-accent/30 px-4 py-2 h-15 border border-accent/20 rounded-xl text-primary text-sm",
                                multiValue: () => "bg-accent/30 rounded-full px-2 py-1 m-1 flex items-center text-primary font-secondary text-sm",
                                multiValueRemove: () => "hover:bg-accent/50 rounded-full ml-1 p-1 transition-colors",
                                menu: () => "bg-[color-mix(in_srgb,theme(colors.accent),white_70%)] text-primary rounded-xl mt-2 text-sm",
                                placeholder: () => "text-primary/75 font-secondary text-sm",
                                option: ({ isFocused }) => `px-4 py-3 ${isFocused ? 'bg-accent/50 rounded-xl' : ''}`
                            }}
                            classNamePrefix="select"
                        />
                    </div>
        
                    <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Data e hora</div>
        
                    {/* Data */}
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-secondary font-semibold text-primary">Data da palestra*</label>
                        <input type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setData(e.target.value);}} value={data} required />
                    </div>
                    
                    {/* Horários */}
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-base font-secondary font-semibold text-primary">Horário de início*</label>
                            <input type="time" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setInicio(e.target.value);}} value={inicio} />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-base font-secondary font-semibold text-primary">Horário de fim*</label>
                            <input type="time" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setFim(e.target.value);}} value={fim} required/>
                        </div>
                    </div>
        
                    <button className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer`}>Salvar</button>
            </form>
    )
}

export default PalestraForm