import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingSpotify() {
  const [isOpen, setIsOpen] = useState(false);
  // Puedes cambiar este ID por cualquier track o playlist de Spotify
  const [trackId, setTrackId] = useState('4f995874287f4c9c'); 

  return (
    <div style={{ position: 'fixed', zIndex: 9999, bottom: 30, right: 30 }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: -10 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              style={S.playerContainer}
            >
              {/* Widget de Spotify elegante */}
              <iframe 
                src={`https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0`} 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                style={{ borderRadius: '12px' }}
              ></iframe>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Círculo flotante animado */}
        <motion.div
          drag
          dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          style={S.floatingCircle}
        >
          {/* Icono de Spotify simple */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.301c-.216.354-.678.463-1.032.247-2.863-1.748-6.465-2.144-10.707-1.176-.405.093-.812-.162-.905-.567-.093-.404.162-.812.567-.905 4.647-1.064 8.622-.61 11.831 1.347.353.217.463.679.246 1.034zm1.464-3.256c-.272.441-.847.58-1.288.308-3.276-2.012-8.269-2.596-12.143-1.42-.497.151-1.025-.131-1.176-.628-.151-.497.131-1.025.628-1.176 4.417-1.341 9.914-.688 13.67 1.62.442.271.58.846.309 1.288zm.136-3.414c-3.929-2.333-10.414-2.548-14.184-1.403-.603.183-1.248-.168-1.431-.771-.183-.603.168-1.248.771-1.431 4.331-1.315 11.498-1.062 16.002 1.611.541.321.721 1.021.4 1.562-.321.541-1.021.721-1.558.432z"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

const S = {
  floatingCircle: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: '#1DB954', // Color oficial de Spotify
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(29, 185, 84, 0.4)',
    border: 'none'
  },
  playerContainer: {
    width: '300px',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(15px)',
    borderRadius: '16px',
    padding: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '15px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  }
};