const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

// ✅ REGISTER
const register = async (req, res) => {
  const { nombre, email, password, faceDescriptor } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO usuarios (nombre, email, password, face_descriptor) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, faceDescriptor || null],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El email ya está registrado' });
          }
          return res.status(500).json({ message: 'Error al registrar usuario' });
        }
        res.status(201).json({ message: 'Usuario registrado correctamente' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ LOGIN MANUAL
const login = async (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en BD' });
    if (results.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const usuario = results[0];
    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'VENTO_SECRET_KEY',
      { expiresIn: '24h' }
    );

    res.cookie('token', token, { httpOnly: true, secure: false });
    res.json({ message: 'Login exitoso', nombre: usuario.nombre });
  });
};

// ✅ LOGIN BIOMÉTRICO
const loginBiometrico = async (req, res) => {
  const { faceDescriptor } = req.body;
  const loginDescriptor = JSON.parse(faceDescriptor);

  db.query(
    'SELECT id, nombre, email, face_descriptor FROM usuarios WHERE face_descriptor IS NOT NULL',
    (err, users) => {
      if (err) return res.status(500).json({ message: 'Error en BD' });

      let usuarioEncontrado = null;
      const umbralSimilitud = 0.45;

      for (const user of users) {
        const dbDescriptor = JSON.parse(user.face_descriptor);
        const distancia = Math.sqrt(
          dbDescriptor.reduce((sum, val, i) => sum + Math.pow(val - loginDescriptor[i], 2), 0)
        );
        if (distancia < umbralSimilitud) {
          usuarioEncontrado = user;
          break;
        }
      }

      if (usuarioEncontrado) {
        const token = jwt.sign(
          { id: usuarioEncontrado.id, email: usuarioEncontrado.email },
          process.env.JWT_SECRET || 'VENTO_SECRET_KEY',
          { expiresIn: '24h' }
        );
        res.cookie('token', token, { httpOnly: true, secure: false });
        return res.json({
          message: `Bienvenido ${usuarioEncontrado.nombre}`,
          usuario: usuarioEncontrado.nombre
        });
      }

      res.status(401).json({ message: 'Rostro no reconocido' });
    }
  );
};

// ✅ LOGOUT
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
};

// ✅ VERIFICAR TOKEN (para AuthContext)
const verificar = (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'No autenticado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'VENTO_SECRET_KEY');
    db.query('SELECT id, nombre, email FROM usuarios WHERE id = ?', [decoded.id], (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
      res.json({ usuario: results[0].nombre });
    });
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = { register, login, loginBiometrico, logout, verificar };