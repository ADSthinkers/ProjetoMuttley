import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion";

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Competencias from "./pages/Competencias.jsx";
import Participantes from "./pages/Participantes.jsx";
import EventoPalestra from "./pages/EventoPalestra.jsx";
import Buscar from "./pages/Buscar.jsx";
import PalestraDetalhe from "./pages/PalestraDetalhe.jsx";
import EventoDetalhe from "./pages/EventoDetalhe.jsx";
import Novo from "./pages/Novo.jsx";
import PerfilParticipante from "./pages/PerfilParticipante.jsx";
import Palestrantes from "./pages/Palestrantes.jsx";
import PerfilPalestrante from "./pages/PerfilPalestrante.jsx";
import QrCode from "./pages/QrCode.jsx";
import { useLocation } from "react-router-dom";
import { isAuthenticated } from "./utils/auth.js";

const PrivateRoute = ({ children }) => (
  isAuthenticated() ? children : <Navigate to="/" replace />
);


function App() {
  const location = useLocation();

  return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/qrcode" element={<QrCode />} />
          <Route path="/qrcode/:token" element={<QrCode />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/competencias" element={<PrivateRoute><Competencias /></PrivateRoute>} />
          <Route path="/participantes" element={<PrivateRoute><Participantes /></PrivateRoute>} />
          <Route path="/participante/:id" element={<PrivateRoute><PerfilParticipante /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><PerfilParticipante /></PrivateRoute>} />
          <Route path="/palestrantes" element={<PrivateRoute><Palestrantes /></PrivateRoute>} />
          <Route path="/palestrante/:id" element={<PrivateRoute><PerfilPalestrante /></PrivateRoute>} />
          <Route path="/evento-palestra" element={<PrivateRoute><EventoPalestra /></PrivateRoute>} />
          <Route path="/palestra/:idPal" element={<PrivateRoute><PalestraDetalhe /></PrivateRoute>} />
          <Route path="/evento/:idEvento" element={<PrivateRoute><EventoDetalhe /></PrivateRoute>} />
          <Route path="/buscar" element={<PrivateRoute><Buscar /></PrivateRoute>} />
          <Route path="/novo" element={<PrivateRoute><Novo /></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
  )
}

export default App
