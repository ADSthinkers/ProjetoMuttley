import Sidebar from "../components/Sidebar";
import Select from 'react-select';
import { Info, SlidersHorizontal, CheckCircle, UploadSimple, PencilSimple, MagnifyingGlass, DotsThree, CaretRight, Check, X, ClipboardTextIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

const PalestraDetalhe = () => {

    //Mock palestra
    const itemEventoPalestra = {
        id: 1,
        titulo: "Boas práticas no desenvolvimento de software ágil usando SCRUM e KANBAN",
        descricao: "Palestra focada em metodologias ágeis, cobrindo os fundamentos de Scrum e Kanban, e como integrá-los para melhorar a eficiência da equipe.",
        competencias: ["Scrum", "Kanban", "Agile", "Desenvolvimento de Software"],
        palestrantes: ["João da Silva", "Conan Gray"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false,
        evento: null
    }


    //Mock de palestrantes
    const palestrantesDisponiveis = [{value:"João da Silva", label:"João da Silva"}, {value:"Chaperoni", label:"Chaperoni"}, {value:"Taylor Swift", label: "Taylor Swift"}, {value:"Conan Gray", label: "Conan Gray"}]
    const indexPalestrantes = itemEventoPalestra.palestrantes.map(p => palestrantesDisponiveis.findIndex(pd => pd.label === p))


    //Mock de competências
    const competenciasDisponiveis = [{value:"Scrum", label:"Scrum"}, {value:"Kanban", label:"Kanban"}, {value:"Agile", label: "Agile"}, {value:"Desenvolvimento de Software", label: "Desenvolvimento de Software"}, {value:"UX Design", label: "UX Design"}]
    const indexCompetencias = itemEventoPalestra.competencias.map(c => competenciasDisponiveis.findIndex(cd => cd.label === c))


    //Mock de eventos
    const eventosDisponiveis = [{value:"Evento 1", label:"Evento 1"}, {value:"FATEC Portas Abertas 2026", label:"FATEC Portas Abertas 2026"}];
    const indexEventos = eventosDisponiveis.findIndex(ed => ed.label === itemEventoPalestra.evento)


    // 1. Defina os valores iniciais normalizados primeiro
    const initialData = {
        titulo: itemEventoPalestra.titulo,
        descricao: itemEventoPalestra.descricao,
        palestrantes: itemEventoPalestra.palestrantes,
        competencias: itemEventoPalestra.competencias,
        evento: itemEventoPalestra.evento || "", // Normaliza null para string vazia
        data: itemEventoPalestra.inicio.toLocaleDateString('sv-SE'),
        inicio: itemEventoPalestra.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        fim: itemEventoPalestra.fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // 2. Use esses valores nos useStates
    const [titulo, setTitulo] = useState(initialData.titulo);
    const [descricao, setDescricao] = useState(initialData.descricao);
    const [palestrantes, setPalestrantes] = useState(initialData.palestrantes);
    const [competencias, setCompetencias] = useState(initialData.competencias);
    const [evento, setEvento] = useState(initialData.evento); // Corrigido de .titulo para .evento
    const [data, setData] = useState(initialData.data);
    const [inicio, setInicio] = useState(initialData.inicio);
    const [fim, setFim] = useState(initialData.fim);
    const [isConcluido, setIsConcluido] = useState(itemEventoPalestra.concluido);

    // 3. A comparação agora será entre strings idênticas
    const houveAlteracao = 
        titulo !== initialData.titulo ||
        descricao !== initialData.descricao ||
        evento !== initialData.evento ||
        data !== initialData.data ||
        inicio !== initialData.inicio ||
        fim !== initialData.fim ||
        JSON.stringify(palestrantes) !== JSON.stringify(initialData.palestrantes) ||
        JSON.stringify(competencias) !== JSON.stringify(initialData.competencias);

    console.log(houveAlteracao);


    // Controle de passos do modal de presença (1, 2 ou 3)
    const [stepPresenca, setStepPresenca] = useState(1);

    // Função para fechar e resetar o modal
    const fecharModalPresenca = () => {
        document.getElementById('modal_lancar_presenca').close();
        // Reseta para o passo 1 após um pequeno delay para a animação de saída não mostrar a troca
        setTimeout(() => setStepPresenca(1), 300);
    };

    // Mock de alunos para o Passo 3
    const alunosMock = [
        { id: 1, nome: "Charlingtonglaevionbeecheknavare dos Anjos Mendonça", email: "charlingtonglaevionbeecheknavare@gmail.com | charlingtonglaevionbeecheknavare@aluno.cps.sp.gov.br", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, nome: "Charlingtonglaevionbeecheknavare dos Anjos Mendonça", email: "charlingtonglaevionbeecheknavare@gmail.com | charlingtonglaevionbeecheknavare@aluno.cps.sp.gov.br", avatar: "https://i.pravatar.cc/150?u=2" }
    ];
    
    
    //controle de aba
    const [isInfoTab, setIsInfoTab] = useState(true)

    const infoTab =
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

            {/* Palestrantes */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Palestrantes*</label>
                <Select
                    defaultValue={indexPalestrantes.map(i => palestrantesDisponiveis[i])} 
                    isMulti name="Palestrantes" 
                    options={palestrantesDisponiveis}
                    unstyled
                    onChange={(selectedOptions) => {
                        const apenasNomes = selectedOptions.map(option => option.label);
                        setPalestrantes(apenasNomes);
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

            {/* Competências */}
            <div className="flex flex-col gap-2">
                <label className="text-base font-secondary font-semibold text-primary">Competências*</label>
                <Select
                    defaultValue={indexCompetencias.map(i => competenciasDisponiveis[i])} 
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

            <button disabled={!houveAlteracao} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl  ${houveAlteracao ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>Salvar</button>
        </form>
        

    const acaoTab = 
        <div className="flex gap-6">
            
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
            
            {/* lançar presença */}
            {isConcluido ? <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6">

                {/* Container do Ícone */}
                <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                    <ClipboardTextIcon size={48} className="text-white" weight="regular" />
                </div>

                {/* Título Principal */}
                <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                    Lançar Presença
                </h2>

                {/* Botão de Ação */}
                <button onClick={() => document.getElementById('modal_lancar_presenca').showModal()} className={`w-full text-sm bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary py-4 rounded-xl cursor-pointer`}>
                   Lançar Presença
                </button>
            </div> : <div className="w-full bg-accent/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 opacity-50 select-none" >

                {/* Container do Ícone */}
                <div className="w-24 h-24 bg-[color-mix(in_srgb,var(--color-accent),#000_25%)] rounded-xl flex items-center justify-center">
                    <ClipboardTextIcon size={48} className="text-white" weight="regular" />
                </div>

                {/* Título Principal */}
                <h2 className="text-xl font-primary text-primary font-normal tracking-tight">
                    Lançar Presença
                </h2>

                {/* Botão de Ação */}
                <div className={`w-full text-sm bg-accent transition-colors text-center text-primary font-secondary py-4 rounded-xl cursor-not-allowed`} disabled>
                   Lançar Presença
                </div>
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
                            console.log("Palestra concluída!");
                            setIsConcluido(true)
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

            {/* Modal Lançar Presença - Fluxo de 3 Telas */}
            <dialog id="modal_lancar_presenca" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
                <div className="modal-box bg-base-100 rounded-xl p-8 max-w-3xl flex flex-col gap-6 relative">
                    
                    {/* Botão de Fechar Customizado */}
                    <button 
                        onClick={fecharModalPresenca}
                        className="btn btn-sm btn-circle absolute right-6 top-6 bg-accent/30 border-none text-primary hover:bg-accent/50 shadow-none"
                    >
                        <X weight="bold" size={16} />
                    </button>

                    {/* Header Fixo */}
                    <div className="flex flex-col gap-1 pr-10">
                        <h3 className="text-3xl font-primary text-primary font-normal tracking-tight">Lançar presença</h3>
                        
                        {/* Subtítulos dinâmicos com base no step */}
                        {stepPresenca === 2 && (
                            <div className="flex flex-col">
                                <p className="font-secondary text-primary/70 text-sm">Fazer upload de arquivo</p>
                                <a href="#" className="font-secondary text-primary/50 text-xs underline mt-1">Baixar modelo</a>
                            </div>
                        )}
                        {stepPresenca === 3 && (
                            <p className="font-secondary text-primary/70 text-sm">Alunos selecionados</p>
                        )}
                    </div>

                    {/* CONTEÚDO DINÂMICO (STEPS) */}
                    <div className="flex flex-col gap-4 mt-2">
                        
                        {/* PASSO 1: Escolha do método */}
                        {stepPresenca === 1 && (
                            <>
                                {/* Opção Upload */}
                                <div className="w-full bg-accent/20 rounded-2xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center text-primary/60">
                                            <UploadSimple size={24} weight="regular" />
                                        </div>
                                        <span className="font-secondary text-primary text-base">Fazer upload de arquivo (recomendado)</span>
                                    </div>
                                    <button 
                                        onClick={() => setStepPresenca(2)}
                                        className="bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary text-sm py-2 px-6 rounded-lg cursor-pointer"
                                    >
                                        Fazer upload
                                    </button>
                                </div>

                                {/* Opção Manual */}
                                <div className="w-full bg-accent/20 rounded-2xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-accent/30 rounded-xl flex items-center justify-center text-primary/60">
                                            <PencilSimple size={24} weight="regular" />
                                        </div>
                                        <span className="font-secondary text-primary text-base">Digitar manualmente</span>
                                    </div>
                                    <button 
                                        onClick={() => setStepPresenca(3)}
                                        className="bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary text-sm py-2 px-6 rounded-lg cursor-pointer"
                                    >
                                        Digitar manualmente
                                    </button>
                                </div>
                            </>
                        )}

                        {/* PASSO 2: Drag and Drop (Upload) */}
                        {stepPresenca === 2 && (
                            <div className="w-full border-2 border-dashed border-accent/40 bg-accent/5 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/10 transition-colors"
                                onClick={() => setStepPresenca(3)} // Simula o upload levando ao passo 3
                            >
                                <div className="w-14 h-14 bg-accent/30 rounded-2xl flex items-center justify-center text-primary/50">
                                    <UploadSimple size={28} weight="regular" />
                                </div>
                                <p className="font-secondary text-primary/40 text-sm">
                                    Clique, cole ou arraste o arquivo aqui para realizar o upload
                                </p>
                            </div>
                        )}

                        {/* PASSO 3: Lista de Alunos */}
                        {stepPresenca === 3 && (
                            <div className="flex flex-col gap-4">
                                {/* Input de Busca */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-secondary text-primary">Buscar</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Digite um nome, CPF ou email aqui" 
                                            className="w-full py-3 px-4 bg-accent/10 border border-accent/20 rounded-xl font-secondary text-sm text-primary placeholder:text-primary/30 outline-none focus:border-accent"
                                        />
                                        <MagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                                    </div>
                                </div>

                                {/* Lista de Cards */}
                                <div className="flex flex-col gap-3 mt-2 max-h-[40vh] overflow-y-auto pr-2">
                                    {alunosMock.map((aluno) => (
                                        <div key={aluno.id} className="w-full bg-accent/30 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <input type="checkbox" defaultChecked className="checkbox checkbox-sm checkbox-accent text-primary border-primary/20 rounded-sm" />
                                                <img src={aluno.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                                <div className="flex flex-col truncate">
                                                    <span className="font-secondary text-primary text-sm font-medium truncate">{aluno.nome}</span>
                                                    <span className="font-secondary text-primary/60 text-xs truncate">{aluno.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Botão Confirmar (fixo na base) */}
                                <button 
                                    onClick={fecharModalPresenca}
                                    className="w-full bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary text-sm font-medium py-4 rounded-xl mt-4 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Check size={18} weight="bold" />
                                    Confirmar presença
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Clique fora para fechar (backdrop) */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={fecharModalPresenca}>close</button>
                </form>
            </dialog>
        </div>


    return (
        <div className="flex bg-base-100 min-h-screen">
            <Sidebar compact={true} />
            
            <div className="pt-10 pl-5 pr-12 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-primary text-primary font-bold">Detalhes</h1>
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

export default PalestraDetalhe