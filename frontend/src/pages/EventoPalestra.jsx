import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon, CalendarStarIcon, CheckCircleIcon, ClockIcon, LecternIcon } from "@phosphor-icons/react";
import EventoPalestraCard from "../components/EventoPalestraCard";


const EventoPalestra = () => {

    const eventospalestras = [{
        id: 1,
        titulo: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false
    },{
        id: 1,
        titulo: "Evento legal",
        descricao: "Boas práticas no desenvolvimento de software ágil",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Evento",
        concluido: false
    },{
        id: 1,
        titulo: "Boas práticas no desenvolvimento de software ágil usando SCRUM e KANBAN",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: true
    },{
        id: 1,
        titulo: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(177629804000),
        fim: new Date(177630164000),
        tipo: "Palestra",
        concluido: false
    },{
        id: 1,
        titulo: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false
    },{
        id: 1,
        titulo: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false
    },{
        id: 1,
        titulo: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false
    }]

    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")
    
    const ordens = ["Nome (A-Z)", "Nome (Z-A)", "Data (Crescente)", "Data (Decrescente)"]

    const [filtros, setFiltros] = useState({
        eventos: false,
        palestras: false,
        pendentes: false,
        concluidas: false
    });

    // Função para resetar tudo
    const resetarFiltros = () => {
        setFiltros({ eventos: false, palestras: false, pendentes: false, concluidas: false });
        setBusca("");
    };


    const evePalFiltrados = eventospalestras
        .filter(item => item.titulo.toLowerCase().includes(busca.toLowerCase()))
        .filter(item => {
            // Lógica de Tipo (Evento/Palestra)
            const filtroTipoAtivo = filtros.eventos || filtros.palestras;
            if (filtroTipoAtivo) {
                if (filtros.eventos && item.tipo === "Evento") return true;
                if (filtros.palestras && item.tipo === "Palestra") return true;
                return false;
            }
            return true;
        })
        .filter(item => {
            // Lógica de Status (Pendente/Concluída)
            const filtroStatusAtivo = filtros.pendentes || filtros.concluidas;
            if (filtroStatusAtivo) {
                if (filtros.pendentes && item.concluido) return true;
                if (filtros.concluidas && !item.concluido) return true;
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.titulo.localeCompare(b.titulo);
            if (ordenar === "Nome (Z-A)") return b.titulo.localeCompare(a.titulo);
            if (ordenar === "Data (Crescente)") return a.inicio - b.inicio;
            if (ordenar === "Data (Decrescente)") return b.inicio - a.inicio;
            return 0;
        });


    return(
        <div className="flex">
            <Sidebar />
            <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <h1 className="text-4xl font-primary text-primary font-bold">Eventos e Palestras</h1>

                    {/* Busca + Ordenar */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary/70" htmlFor="busca">Buscar</label>
                        <div className="flex gap-3">
                            {/* Campo de busca */}
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Digite o nome de um evento ou palestra aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
                                <MagnifyingGlassIcon size={20} weight="light" className="text-primary/40 shrink-0" />
                            </div>

                            {/* Ordenar por */}
                            <div className="relative">
                                <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} className="appearance-none bg-accent/20 rounded-2xl px-5 py-3.5 pr-10 text-sm font-secondary text-primary focus:outline-none cursor-pointer min-w-70 h-full">
                                    <option value="" disabled>Ordenar por</option>
                                    {ordens.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                                <CaretDownIcon size={16} weight="light" className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <p className="text-sm font-secondary text-primary/70 self-center">Filtros</p>
                            <form className="flex flex-row w-full gap-2">
                                {/* Item: Eventos */}
                                <label className="flex-1 btn bg-accent/30 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="checkbox" name="frameworks" className="hidden" onChange={() => setFiltros(f => ({...f, eventos: !f.eventos}))} />
                                    <CalendarStarIcon size={20} />
                                    Eventos
                                </label>

                                {/* Item: Palestras */}
                                <label className="flex-1 btn bg-accent/30 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="checkbox" name="frameworks" className="hidden" onChange={() => setFiltros(f => ({...f, palestras: !f.palestras}))} />
                                    <LecternIcon size={20} />
                                    Palestras
                                </label>

                                {/* Item: Pendentes */}
                                <label className="flex-1 btn bg-accent/30 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="checkbox" name="frameworks" className="hidden" onChange={() => setFiltros(f => ({...f, pendentes: !f.pendentes}))} />
                                    <ClockIcon size={20} />
                                    Pendentes
                                </label>

                                {/* Item: Concluídas */}
                                <label className="flex-1 btn bg-accent/30 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="checkbox" name="frameworks" className="hidden" onChange={() => setFiltros(f => ({...f, concluidas: !f.concluidas}))}/>
                                    <CheckCircleIcon size={20} />
                                    Concluídas
                                </label>

                                <label className="w-20 btn bg-accent/30 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="reset" name="frameworks" className="hidden" onClick={resetarFiltros} />
                                    <XIcon size={20} />
                                </label>
                            </form>
                        </div>

                    </div>

                    
                    <div className="flex flex-wrap gap-3">
                        {evePalFiltrados.length > 0 ? evePalFiltrados.map(ep => (
                                <EventoPalestraCard tipo="full" item={ep}/>
                            )) : (
                                <div className="text-sm font-secondary text-primary/40 py-8 text-center">
                                    Nenhuma palestra/evento encontrada.
                                </div>
                            )
                        }
                    </div>

            </div>
        </div>
    )
}

export default EventoPalestra