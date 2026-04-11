import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import { AnimatePresence } from "framer-motion";


function App() {

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App