import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './page/Login'
import Register from './page/Register'
import Home from './page/Home'

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return <h1>Cargando...</h1>
  if (!usuario) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={
          <RutaProtegida>
            <Home />
          </RutaProtegida>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App