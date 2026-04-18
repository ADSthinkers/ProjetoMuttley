import Sidebar from "../components/Sidebar";
import AlunoCard from "../components/AlunoCard";
import EventoPalestraCard from "../components/EventoPalestraCard";
import { useState } from "react";
import { CaretDownIcon, MagnifyingGlassIcon, LecternIcon, CalendarStarIcon, UserIcon, XIcon } from "@phosphor-icons/react";

const Buscar = () => {

    const buscas = [{
        id: 1,
        nome: "Palestra legal",
        descricao: "Palestra legal de testes",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Palestra",
        concluido: false
    },{
        id: 1,
        nome: "Evento legal",
        descricao: "Boas práticas no desenvolvimento de software ágil",
        competencias: ["Bananisco", "Chapisco", "Gabarito"],
        palestrantes: ["João da Silva", "Chaperoni"],
        inicio: new Date(1776298040000),
        fim: new Date(1776301640000),
        tipo: "Evento",
        concluido: false
    }, {
        id: 1,
        nome: "Manon Katseye",
        cpf: "213.465.879-10",
        emailPessoal: "ilikethedrama@gameboy.com",
        emailFatec: "manon.katseye@fatec.sp.gov.br",
        tipo: "Aluno"
    }]

    const [busca, setBusca] = useState("")
    const [ordenar, setOrdenar] = useState("")

    const buscaFiltradas = buscas
        .filter(a => a.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => {
            if (ordenar === "Nome (A-Z)") return a.nome.localeCompare(b.nome)
            if (ordenar === "Nome (Z-A)") return b.nome.localeCompare(a.nome)
            return 0
        })

    const ordens = ["Nome (A-Z)", "Nome (Z-A)"]


    return(
        <div className="flex">
            <Sidebar />
            <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">

                    <h1 className="text-4xl font-primary text-primary font-bold">Buscar</h1>

                    {/* Busca + Ordenar */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-secondary text-primary/70" htmlFor="busca">Buscar</label>
                        <div className="flex gap-3">
                            {/* Campo de busca */}
                            <div className="flex items-center gap-3 flex-1 bg-accent/20 rounded-2xl px-5 py-3.5 h-15">
                                <input id="busca" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome de um evento ou palestra aqui" className="flex-1 bg-transparent text-sm font-secondary text-primary placeholder:text-primary/30 focus:outline-none"/>
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

                        <div className="flex bg-accent/30 gap-3 p-3 rounded-2xl">
                            <p className="text-sm font-secondary text-primary/70 self-center">Filtros</p>
                            <form className="flex flex-row w-full gap-2">
                                {/* Item: Eventos */}
                                <label className="flex-1 btn bg-accent/20 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="radio" name="frameworks" className="hidden" />
                                    <CalendarStarIcon size={20} />
                                    Eventos
                                </label>

                                {/* Item: Palestras */}
                                <label className="flex-1 btn bg-accent/20 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="radio" name="frameworks" className="hidden" />
                                    <LecternIcon size={20} />
                                    Palestras
                                </label>

                                {/* Item: Pendentes */}
                                <label className="flex-1 btn bg-accent/20 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="radio" name="frameworks" className="hidden" />
                                    <UserIcon size={20} />
                                    Alunos
                                </label>

                                <label className="w-20 btn bg-accent/20 border-0 text-primary/75 rounded-xl shadow-none font-secondary font-normal has-checked:bg-accent/75 has-checked:text-primary has-checked:font-bold cursor-pointer">
                                    <input type="reset" name="frameworks" className="hidden"  />
                                    <XIcon size={20} />
                                </label>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {buscaFiltradas.length > 0
                            ? buscaFiltradas.map(b => (
                               b.tipo.toLowerCase() === "aluno" ? <AlunoCard key={b.id} aluno={b} check={false}  /> : <EventoPalestraCard tipo="compact" item={{tipo: b.tipo, descricao: b.descricao, titulo: b.nome, data: b.inicio, link: b.tipo.toLowerCase === "palestra" ? `/palestra/${encodeURI(b.id)}` : `/evento/${encodeURI(b.id)}`}} />))
                            : (
                                <div className="text-sm font-secondary text-primary/40 py-8 text-center">
                                    Digite algo para buscar
                                </div>
                            )
                        }
                    </div>
            </div>
        </div>
    )
}

export default Buscar