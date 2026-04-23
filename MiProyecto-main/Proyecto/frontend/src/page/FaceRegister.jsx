import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useFaceApi } from '../hooks/useFaceApi';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const FaceRegister = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const modelsLoaded = useFaceApi();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Coloca tu rostro frente a la cámara');
  const [camReady, setCamReady] = useState(false);

  // ✅ FIX: videoConstraints sin facingMode para compatibilidad con cámara de celular
  const videoConstraints = {
    width: 640,
    height: 640,
  };

  // Malla facial en tiempo real
  useEffect(() => {
    let interval;
    if (modelsLoaded && webcamRef.current) {
      interval = setInterval(async () => {
        if (!webcamRef.current?.video || webcamRef.current.video.readyState !== 4) return;
        const video = webcamRef.current.video;
        if (video.videoWidth === 0) return;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
          .withFaceLandmarks();
        if (detection) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawFaceLandmarks(canvas, faceapi.resizeResults(detection, displaySize));
        } else {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  const startListening = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Tu navegador no soporta voz. Usa Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // captura una frase y para

    setStatus(`🎙️ Habla ahora: "${field}"...`);

    let captured = false;

    recognition.onresult = (e) => {
      captured = true;
      let text = e.results[0][0].transcript.trim().toLowerCase().replace(/\s+/g, '');
      console.log('Texto reconocido:', text);
      if (field === 'nombre') setUserName(text);
      if (field === 'email') setEmail(text.includes('@') ? text : `${text}@gmail.com`);
      if (field === 'password') setPassword(text);
      setStatus(`✓ Capturado: "${text}"`);
      recognition.stop();
    };

    recognition.onerror = (e) => {
      console.error('Error de voz:', e.error);
      if (e.error === 'not-allowed') {
        setStatus('❌ Permite el micrófono en el navegador');
      } else if (e.error === 'no-speech') {
        setStatus('No te escuché, presiona 🎙️ y habla rápido');
      } else if (e.error === 'network') {
        setStatus('❌ Error de red — Chrome necesita internet para voz');
      } else {
        setStatus(`Error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      if (!captured) {
        setStatus('No te escuché, presiona 🎙️ e intenta de nuevo');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('No se pudo iniciar:', err);
      setStatus('Error al iniciar micrófono');
    }
  };

  const handleRegister = async () => {
    if (!userName || !email || !password) return setStatus('Completa todos los campos');
    setStatus('Capturando rostro...');
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const img = await faceapi.fetchImage(imageSrc);
      // ✅ FIX: especificar TinyFaceDetector, igual que en el resto del código
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) {
        setStatus('Registrando identidad...');
        await axios.post('http://localhost:4000/api/auth/register', {
          nombre: userName, email, password,
          faceDescriptor: JSON.stringify(Array.from(detection.descriptor))
        });
        setStatus('Identidad registrada ✓');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStatus('No se detectó rostro, inténtalo de nuevo');
      }
    } catch {
      setStatus('Error al registrar');
    }
  };

  if (!modelsLoaded) return (
    <div style={styles.loading}>
      <div style={styles.loadingDot} />
      <span style={styles.loadingText}>Iniciando sistema biométrico...</span>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoMark}>CF</div>
          <h1 style={styles.title}>Registro Facial</h1>
          <p style={styles.subtitle}>Vincula tu identidad biométrica</p>
        </div>

        {/* Cámara */}
        <div style={styles.cameraSection}>
          <div style={{
            ...styles.cameraRing,
            boxShadow: camReady
              ? '0 0 0 3px #e8472a, 0 0 40px rgba(232,71,42,0.15)'
              : '0 0 0 3px #e0d9d0',
          }}>
            {/* ✅ FIX: videoConstraints + onUserMedia + canvas sin scale */}
            <Webcam
              ref={webcamRef}
              muted
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => setCamReady(true)}
              onUserMediaError={() => setStatus('Sin acceso a cámara')}
              style={styles.webcam}
            />
            <canvas ref={canvasRef} style={styles.canvas} />
            <div style={{...styles.corner, top: 8, left: 8, borderTop: '2px solid #e8472a', borderLeft: '2px solid #e8472a'}} />
            <div style={{...styles.corner, top: 8, right: 8, borderTop: '2px solid #e8472a', borderRight: '2px solid #e8472a'}} />
            <div style={{...styles.corner, bottom: 8, left: 8, borderBottom: '2px solid #e8472a', borderLeft: '2px solid #e8472a'}} />
            <div style={{...styles.corner, bottom: 8, right: 8, borderBottom: '2px solid #e8472a', borderRight: '2px solid #e8472a'}} />
          </div>

          <p style={{
            ...styles.statusText,
            color: status.includes('✓') ? '#16a34a' : status.includes('Error') || status.includes('No se') ? '#dc2626' : '#78716c'
          }}>
            {status}
          </p>
        </div>

        {/* Campos */}
        <div style={styles.fields}>
          {[
            { key: 'nombre', label: 'Nombre', value: userName, set: setUserName, type: 'text' },
            { key: 'email', label: 'Correo electrónico', value: email, set: setEmail, type: 'email' },
            { key: 'password', label: 'Contraseña', value: password, set: setPassword, type: 'password' },
          ].map(({ key, label, value, set, type }) => (
            <div key={key} style={styles.fieldRow}>
              <input
                type={type}
                value={value}
                placeholder={label}
                onChange={(e) => set(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={() => startListening(key)}
                style={styles.micBtn}
                title={`Dictar ${label}`}
              >
                🎙️
              </button>
            </div>
          ))}
        </div>

        <button onClick={handleRegister} style={styles.primaryBtn}>
          Vincular identidad
        </button>

        <div style={styles.footer}>
          <Link to="/login" style={styles.footerLink}>¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#faf8f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Georgia', serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  bgCircle1: {
    position: 'fixed', top: '-200px', right: '-200px',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,71,42,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'fixed', bottom: '-150px', left: '-150px',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,71,42,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px', height: '44px',
    background: '#e8472a',
    color: '#fff',
    borderRadius: '12px',
    fontFamily: "'Georgia', serif",
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '12px',
    letterSpacing: '1px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#9e9589',
    margin: 0,
  },
  cameraSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
  },
  cameraRing: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    background: '#f5f0eb',
    transition: 'box-shadow 0.4s ease',
  },
  webcam: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  canvas: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: '16px', height: '16px',
  },
  statusText: {
    fontSize: '12px',
    letterSpacing: '0.2px',
    margin: 0,
    fontFamily: 'monospace',
    transition: 'color 0.3s',
    textAlign: 'center',
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  fieldRow: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '13px 44px 13px 16px',
    borderRadius: '12px',
    border: '1px solid #e5e0d8',
    background: '#faf8f5',
    fontSize: '14px',
    color: '#1a1a1a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  micBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: '#e8472a',
    color: '#fff',
    border: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    fontFamily: 'inherit',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    paddingTop: '18px',
    borderTop: '1px solid #f0ebe3',
  },
  footerLink: {
    color: '#e8472a',
    fontSize: '13px',
    textDecoration: 'none',
  },
  loading: {
    minHeight: '100vh',
    background: '#faf8f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  loadingDot: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    border: '3px solid #e8472a',
    borderTopColor: 'transparent',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#9e9589',
    fontSize: '14px',
    fontFamily: "'Georgia', serif",
  },
};

export default FaceRegister;
