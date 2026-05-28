import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion";

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Competencias from "./pages/Competencias.jsx";
import Aluno from "./pages/Aluno.jsx";
import EventoPalestra from "./pages/EventoPalestra.jsx";
import Buscar from "./pages/Buscar.jsx";
import PalestraDetalhe from "./pages/PalestraDetalhe.jsx";
import EventoDetalhe from "./pages/EventoDetalhe.jsx";
import Novo from "./pages/Novo.jsx";



function App() {

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/competencias" element={<Competencias />} />
          <Route path="/alunos" element={<Aluno />} />
          <Route path="/evento-palestra" element={<EventoPalestra />} />
          <Route path="/palestra/:idPal" element={<PalestraDetalhe />} />
          <Route path="/evento/:idEvento" element={<EventoDetalhe />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/novo" element={<Novo />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App