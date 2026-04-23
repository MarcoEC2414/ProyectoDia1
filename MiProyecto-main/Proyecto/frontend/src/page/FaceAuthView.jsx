import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CyberpunkLine from "./CyberpunkLine"; // Importación corregida para misma carpeta

export default function FaceAuthView() {
  const navigate = useNavigate();

  // URL del video para el trolleo
  const TROLL_LINK = "https://www.youtube.com/watch?v=lf4iOF6sVY0"; // Cámbialo por el del gemido

  // Animación de sacudida (Shake) para el efecto de error
  const shakeAnimation = {
    x: [0, -5, 5, -5, 5, 0],
    y: [0, 2, -2, 2, -2, 0],
    transition: { duration: 0.4, repeat: Infinity }
  };

  return (
    <div style={S.container}>
      {/* Capa de ruido visual estático */}
      <div style={S.noiseOverlay} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        style={S.card}
      >
        <div style={S.header}>
          <motion.div 
            animate={{ 
              backgroundColor: ['#00ff41', '#ff0000', '#00ff41'],
              boxShadow: ['0 0 5px #00ff41', '0 0 20px #ff0000', '0 0 5px #00ff41']
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={S.statusDot} 
          />
          <span style={S.statusText}>CRITICAL_SYSTEM_ERROR // REALIDAD_NULL</span>
        </div>

        <div style={S.displayArea}>
          {/* Imagen con efecto glitch y filtro de color invertido aleatorio */}
          <motion.img 
            src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZueGZueGZueGZueGZueGZueGZueGZueGZueGZueGZueGZueCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxxcaNnU1u8/giphy.gif" 
            alt="Glitch" 
            animate={shakeAnimation}
            style={S.glitchImg}
          />
          
          {/* Escáner de interferencia horizontal */}
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            style={S.interferenceLine}
          />
        </div>

        <div style={S.infoBox}>
          <h2 style={S.title}>ZONA <span style={S.glitchText}>GLITCH</span></h2>
          <p style={S.subtitle}>"Advertencia: El kernel ha dejado de existir"</p>
          
          <div style={S.randomStats}>
            <motion.span 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ duration: 0.05, repeat: Infinity }}
            >
              MEM_LEAK: 0x000F3
            </motion.span>
            <span>USUARIO: {Math.random() > 0.5 ? 'ADMIN' : 'GUEST_666'}</span>
          </div>
        </div>

        {/* BOTÓN DE TROLLEO */}
        <button 
          onClick={() => { window.location.href = TROLL_LINK; }} 
          style={S.backBtn}
          onMouseEnter={(e) => {
            e.target.style.background = '#ff0000';
            e.target.style.color = 'black';
            e.target.style.boxShadow = '0 0 20px #ff0000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'white';
            e.target.style.boxShadow = 'none';
          }}
        >
          FORCE_TERMINATE.EXE
        </button>
        
        {/* Línea decorativa con color alterado */}
        <div style={{ marginTop: '25px', width: '100%', filter: 'invert(1) hue-rotate(180deg)' }}>
            <CyberpunkLine />
        </div>
      </motion.div>
    </div>
  );
}

const S = {
  container: {
    minHeight: '100vh',
    background: '#050505',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Courier New", Courier, monospace'
  },
  noiseOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("https://media.giphy.com/media/oEI9uWUic9S2A/giphy.gif")',
    opacity: 0.03,
    pointerEvents: 'none',
    zIndex: 1
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#000',
    border: '3px solid #1a1a1a',
    padding: '35px',
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
    boxShadow: '15px 15px 0px #ff0000'
  },
  displayArea: {
    position: 'relative',
    width: '100%',
    height: '200px',
    margin: '25px 0',
    background: '#080808',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  glitchImg: {
    height: '90%',
    filter: 'contrast(2) brightness(1.2) sepia(100%) hue-rotate(90deg)',
  },
  interferenceLine: {
    position: 'absolute',
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 0 10px white',
    zIndex: 3
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    borderBottom: '1px solid #1a1a1a',
    paddingBottom: '10px'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '2px'
  },
  statusText: {
    fontSize: '11px',
    color: '#fff',
    letterSpacing: '1px'
  },
  title: {
    fontSize: '38px',
    color: '#fff',
    margin: '15px 0 5px 0',
    fontWeight: '900',
    letterSpacing: '-2px'
  },
  glitchText: {
    color: '#ff0000',
    textShadow: '2px 2px #00ffff'
  },
  subtitle: {
    fontSize: '13px',
    color: '#444',
    marginBottom: '20px'
  },
  randomStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#00ff41',
    textTransform: 'uppercase',
    marginTop: '10px'
  },
  backBtn: {
    background: 'transparent',
    border: '2px solid #fff',
    color: '#fff',
    padding: '15px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
    transition: 'all 0.1s steps(2)'
  }
};