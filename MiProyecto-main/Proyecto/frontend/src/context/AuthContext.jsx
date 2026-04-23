import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Definimos la URL de la API en una constante para que sea fácil de cambiar
const API_URL = 'https://proyectodia1.onrender.com/api/auth';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Cambiamos la ruta local por la de producción en Render
    axios.get(`${API_URL}/verificar`, {
      withCredentials: true // Crucial para que las cookies funcionen en la nube
    })
    .then(res => {
      setUsuario(res.data.usuario)
      setCargando(false)
    })
    .catch(() => {
      setUsuario(null)
      setCargando(false)
    })
  }, [])

  const login = (datos) => setUsuario(datos)
  const logout = () => setUsuario(null)

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)