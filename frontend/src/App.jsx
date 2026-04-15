import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Competencias from "./pages/Competencias.jsx";
import Aluno from "./pages/Aluno.jsx";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar.jsx";


function App() {

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/competencias" element={<Competencias />} />
          <Route path="/alunos" element={<Aluno />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App