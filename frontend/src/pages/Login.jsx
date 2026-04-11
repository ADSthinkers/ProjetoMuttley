//import { useNavigate } from "react-router-dom";
import Textura from "../assets/textura.webp"
import MuttleyLogo from "../assets/muttley_logo.svg"

const Login = () => {

    return (
        <div className="relative">
            <img className="w-screen h-screen object-cover" src={Textura} alt="" />
            
            <div className="h-screen w-45/100 bg-base-100 absolute top-0 left-0 z-10 rounded-r-3xl">
                
                <div>
                    <img src={MuttleyLogo} alt="Logo do muttley" className="w-70" />
                </div>

            </div>
        </div>
    )
}

export default Login;