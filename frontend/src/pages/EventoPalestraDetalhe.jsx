import Sidebar from "../components/Sidebar";

const EventoPalestraDetalhe = () => {
    
    return (
        <div className="flex">
            <Sidebar compact={true} />
            <div className="pt-10 pl-5 pr-8 pb-8 w-full overflow-y-auto h-screen flex flex-col gap-6">
                <h1 className="text-4xl font-primary text-primary font-bold">Buscar</h1>
            </div>
        </div>
    )
}

export default EventoPalestraDetalhe