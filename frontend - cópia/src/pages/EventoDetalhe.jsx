import Sidebar from "../components/Sidebar";
import Select from 'react-select';
import { Info, SlidersHorizontal, CheckCircle, UploadSimple, PencilSimple, MagnifyingGlass, DotsThree, CaretRight, Check, X, ClipboardTextIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import Dropzone from 'react-dropzone'
import toast, { Toaster } from 'react-hot-toast';
import AlunoAvatar from "../utils/AlunoAvatar";
import ModalPresenca from "../components/ModalPresenca";


const EventoDetalhe = () => {

    //Mock palestra
    const itemEventoPalestra = {
        id: 1,
        titulo: "Fatec Portas Abertas 26/1",
        descricao: "Portas abertas 2026",
        local: "Auditório - Fatec Zona Leste",
        palestras: ["Boas práticas no desenvolvimento de software ágil usando SCRUM e KANBAN", "Palestra"],
        inicio: new Date(177629804000),
        fim: new Date(1776301640000),
        tipo: "Evento",
        concluido: false
    }

    //Mock de competências
    const palestrasDisponiveis = [{value:"Boas práticas no desenvolvimento de software ágil usando SCRUM e KANBAN", label:"Boas práticas no desenvolvimento de software ágil usando SCRUM e KANBAN"}, {value:"Palestra 2", label:"Palestra 2"}, {value:"Palestra", label: "Palestra"}]
    const indexPalestras = itemEventoPalestra.palestras.map(p => palestrasDisponiveis.findIndex(pd => pd.label === p))


    // 1. Defina os valores iniciais normalizados primeiro
    const initialData = {
        titulo: itemEventoPalestra.titulo,
        descricao: itemEventoPalestra.descricao,
        local: itemEventoPalestra.local,
        palestras: itemEventoPalestra.palestras,
        inicio: itemEventoPalestra.inicio.toLocaleDateString('sv-SE'),
        fim: itemEventoPalestra.fim.toLocaleDateString('sv-SE')
    };

    // 2. Use esses valores nos useStates
    const [titulo, setTitulo] = useState(initialData.titulo);
    const [descricao, setDescricao] = useState(initialData.descricao);
    const [local, setLocal] = useState(initialData.local);
    const [palestras, setPalestras] = useState(initialData.palestras);
    const [inicio, setInicio] = useState(initialData.inicio);
    const [fim, setFim] = useState(initialData.fim);
    const [isConcluido, setIsConcluido] = useState(itemEventoPalestra.concluido);

    // 3. A comparação agora será entre strings idênticas
    const houveAlteracao = 
        titulo !== initialData.titulo ||
        descricao !== initialData.descricao ||
        local !== initialData.local ||
        inicio !== initialData.inicio ||
        fim !== initialData.fim ||
        JSON.stringify(palestras) !== JSON.stringify(initialData.palestras)


    //controle de aba
    const [isInfoTab, setIsInfoTab] = useState(true)


    //Toast
    const notificacao = <Toaster position="top-center" reverseOrder={false} toastOptions={{
                    // Estilo padrão para todos os toasts
                    style: {
                        borderRadius: '20px', // rounded-[2rem] como seus cards
                        fontFamily: 'Inter Tight, sans-serif', // font-secondary
                        fontSize: '14px',
                        color: 'var(--color-primary)',
                        background: 'var(--color-base-100)',
                        border: '1px solid rgba(252, 209, 96, 0.2)', // Borda leve com cor accent
                    },
                    // Customização específica para o tipo erro
                    error: {
                        style: {
                            background: 'var(--color-error)', // Seu vermelho #d62022
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: 'var(--color-error)',
                        },
                    },
                    // Customização específica para o tipo sucesso
                    success: {
                        style: {
                            background: 'var(--color-right)', // Seu verde #69d81d
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: 'var(--color-right)',
                        },
                    },
                }}/>

    
    const infoTab =
        <form className="flex flex-col gap-6">
            {/* Título */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Título do evento*</label>
                <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={titulo} onChange={(e) => {setTitulo(e.target.value);}} required/>
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Descrição do evento*</label>
                <textarea className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 min-h-30 text-sm" value={descricao} onChange={(e) => {setDescricao(e.target.value);}} required/>
            </div>

            {/* Título */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Local do evento*</label>
                <input className="w-full text-sm p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80" value={local} onChange={(e) => {setLocal(e.target.value);}} required/>
            </div>

            <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Palestras</div>

            {/* Palestras */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Palestras*</label>
                <Select
                    defaultValue={indexPalestras.map(i => palestrasDisponiveis[i])} 
                    isMulti name="Palestrantes" 
                    options={palestrasDisponiveis}
                    unstyled
                    onChange={(selectedOptions) => {
                        const apenasNomes = selectedOptions.map(option => option.label);
                        setPalestras(apenasNomes);
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
            
            <div className="divider divider-primary opacity-50 text-sm font-secondary text-primary">Horários</div>

            {/* Horários */}
            <div className="flex gap-2">
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-base font-secondary font-semibold text-primary">Data de início*</label>
                    <input type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setInicio(e.target.value);}} value={inicio} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label className="text-base font-secondary font-semibold text-primary">Data de fim*</label>
                    <input type="date" className="w-full p-4 bg-accent/30 border border-accent/20 rounded-xl font-secondary text-primary/80 text-sm" onChange={(e) => {setFim(e.target.value);}} value={fim} required/>
                </div>
            </div>

            <button disabled={!houveAlteracao} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl  ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>Salvar</button>
        </form>
        

    const acaoTab = 
        <div className="flex gap-6">

            {notificacao}
            
            {/* marcar como concluido */}
            {isConcluido ? <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 opacity-50">

                {/* Container do Ícone */}
                <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                    <CheckCircle size={48} className="text-white" weight="regular" />
                </div>

                {/* Título Principal */}
                <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                    Marcar como concluído
                </h2>

                {/* Botão de Ação */}
                <div className="w-full text-sm bg-accent transition-colors text-center text-primary font-secondary py-4 rounded-xl cursor-not-allowed">
                    Marcar como concluído
                </div>
            </div> : <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">

                {/* Container do Ícone */}
                <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                    <CheckCircle size={48} className="text-white" weight="regular" />
                </div>

                {/* Título Principal */}
                <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                    Marcar como concluído
                </h2>

                {/* Botão de Ação */}
                <button className="w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer" onClick={()=>document.getElementById('modal_confirmar_conclusao').showModal()}>
                    Marcar como concluído
                </button>
            </div>}
            
            
            {/* apagar */}
            <div className="w-full bg-error/25 rounded-2xl p-6 flex flex-col items-center justify-center gap-6" onClick={()=>document.getElementById('modal_confirmar_apagar').showModal()}>

                {/* Container do Ícone */}
                <div className="w-24 h-24 bg-error/75 rounded-xl flex items-center justify-center">
                    <TrashSimpleIcon size={48} className="text-white" weight="regular" />
                </div>

                {/* Título Principal */}
                <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                    Apagar {itemEventoPalestra.tipo}
                </h2>

                {/* Botão de Ação */}
                <button className="w-full text-sm bg-error/75 hover:bg-error transition-colors text-secondary font-secondary py-4 rounded-xl cursor-pointer">
                    Apagar {itemEventoPalestra.tipo}
                </button>
            </div>

            {/* Modal de Confirmação */}
            <dialog id="modal_confirmar_conclusao" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-base-100 border border-accent/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    
                    {/* Botão de Fechar (X) */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-accent btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">✕</button>
                    </form>

                    {/* Ícone de Destaque */}
                    <div className="w-24 h-24 bg-accent/20 rounded-xl flex items-center justify-center mb-2">
                        <CheckCircle size={40} className="text-accent" weight="fill" />
                    </div>

                    {/* Conteúdo */}
                    <h3 className="text-2xl font-primary text-primary font-bold">Marcar como concluído?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a marcar <span className="font-semibold text-primary">"{titulo}"</span> como concluída. 
                        Esta ação confirmará a presença dos participantes e não poderá ser desfeita.
                    </p>

                    {/* Ações */}
                    <div className="modal-action w-full flex gap-3 mt-4">
                    <form method="dialog" className="flex-1">
                        <button className="w-full py-4 rounded-xl text-sm font-secondary font-medium text-primary/60 hover:bg-black/5 transition-colors cursor-pointer">
                            Cancelar
                        </button>
                    </form>
                    <button onClick={() => {
                            // Lógica para marcar como concluído aqui
                            console.log("Evento concluída!");
                            setIsConcluido(true)
                            toast.success("Evento marcado como concluido")
                            document.getElementById('modal_confirmar_conclusao').close();
                        }}
                        className="flex-[1.5] bg-accent hover:bg-accent/80 transition-colors text-primary text-sm font-secondary font-bold py-4 rounded-xl cursor-pointer">
                        Sim, concluir
                    </button>
                </div>
                </div>
                
                {/* Clique fora para fechar */}
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Modal de Apagar */}
            <dialog id="modal_confirmar_apagar" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-[color-mix(in_srgb,var(--color-error),white_80%)] border border-error/20 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    
                    {/* Botão de Fechar (X) */}
                    <form method="dialog">
                        <button className="btn btn-sm btn-error btn-circle btn-ghost absolute right-4 top-4 text-primary/50 hover:text-primary">✕</button>
                    </form>

                    {/* Ícone de Destaque */}
                    <div className="w-24 h-24 bg-error/20 rounded-xl flex items-center justify-center mb-2">
                        <TrashSimpleIcon size={40} className="text-error" weight="fill" />
                    </div>

                    {/* Conteúdo */}
                    <h3 className="text-2xl font-primary text-primary font-bold">Deseja apagar?</h3>
                    <p className="font-secondary text-primary/70 text-sm leading-relaxed">
                        Você está prestes a apagar a {itemEventoPalestra.tipo.toLowerCase()} <span className="font-semibold text-primary">"{titulo}"</span>. 
                        Esta ação apagará a {itemEventoPalestra.tipo.toLowerCase()} permanentemente e não poderá ser desfeita.
                    </p>

                    {/* Ações */}
                    <div className="modal-action w-full flex gap-3 mt-4">
                    <form method="dialog" className="flex-1">
                        <button className="w-full py-4 rounded-xl text-sm font-secondary font-medium text-primary/60 hover:bg-black/5 transition-colors cursor-pointer">
                            Cancelar
                        </button>
                    </form>
                    <button onClick={() => {
                            // Lógica para marcar como concluído aqui
                            console.log("Palestra apagada!");
                            document.getElementById('modal_confirmar_apagar').close();
                        }}
                        className="flex-[1.5] bg-error hover:bg-error/80 transition-colors text-secondary text-sm font-secondary font-bold py-4 rounded-xl cursor-pointer">
                        Apagar
                    </button>
                </div>
                </div>
                
                {/* Clique fora para fechar */}
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>


    return (
        <div className="flex bg-base-100 min-h-screen">
            <Sidebar compact={true} />
            
            <div className="pt-10 pl-5 pr-12 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-primary text-primary font-bold">Detalhes do evento</h1>
                    <p className="text-base font-secondary text-primary/70">{itemEventoPalestra.titulo}</p>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-box bg-accent/30 rounded-xl p-1 w-full">
                    <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-secondary text-primary text-sm cursor-pointer ${isInfoTab ? "bg-accent font-semibold" : ""}`} onClick={() => setIsInfoTab(true)}>
                        <Info size={20} weight="bold" />
                        Informações
                    </button>
                    <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-secondary text-primary cursor-pointer text-sm ${isInfoTab ? "" : "bg-accent font-semibold"}`} onClick={() => setIsInfoTab(false)}>
                        <SlidersHorizontal size={20} />
                        Ações
                    </button>
                </div>

                {isInfoTab ? infoTab : acaoTab}
                
            </div>
        </div>
    )
}

export default EventoDetalhe