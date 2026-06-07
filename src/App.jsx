import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion";

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Competencias from "./pages/Competencias.jsx";
import Participantes from "./pages/Participantes.jsx";
import PerfilParticipante from "./pages/PerfilParticipante.jsx";
import EventoPalestra from "./pages/EventoPalestra.jsx";
import Buscar from "./pages/Buscar.jsx";
import PalestraDetalhe from "./pages/PalestraDetalhe.jsx";
import EventoDetalhe from "./pages/EventoDetalhe.jsx";
import Novo from "./pages/Novo.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Perfil from "./pages/Perfil.jsx";
import ValidarCertificado from "./pages/ValidarCertificado.jsx";
import Palestrantes from "./pages/Palestrantes.jsx";
import PerfilPalestrante from "./pages/PerfilPalestrante.jsx";
import QrCode from "./pages/QrCode.jsx";
import Locais from "./pages/Locais.jsx";
import LocalDetalhe from "./pages/LocalDetalhe.jsx";
import Patrocinadores from "./pages/Patrocinadores.jsx";
import PatrocinadorDetalhe from "./pages/PatrocinadorDetalhe.jsx";
import { useLocation } from "react-router-dom";
import { isAdmin, isAuthenticated } from "./utils/auth.js";

const PrivateRoute = ({ children }) => (
  isAuthenticated() ? children : <Navigate to="/" replace />
);

const AdminRoute = ({ children }) => (
  isAuthenticated() && isAdmin() ? children : <Navigate to="/home" replace />
);


function App() {
  const location = useLocation();

  return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/certificado/validar/:codigo" element={<ValidarCertificado />} />
          <Route path="/qrcode" element={<QrCode />} />
          <Route path="/qrcode/:token" element={<QrCode />} />
          <Route path="/inscricao/qrcode/:token" element={<QrCode tipo="inscricao" />} />
          <Route path="/checkin/qrcode/:token" element={<QrCode tipo="checkin" />} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/competencias" element={<PrivateRoute><Competencias /></PrivateRoute>} />
          <Route path="/participantes" element={<PrivateRoute><Participantes /></PrivateRoute>} />
          <Route path="/participante/:id" element={<PrivateRoute><PerfilParticipante /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path="/palestrantes" element={<PrivateRoute><Palestrantes /></PrivateRoute>} />
          <Route path="/palestrante/:id" element={<PrivateRoute><PerfilPalestrante /></PrivateRoute>} />
          <Route path="/locais" element={<AdminRoute><Locais /></AdminRoute>} />
          <Route path="/local/:idLocal" element={<AdminRoute><LocalDetalhe /></AdminRoute>} />
          <Route path="/patrocinadores" element={<AdminRoute><Patrocinadores /></AdminRoute>} />
          <Route path="/patrocinador/:idPat" element={<AdminRoute><PatrocinadorDetalhe /></AdminRoute>} />
          <Route path="/evento-palestra" element={<PrivateRoute><EventoPalestra /></PrivateRoute>} />
          <Route path="/palestra/:idPal" element={<PrivateRoute><PalestraDetalhe /></PrivateRoute>} />
          <Route path="/evento/:idEvento" element={<PrivateRoute><EventoDetalhe /></PrivateRoute>} />
          <Route path="/buscar" element={<PrivateRoute><Buscar /></PrivateRoute>} />
          <Route path="/novo" element={<PrivateRoute><Novo /></PrivateRoute>} />
          <Route path="/config" element={<AdminRoute><Configuracoes /></AdminRoute>} />
        </Routes>
      </AnimatePresence>
  )
}

export default App
