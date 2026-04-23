import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import p1 from "../assets/projects/proyecto1.jpg";
import p2 from "../assets/projects/proyecto2.jpg";
import p3 from "../assets/projects/proyecto3.png";
import p4 from "../assets/projects/proyecto4.jpg";
import p5 from "../assets/projects/proyecto5.jpg";
import FloatingMusic from './FloatingMusic';
import CyberpunkLine from './CyberpunkLine';
import RayitoXD from './rayito'; 

// ─── PROYECTOS (Nombres y Roles Actualizados) ────────────────────────────────
const PROJECTS = [
  {
    id: 1, title: 'Ghian Marco Escalante',
    subtitle: 'Aprendiz de todo, maestro de nada',
    tags: ['Full Stackt', 'BaseDeDatos', 'Frontend Developer','Backend Developer'],
    img: p1, accent: '#ff4d4d', link: '/project/faceauth',
    role: 'Líder de Proyecto',
  },
  {
    id: 2, title: 'Carlos Luna',
    subtitle: 'Especialista en Backend y Estructuras',
    tags: ['Frontend Developer'],
    img: p2, accent: '#3b82f6', link: '/proyectos/dataflow',
    role: 'Backend Dev',
  },
  {
    id: 3, title: 'Gabriel Omar Saldivar',
    subtitle: 'Diseñador UI/UX y Frontend',
    tags: ['Backend Developer'],
    img: p3, accent: '#00f2fe', link: '/proyectos/shopcore',
    role: 'Frontend Dev',
  },
  {
    id: 4, title: 'Alexander Pasanahase',
    subtitle: 'Random',
    tags: ['React Native', 'Firebase'],
    img: p4, accent: '#f59e0b', link: '/proyectos/taskflow',
    role: 'DevOps',
  },
  {
    id: 5, title: 'Mi GitHub Personal',
    subtitle: 'Explora mis repositorios y contribuciones en código abierto',
    tags: ['GitHub', 'Code', 'OpenSource'],
    img: p5, accent: '#a855f7', 
    isExternal: true,
    link: 'https://github.com/', 
    role: 'Repositorio',
  },
  {
    id: 6, title: 'Zona Random',
    subtitle: 'Un rincón con experimentos visuales y sorpresas aleatorias',
    tags: ['Sorpresa', 'Web', 'Random'],
    img: null, accent: '#10b981', 
    isExternal: true,
    link: 'https://puginarug.com/', 
    role: 'Explorer',
  },
]

// ─── PARTÍCULAS CANVAS (MANTENIDO) ───────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)
  const stateRef = useRef({ mouse: { x: -9999, y: -9999 }, particles: [], animId: null })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H

    const resize = () => { 
        W = canvas.width = window.innerWidth; 
        H = canvas.height = window.innerHeight; 
        init(); 
    }

    const mkP = () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
      r: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * .5 + .2,
      color: Math.random() > .7 ? '#ff4d4d' : Math.random() > .5 ? '#3b82f6' : '#ffffff',
    })

    const init = () => {
        const COUNT = Math.min(Math.floor((W * H) / 7000), 180); 
        stateRef.current.particles = Array.from({ length: COUNT }, mkP);
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      const { mouse, particles } = stateRef.current
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mouse.x - p.x, dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy)
        if (dist < 180) { 
            const f = (180 - dist) / 180 * .8; 
            p.vx -= dx / dist * f; 
            p.vy -= dy / dist * f; 
        }
        p.vx *= .98; p.vy *= .98;
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j], d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - d / 100) * 0.15;
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1;
      stateRef.current.animId = requestAnimationFrame(draw)
    }
    resize(); draw();
    const onMove = e => { stateRef.current.mouse = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', resize)
    return () => { 
        cancelAnimationFrame(stateRef.current.animId); 
        window.removeEventListener('mousemove', onMove); 
        window.removeEventListener('resize', resize);
    }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

// ─── TARJETA FLOTANTE (Modificada con etiqueta "Miembro" y Animación) ──────────
function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const navigate = useNavigate()

  const onMove = useCallback(e => {
    const r = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left) / r.width
    const cy = (e.clientY - r.top) / r.height
    setTilt({ x: (cy - .5) * -25, y: (cx - .5) * 25 })
    setGlow({ x: cx * 100, y: cy * 100 })
  }, [])

  const onLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setHovered(false) }, [])

  const handleCardClick = () => {
    if (project.isExternal) {
      window.open(project.link, '_blank');
    } else {
      navigate(project.link);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      onClick={handleCardClick}
      style={{
        position: 'relative', borderRadius: 24, cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hovered ? project.accent + 'aa' : 'rgba(255,255,255,0.12)'}`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${hovered ? -10 : 0}px)`,
        transition: hovered ? 'all .1s ease-out' : 'all .6s cubic-bezier(.23, 1, .32, 1)',
        boxShadow: hovered 
          ? `0 30px 60px rgba(0,0,0,0.5), 0 0 20px ${project.accent}33` 
          : '0 10px 30px rgba(0,0,0,0.2)',
        animation: `floatAnim 6s ease-in-out infinite ${index * 0.5}s, cardIn .8s ${index * 0.1}s both`,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, borderRadius: 24,
        background: hovered 
          ? `radial-gradient(600px circle at ${glow.x}% ${glow.y}%, ${project.accent}20, transparent 40%)` 
          : 'none',
      }} />

      <div style={{ height: 200, position: 'relative', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(to bottom, transparent 40%, ${project.accent}30 100%)`,
          mixBlendMode: 'overlay'
        }} />
        
        {project.img ? (
          <img src={project.img} alt={project.title} style={{ 
            width: '100%', height: '100%', objectFit: 'cover', 
            transform: hovered ? 'scale(1.15) rotate(2deg)' : 'scale(1) rotate(0deg)', 
            transition: 'transform .8s cubic-bezier(.16, 1, .3, 1)' 
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(45deg, ${project.accent}15, #1e1e26)` }}>
              <div style={{ transform: hovered ? 'scale(1.2) translateY(-5px)' : 'scale(1)', transition: '0.4s' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={project.accent} strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
          </div>
        )}
      </div>

      <div style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 15 }}>
          {project.tags.map(t => (
            <span key={t} style={{ 
              fontSize: 10, padding: '4px 12px', borderRadius: 100, 
              background: hovered ? project.accent : 'rgba(255,255,255,0.06)', 
              color: hovered ? '#fff' : project.accent,
              border: `1px solid ${project.accent}44`,
              fontWeight: 700, transition: '0.3s'
            }}>{t}</span>
          ))}
        </div>

        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#fff', textShadow: hovered ? `0 0 15px ${project.accent}88` : 'none', transition: '0.3s' }}>
          {project.title}
        </h3>
        
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>
          {project.subtitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 15 }}>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                <span style={{ color: project.accent, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Miembro</span>
                <span style={{ fontSize: 12, background: `${project.accent}22`, color: project.accent, padding: '4px 12px', borderRadius: '8px', fontWeight: 600 }}>{project.role}</span>
          </div>

          <div style={{ 
            width: 32, height: 32, borderRadius: 10, 
            background: hovered ? '#fff' : 'transparent',
            border: `1.5px solid ${hovered ? '#fff' : project.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s',
            transform: hovered ? 'rotate(45deg)' : 'rotate(0deg)'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: hovered ? 'rotate(-45deg)' : 'none', transition: '0.3s' }}>
              <path d="M7 17L17 7M17 7H7M17 7v10" stroke={hovered ? project.accent : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── HOME COMPLETO ──────────────────────────────────────────────────────────
export default function Home() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [filter, setFilter] = useState('Todos')
  
  const filters = ['Todos', 'Backend Developer', 'Frontend Developer', 'BaseDeDatos'];
  const filtered = filter === 'Todos' ? PROJECTS : PROJECTS.filter(p => p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())))

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true })
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
    logout()
    navigate('/login')
  }

  return (
    <div style={S.root}>
      <ParticleField />
      <FloatingMusic />

      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,77,77,0.08) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />

      <nav style={{ ...S.nav, background: scrolled ? 'rgba(10,14,23,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(25px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 15px #ff4d4d' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>MARCO.DEV</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
             <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginRight: 15 }}>Hola, <b>{usuario?.nombre}</b> 👋</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 24px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '0.3s' }}>Cerrar sesión</button>
        </div>
      </nav>

      <section style={S.hero}>
        <div style={{ ...S.heroInner, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(50px)', transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={S.gifWrapper}>
      <img 
        src="https://i.pinimg.com/originals/a1/0e/71/a10e71e4e4245d2952ad40850d0124b3.gif" 
        alt="Terminal Animation" 
        style={S.gifContent}
      />
    </div>
          <h1 style={S.heroTitle}>
            Full Stack<br />
            <span style={{ background: 'linear-gradient(90deg, #ff4d4d, #f9cb28, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', animation: 'hueRotate 10s infinite linear' }}>Innovation</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 40, fontWeight: 400 }}>
            Una página creativa donde exploramos ideas sin filtro: desde experimentos curiosos y proyectos
          </p>
          <button onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })} style={{ background: '#fff', color: '#000', border: 'none', padding: '18px 45px', borderRadius: 100, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 15px 30px rgba(255,255,255,0.2)', transition: '0.3s' }}>Ver Proyectos</button>
          <CyberpunkLine />
        </div>
      </section>

      <section id="projects" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, flexWrap: 'wrap', gap: 30 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: 0 }}>Proyectos_</h2>
          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 100, border: '1px solid rgba(255,255,255,0.05)' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ 
                padding: '10px 24px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '0.3s', 
                background: filter === f ? '#fff' : 'transparent', 
                color: filter === f ? '#000' : 'rgba(255,255,255,0.5)',
                border: 'none'
              }}>{f}</button>
            ))}
          </div>
        </div>

        <RayitoXD />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 35 }}>
          {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      </section>

      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} MARCO.DEV · Lima, Perú</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        body { margin: 0; background: #06060a; color: #fff; overflow-x: hidden; }

        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes hueRotate {
          from { filter: hue-rotate(0deg); }
          to { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const S = {
  root: { minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #111827 0%, #06060a 100%)', fontFamily: "'DM Sans', sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', transition: '0.4s' },
  hero: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' },
  heroInner: { maxWidth: 900 },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(50px, 10vw, 100px)', lineHeight: 0.9, letterSpacing: '-4px', marginBottom: 25 },
  gifWrapper: { 
    position: 'relative', 
    width: '140px', 
    height: '140px', 
    margin: '0 auto 30px', 
    borderRadius: '24px', 
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 0 30px rgba(255,77,77,0.15)'
  },
  gifContent: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    opacity: 0.9,
    filter: 'contrast(1.1) brightness(0.9)' 
  }
}