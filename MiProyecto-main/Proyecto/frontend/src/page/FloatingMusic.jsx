import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function FloatingMusic() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')); // Cambia por tu URL

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ position: 'fixed', zIndex: 9999, bottom: 30, right: 30 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        {/* Barra de control que se expande */}
        <motion.div
          initial={false}
          animate={{ 
            width: isOpen ? 220 : 0, 
            opacity: isOpen ? 1 : 0,
            x: isOpen ? -10 : 0 
          }}
          style={{
            background: 'rgba(20, 20, 25, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '100px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            padding: isOpen ? '0 20px' : 0,
            border: '1px solid rgba(255, 77, 77, 0.3)',
            overflow: 'hidden',
            color: '#fff'
          }}
        >
          <button 
            onClick={togglePlay}
            style={S.playBtn}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div style={{ fontSize: '10px', marginLeft: '10px', whiteSpace: 'nowrap' }}>
            {isPlaying ? 'REPRODUCIENDO...' : 'PAUSADO'}
          </div>
        </motion.div>

        {/* Círculo flotante arrastrable */}
        <motion.div
          drag
          dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          style={S.floatingCircle}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

const S = {
  floatingCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff4d4d 0%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3), 0 0 15px rgba(255, 77, 77, 0.4)',
  },
  playBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0
  }
};