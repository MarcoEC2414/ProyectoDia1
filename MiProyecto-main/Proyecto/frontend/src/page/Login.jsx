import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'
import { useFaceApi } from '../hooks/useFaceApi'

function Login() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const modelsLoaded = useFaceApi()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isManual, setIsManual] = useState(false)
  const [status, setStatus] = useState('Acerca tu rostro al círculo')
  const [isProcessing, setIsProcessing] = useState(false)
  const [camReady, setCamReady] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const videoConstraints = {
    width: 640,
    height: 640,
  }

  useEffect(() => {
    let interval
    const scan = async () => {
      if (!modelsLoaded || !webcamRef.current?.video || isManual || isProcessing) return
      const video = webcamRef.current.video
      if (video.readyState !== 4 || video.videoWidth === 0) return

      try {
        const canvas = canvasRef.current
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        faceapi.matchDimensions(canvas, displaySize)

        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (detection && canvas) {
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          const resized = faceapi.resizeResults(detection, displaySize)
          faceapi.draw.drawFaceLandmarks(canvas, resized)
          setStatus('Rostro detectado — procesando...')
          if (detection.detection.score > 0.8) {
            handleBio(detection.descriptor)
          }
        } else {
          setStatus('Acerca tu rostro al círculo')
        }
      } catch (err) {
        // silencioso
      }
    }

    if (modelsLoaded && !isManual) {
      interval = setInterval(scan, 500)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [modelsLoaded, isManual, isProcessing])

  const handleBio = async (desc) => {
    setIsProcessing(true)
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login-biometrico', {
        faceDescriptor: JSON.stringify(Array.from(desc))
      }, { withCredentials: true })
      setStatus('Acceso concedido ✓')
      login({ nombre: res.data.usuario })
      navigate('/home')
    } catch {
      setStatus('Rostro no reconocido')
      setTimeout(() => {
        setIsProcessing(false)
        setStatus('Acerca tu rostro al círculo')
      }, 2500)
    }
  }

  if (!modelsLoaded) return (
    <div style={styles.loading}>
      <div style={styles.loadingDot} />
      <span style={styles.loadingText}>Iniciando sistema biométrico...</span>
    </div>
  )

  return (
    <div style={styles.page}>
      {/* Fondo decorativo */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        {/* Logo / Título */}
        <div style={styles.header}>
          <div style={styles.logoMark}>CF</div>
          <h1 style={styles.title}>CasaFusion</h1>
          <p style={styles.subtitle}>Acceso seguro con reconocimiento facial</p>
        </div>

        {/* Cámara */}
        {!isManual && (
          <div style={styles.cameraSection}>
            <div style={{
              ...styles.cameraRing,
              boxShadow: camReady
                ? '0 0 0 3px #e8472a, 0 0 40px rgba(232,71,42,0.2)'
                : '0 0 0 3px #e0d9d0',
            }}>
              {/* ✅ FIX: videoConstraints explícito + onUserMedia para saber cuando carga */}
              <Webcam
                ref={webcamRef}
                muted
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={() => setCamReady(true)}
                onUserMediaError={() => setStatus('Sin acceso a cámara')}
                style={styles.webcam}
              />
              {/* ✅ FIX: canvas superpuesto correctamente sin scale que rompe posición */}
              <canvas
                ref={canvasRef}
                style={styles.canvas}
              />
              {/* Esquinas decorativas */}
              <div style={{...styles.corner, top: 8, left: 8, borderTop: '2px solid #e8472a', borderLeft: '2px solid #e8472a'}} />
              <div style={{...styles.corner, top: 8, right: 8, borderTop: '2px solid #e8472a', borderRight: '2px solid #e8472a'}} />
              <div style={{...styles.corner, bottom: 8, left: 8, borderBottom: '2px solid #e8472a', borderLeft: '2px solid #e8472a'}} />
              <div style={{...styles.corner, bottom: 8, right: 8, borderBottom: '2px solid #e8472a', borderRight: '2px solid #e8472a'}} />
            </div>

            <p style={{
              ...styles.statusText,
              color: status.includes('✓') ? '#16a34a' : status.includes('no reconocido') ? '#dc2626' : '#78716c'
            }}>
              {status}
            </p>

            <button onClick={() => setIsManual(true)} style={styles.switchBtn}>
              Entrar con contraseña
            </button>
          </div>
        )}

        {/* Formulario manual */}
        {isManual && (
          <div style={styles.formSection}>
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
            />
            <button
              onClick={async () => {
                try {
                  const res = await axios.post('http://localhost:4000/api/auth/login', form, { withCredentials: true })
                  login({ nombre: res.data.nombre })
                  navigate('/home')
                } catch { alert('Credenciales incorrectas') }
              }}
              style={styles.primaryBtn}
            >
              Ingresar
            </button>
            <button onClick={() => setIsManual(false)} style={styles.linkBtn}>
              ← Usar reconocimiento facial
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <Link to="/register" style={styles.footerLink}>¿No tienes cuenta? Regístrate</Link>
        </div>
      </div>
    </div>
  )
}

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
    padding: '40px 36px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
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
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#9e9589',
    margin: 0,
    letterSpacing: '0.2px',
  },
  cameraSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  cameraRing: {
    width: '220px',
    height: '220px',
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
    fontSize: '13px',
    letterSpacing: '0.3px',
    transition: 'color 0.3s',
    margin: 0,
    fontFamily: 'monospace',
  },
  switchBtn: {
    background: 'none',
    border: '1px solid #e5e0d8',
    borderRadius: '100px',
    padding: '10px 24px',
    fontSize: '13px',
    color: '#78716c',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1px solid #e5e0d8',
    background: '#faf8f5',
    fontSize: '14px',
    color: '#1a1a1a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
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
    marginTop: '4px',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#9e9589',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '4px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '28px',
    paddingTop: '20px',
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
}

export default Login
