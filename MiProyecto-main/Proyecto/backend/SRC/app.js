const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// CONFIGURACIÓN FINAL DE CORS
app.use(cors({
  origin: 'https://proyecto-marco.vercel.app', // Tu URL de Vercel
  credentials: true
}));

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo y aceptando peticiones de Vercel`);
});