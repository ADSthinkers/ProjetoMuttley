import { Info, SlidersHorizontal, CheckCircle, UploadSimple, PencilSimple, MagnifyingGlass, DotsThree, CaretRight, Check, X, ClipboardTextIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import Dropzone from 'react-dropzone'
import toast, { Toaster } from 'react-hot-toast';
import Avatar from "../utils/Avatar";


const ModalPresenca = ( { notificacao, presencaLancada, setPresencaLancada} ) => {
    
    // Função para fechar e resetar o modal
    const marcarPresenca = () => {
        document.getElementById('modal_lancar_presenca').close();
        // Reseta para o passo 1 após um pequeno delay para a animação de saída não mostrar a troca
        setPresencaLancada(true)
        //console.log(presencaLancada);
        
        presencaLancada ? null : setTimeout(() => setStepPresenca(1), 300);
    };

    const fecharModalPresenca = () => {
        document.getElementById('modal_lancar_presenca').close();
        presencaLancada ? null : setTimeout(() => setStepPresenca(1), 300);
    };

    // Mock de participantes para o Passo 3
    const participantes = [
        {
            id: 1,
            nome: "Manon Katseye",
            cpf: "213.465.879-10",
            email: "manon.katseye@fatec.sp.gov.br",
            email2: "ilikethedrama@gameboy.com",
            checked: true
        },
        {
            id: 2,
            nome: "Rebecca Black",
            cpf: "157.143.271-20",
            email: "rebecca.black@fatec.sp.gov.br",
            email2: "rebecca@friday.com",
            checked: false
        },
        {
            id: 3,
            nome: "Charlingtonglaevionbeecheknavare dos Anjos Mendonça",
            cpf: "321.654.987-00",
            email: "charlingtonglaevionbeecheknavare@fatec.sp.gov.br",
            email2: "charlingtonglaevionbeecheknavare@gmail.com",
            checked: true
        },{
            id: 4,
            nome: "Miguel Victor",
            cpf: "123.456.789-10",
            email: "miguel.victor@fatec.sp.gov.br",
            email2: "miguel.balbo@yahoo.com.br",
            checked: false
        }
    ]

    // Controle de passos do modal de presença (1, 2 ou 3)
    const [stepPresenca, setStepPresenca] = useState(presencaLancada ? 3 : 1);

    //Arquivo de presença
    const [filePresenca, setFilePresenca] = useState();

    useEffect(() => {
        setStepPresenca(presencaLancada ? 3 : 1);
    }, [presencaLancada]);

    //busca de participantes
    const [busca, setBusca] = useState("")

    //filtros
    const participantesFiltrados = participantes.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.email.toLowerCase().includes(busca.toLowerCase()) ||
        p.email2.toLowerCase().includes(busca.toLowerCase()) ||
        p.cpf.toLowerCase().includes(busca.toLowerCase())
    )


    return (
        <dialog id="modal_lancar_presenca" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">

            {notificacao}

            <div className="modal-box bg-base-100 rounded-xl p-8 max-w-3xl flex flex-col gap-6 relative">
                
                {/* Botão de Fechar Customizado */}
                <form method="dialog">
                    <button className="btn btn-sm btn-ghost btn-circle absolute right-6 top-6 bg-accent/30 border-none text-primary bg-none hover:bg-accent/50 shadow-none" onClick={fecharModalPresenca}>
                        <X weight="bold" size={16} />
                    </button>
                </form>

                {/* Header Fixo */}
                <div className="flex flex-col gap-1 pr-10">
                    <h3 className="text-3xl font-primary text-primary font-normal tracking-tight">{presencaLancada ? "Editar" : "Lançar"} presença</h3>
                    
                    {/* Subtítulos dinâmicos com base no step */}
                    {stepPresenca === 2 && (
                        <div className="flex flex-col">
                            <p className="font-secondary text-primary/70 text-sm">Fazer upload de arquivo</p>
                            <a href="#" className="font-secondary text-primary/50 text-xs underline mt-1">Baixar modelo</a>
                        </div>
                    )}
                    {stepPresenca === 3 && (
                        <p className="font-secondary text-primary/70 text-sm">Participantes selecionados</p>
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
                                <button onClick={() => setStepPresenca(2)} className="bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary text-sm py-2 px-6 rounded-lg cursor-pointer">
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
                                <button onClick={() => setStepPresenca(3)} className="bg-accent hover:bg-accent/80 transition-colors text-primary font-secondary text-sm py-2 px-6 rounded-lg cursor-pointer">
                                    Digitar manualmente
                                </button>
                            </div>
                        </>
                    )}

                    {/* PASSO 2: Drag and Drop (Upload) */}
                    {stepPresenca === 2 && (
                        <Dropzone 
                        accept={{
                            'text/csv': ['.csv'],
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                            'application/vnd.ms-excel': ['.xls']
                            //'application/pdf': ['.pdf'],

                        }}

                        onDrop={(acceptedFiles) => {
                            if (acceptedFiles.length > 0) {
                                const arquivoSelecionado = acceptedFiles[0];
                                
                                // Aqui você pode salvar o arquivo em um estado para enviar pra sua API depois
                                setFilePresenca(arquivoSelecionado); 
                                console.log("Arquivo aceito:", arquivoSelecionado.name);
                                
                                // Avança para a tela 3 do modal de presença
                                setStepPresenca(3); 
                            }
                        }}

                        onDropRejected={() => {
                            console.error("Arquivo inválido. Por favor, envie um CSV ou Excel.");
                            toast.error("Arquivo inválido. Por favor, envie um CSV ou Excel.")
                        }}
                        
                        onDrop={acceptedFiles => console.log(acceptedFiles)}>
                            {({getRootProps, getInputProps}) => (
                                <section>
                                    <div {...getRootProps()} className="w-full border-2 border-dashed border-accent/40 bg-accent/5 rounded-xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/10 transition-colors">
                                        <div className="w-14 h-14 bg-accent/30 rounded-2xl flex items-center justify-center text-primary/50">
                                            <UploadSimple size={28} weight="regular" />
                                        </div>
                                        <input {...getInputProps()} />
                                        <p className="font-secondary text-primary/40 text-sm">Clique, cole ou arraste o arquivo aqui para realizar o upload</p>
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                    )}

                    {/* PASSO 3: Lista de Participantes */}
                    {stepPresenca === 3 && (
                        <div className="flex flex-col gap-4">
                            {/* Input de Busca */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-secondary text-primary">Buscar</label>
                                <div className="relative">
                                    <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                        placeholder="Digite um nome, CPF ou email aqui" 
                                        className="w-full py-3 px-4 bg-accent/10 border border-accent/20 rounded-xl font-secondary text-sm text-primary placeholder:text-primary/30 outline-none focus:border-accent"
                                    />
                                    <MagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
                                </div>
                            </div>

                            {/* Lista de Cards */}
                            <div className="flex flex-col gap-3 mt-2 max-h-[40vh] overflow-y-auto pr-2">
                                {participantesFiltrados.map((participante) => (
                                    <div key={participante.id} className="w-full bg-accent/30 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <input type="checkbox" defaultChecked={participante.checked} className="checkbox checkbox-sm checkbox-accent text-primary border-primary/20 rounded-sm" />
                                            <Avatar email={participante.email} nome={participante.nome} />
                                            <div className="flex flex-col truncate">
                                                <span className="font-secondary text-primary text-sm font-medium truncate">{participante.nome}</span>
                                                <span className="font-secondary text-primary/60 text-xs truncate">{participante.email} | {participante.email2}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botão Confirmar (fixo na base) */}
                            <button 
                                onClick={marcarPresenca}
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
    )
}

export default ModalPresenca
