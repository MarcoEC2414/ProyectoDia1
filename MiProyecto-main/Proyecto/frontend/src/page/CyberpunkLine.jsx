import { motion } from 'framer-motion';
import { useState } from 'react';

// --- IMPORTAMOS TU PATO LOCAL ---
// Asegúrate de haber renombrado el archivo a 'pato.gif' en la carpeta assets
import patoGif from '../assets/projects/personaje.gif'; 

export default function CyberpunkLine() {
  const [direction, setDirection] = useState(1);

  // Ajustes de tamaño del pato
  const config = {
    speed: 6, // Segundos en cruzar
    patoScale: 2.5, // Ajusta este número si se ve muy grande o chico
  };

  return (
    <div style={S.container}>
      {/* Contenedor que mueve al pato de lado a lado */}
      <motion.div
        animate={{ x: ['-10vw', '110vw'] }}
        transition={{
          duration: config.speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
          onRepeat: () => setDirection(d => -d)
        }}
        style={{
          ...S.wrapper,
          // Escala dinámica para girar al personaje
          scaleX: direction * config.patoScale, 
          scaleY: config.patoScale
        }}
      >
        {/* Aquí mostramos tu GIF del Pato */}
        <img 
          src={patoGif} 
          alt="Pato corriendo" 
          style={{ height: '60px', display: 'block' }} // Ajusta la altura si es necesario
        />
      </motion.div>
      
      {/* Línea de suelo neón ajustada (Verde y Morado) */}
      <div style={S.floor} />
    </div>
  );
}

const S = {
  container: {
    width: '100%',
    height: '140px',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '60px', // Espacio con el botón
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-end', // El personaje y la línea se alinean abajo
    zIndex: 2,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    // --- NUEVO: ALINEACIÓN VERTICAL PREZISA ---
    bottom: '22%', // Un poco más arriba de la línea para pisarla
    zIndex: 3,
    // Mantiene el pixel art nítido
    imageRendering: 'pixelated',
  },
  floor: {
    position: 'absolute',
    // --- NUEVO: ALINEACIÓN VERTICAL PREZISA ---
    bottom: '20%', // Pasa exactamente bajo los pies
    width: '100%',
    height: '2px', // Más gruesa para el glow
    zIndex: 1,
    // Colores Neón (Verde y Morado psicodélico)
    background: 'linear-gradient(90deg, transparent, #a855f7, #a855f7, #10b981, transparent)',
    boxShadow: '0 0 15px rgba(168, 85, 247, 0.6)',
  }
};