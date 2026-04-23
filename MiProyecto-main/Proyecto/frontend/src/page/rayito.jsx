import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

// Variaciones de color cyberpunk
const neonColors = ['#ff4d4d', '#3b82f6', '#10b981', '#ffffff', '#ff4d4d'];

export default function RayitoXD() {
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();

  // El ancho de la línea depende del scroll (va de 0% a 80%)
  const widthScale = useTransform(scrollYProgress, [0, 0.4], ['0%', '80%']);

  // Animación infinita de glitch de color
  useEffect(() => {
    controls.start({
      borderColor: neonColors,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
        delay: Math.random() * 0.5, // Desfase aleatorio
      },
    });
  }, [controls]);

  return (
    <div style={S.container}>
      {/* Contenedor principal que se expande */}
      <motion.div
        style={{
          ...S.mainLine,
          width: widthScale, // Controlado por el scroll
        }}
        animate={controls} // Glitch de color
      >
        {/* Efecto de 'glow' o resplandor neón */}
        <div style={S.glowEffect} />
        
        {/* Puntos de glitch aleatorios que aparecen y desaparecen */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }}
          style={{ ...S.glitchPoint, left: '20%' }}
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.4, delay: 0.2 }}
          style={{ ...S.glitchPoint, left: '60%' }}
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.2, delay: 0.3 }}
          style={{ ...S.glitchPoint, left: '85%' }}
        />
      </motion.div>
    </div>
  );
}

const S = {
  container: {
    width: '100%',
    height: '2px', // Altura de la línea
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // Usamos el espacio vacío de tu imagen
    marginTop: '60px', 
    marginBottom: '60px',
    position: 'relative',
    zIndex: 2, // Por encima de las partículas, por debajo de los botones
  },
  mainLine: {
    height: '100%',
    background: '#fff',
    borderRadius: '2px',
    position: 'relative',
    // Estilo base de borde para la animación de color
    border: '0px solid transparent',
  },
  glowEffect: {
    position: 'absolute',
    inset: '-10px -20px', // Resplandor hacia afuera
    background: 'radial-gradient(circle, rgba(255,77,77,0.15) 0%, transparent 80%)',
    zIndex: -1,
    filter: 'blur(5px)',
  },
  glitchPoint: {
    position: 'absolute',
    top: '-4px', // Centrado verticalmente
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: neonColors[2], // Usamos el azul/verde para contraste
    boxShadow: `0 0 10px ${neonColors[2]}`,
  }
};