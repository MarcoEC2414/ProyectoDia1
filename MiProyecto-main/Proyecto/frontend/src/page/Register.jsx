import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:4000/api/auth/register', form)
      navigate('/login')
    } catch (err) { alert('Error al registrar') }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono text-white p-4">
      <div className="w-full max-w-sm border border-gray-900 p-10 rounded-3xl bg-black shadow-2xl">
        <h1 className="text-xl font-bold text-center text-cyan-500 mb-8 tracking-widest">NUEVO USUARIO</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input name="nombre" placeholder="NOMBRE" onChange={(e) => setForm({...form, [e.target.name]: e.target.value})} className="bg-transparent border-b border-gray-800 p-3 text-center focus:border-cyan-500 outline-none" />
          <input name="email" placeholder="EMAIL" onChange={(e) => setForm({...form, [e.target.name]: e.target.value})} className="bg-transparent border-b border-gray-800 p-3 text-center focus:border-cyan-500 outline-none" />
          <input name="password" type="password" placeholder="PASSWORD" onChange={(e) => setForm({...form, [e.target.name]: e.target.value})} className="bg-transparent border-b border-gray-800 p-3 text-center focus:border-cyan-500 outline-none" />
          <button type="submit" className="bg-white text-black font-black py-4 rounded-full hover:bg-gray-200 transition-all">REGISTRAR</button>
          
          <div className="flex flex-col items-center gap-4 mt-4">
            <p className="text-[10px] text-gray-600">O USA TECNOLOGÍA BIOMÉTRICA</p>
            <button type="button" onClick={() => navigate('/face-register')} className="border border-cyan-500 text-cyan-500 p-3 rounded-full w-full hover:bg-cyan-500 hover:text-black transition-all text-xs font-bold">REGISTRAR POR FACE ID 🤖</button>
          </div>
        </form>
        <p className="text-center text-gray-700 text-[10px] mt-8">¿YA TIENES CUENTA? <Link to="/login" className="text-gray-400 hover:text-white">ENTRAR</Link></p>
      </div>
    </div>
  )
}
export default Register;