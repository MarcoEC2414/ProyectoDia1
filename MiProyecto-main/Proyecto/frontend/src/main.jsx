import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' 
import Register from './page/Register'
import Login from './page/Login'
import FaceRegister from './page/FaceRegister'
import Home from './page/Home'
import FaceAuthView from './page/FaceAuthView' // 👈 1. IMPORTA LA NUEVA PÁGINA
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/face-register" element={<FaceRegister />} />
          <Route path="/home" element={<Home />} />
          
          {/* 👈 2. AÑADE ESTA RUTA PARA LA TARJETA */}
          <Route path="/project/faceauth" element={<FaceAuthView />} /> 
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)