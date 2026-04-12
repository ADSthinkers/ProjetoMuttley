//import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Home = () => {

    return (
        <div className="flex">
            <Sidebar />
            {/* Sidebar */}
            <div className="pt-5">
                <h1>Olá, muttley</h1>
            </div>
        </div>
    )
}

export default Home;