import React, { useEffect, useRef, useState } from 'react';
import personajeGif from '../assets/projects/personaje.gif';

const W = 900, H = 300;
const GROUND_Y = H - 60;
const DINO_W = 65, DINO_H = 65;
const HIT_W = 35, HIT_H = 50;

const DinoGame = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const loopRef = useRef(null); // ✅ referencia a la función loop para poder relanzarla
  const stateRef = useRef({
    running: true,
    score: 0,
    frame: 0,
    groundOffset: 0,
    dino: { x: 100, y: GROUND_Y - DINO_H, dy: 0, grounded: true, angle: 0 },
    obstacles: [],
    stars: [],
  });

  const [uiScore, setUiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [dinoRender, setDinoRender] = useState({ x: 100, y: GROUND_Y - DINO_H, angle: 0 });

  // ✅ restart relanza el loop correctamente
  const restart = () => {
    const s = stateRef.current;
    s.running = true;
    s.score = 0;
    s.frame = 0;
    s.groundOffset = 0;
    s.obstacles = [];
    s.dino = { x: 100, y: GROUND_Y - DINO_H, dy: 0, grounded: true, angle: 0 };
    setUiScore(0);
    setGameOver(false);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(loopRef.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // Init estrellas
    s.stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H - 80),
      w: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.4,
    }));

    const handleInput = (e) => {
      if (e.type === 'touchstart') e.preventDefault();
      const isJump = e.code === 'Space' || e.code === 'ArrowUp' || e.type === 'touchstart';
      if (!isJump) return;

      if (!s.running) {
        restart();
        return;
      }
      const dino = s.dino;
      if (dino.grounded) {
        dino.dy = -16;
        dino.grounded = false;
        dino.angle = -15;
      }
    };

    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    // ✅ loop guardado en ref para poder llamarlo desde restart()
    const loop = () => {
      const s = stateRef.current;
      if (!s.running) return; // para aquí pero restart() lo relanza

      const dino = s.dino;
      const speed = 9 + s.score * 0.18;

      // Física
      dino.dy += 0.9;
      dino.y += dino.dy;
      if (dino.y + DINO_H >= GROUND_Y) {
        dino.y = GROUND_Y - DINO_H;
        dino.dy = 0;
        dino.grounded = true;
        dino.angle = 0;
      } else {
        dino.grounded = false;
        dino.angle = Math.min(dino.angle + 1.2, 18);
      }

      // Fondo
      s.groundOffset = (s.groundOffset - speed) % 100;
      s.stars.forEach(star => { star.x -= speed * 2; if (star.x < 0) star.x = W; });

      // Obstáculos
      s.frame++;
      const interval = Math.max(55, 90 - s.score * 0.5);
      if (s.frame % Math.floor(interval) === 0) {
        const h = 35 + Math.random() * 35;
        s.obstacles.push({
          x: W, y: GROUND_Y - h,
          w: 22 + Math.random() * 12, h,
          color: s.score % 3 === 0 ? '#00f2fe' : s.score % 3 === 1 ? '#e8472a' : '#a855f7',
        });
      }

      const hitX = dino.x + (DINO_W - HIT_W) / 2;
      const hitY = dino.y + (DINO_H - HIT_H) / 2;
      let scored = false;

      s.obstacles = s.obstacles.filter(obs => {
        obs.x -= speed;
        if (hitX < obs.x + obs.w && hitX + HIT_W > obs.x && hitY < obs.y + obs.h && hitY + HIT_H > obs.y) {
          s.running = false;
          setGameOver(true);
          return false;
        }
        if (obs.x + obs.w < 0) { s.score++; scored = true; return false; }
        return true;
      });

      if (scored) setUiScore(s.score);

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Estrellas
      s.stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#fff';
        ctx.fillRect(star.x, star.y, star.w + speed * 1.5, 2);
      });
      ctx.globalAlpha = 1;

      // Suelo
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      for (let i = 0; i < 15; i++) {
        const lx = i * 100 + s.groundOffset;
        ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx - 50, H); ctx.stroke();
      }

      // Obstáculos
      s.obstacles.forEach(obs => {
        ctx.shadowBlur = 18; ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y, obs.w / 2, Math.PI, 0);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      setDinoRender({ x: dino.x, y: dino.y, angle: dino.angle });
      animRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = loop; // ✅ guardamos referencia
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', userSelect: 'none' }}>
      <h2 style={{ color: '#00f2fe', fontSize: '28px', marginBottom: '16px', textShadow: '0 0 10px #00f2fe', fontFamily: 'monospace', letterSpacing: 4 }}>
        PATOS SALVADOS: {uiScore}
      </h2>

      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,242,254,0.15), 0 20px 50px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ background: '#07070e', display: 'block' }} />

        <img
          src={personajeGif}
          alt="pato"
          style={{
            position: 'absolute',
            left: dinoRender.x,
            top: dinoRender.y,
            width: DINO_W,
            height: DINO_H,
            transform: `rotate(${dinoRender.angle}deg)`,
            pointerEvents: 'none',
            zIndex: 10,
            imageRendering: 'pixelated',
          }}
        />

        {gameOver && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 20, color: '#fff',
          }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#e8472a', fontFamily: 'monospace', letterSpacing: -2, marginBottom: 8 }}>
              ¡PATO CAÍDO!
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
              Score: {uiScore}
            </div>
            <button
              onClick={restart}
              style={{
                background: '#00f2fe', color: '#000', border: 'none',
                padding: '12px 36px', borderRadius: 100, fontSize: 14,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
                letterSpacing: 2, textTransform: 'uppercase',
              }}
            >
              Intentar de nuevo
            </button>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12, fontFamily: 'monospace' }}>
              o presiona ESPACIO
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: 2 }}>
        ESPACIO / ↑ para saltar · Toca la pantalla en móvil
      </div>
    </div>
  );
};

export default DinoGame;