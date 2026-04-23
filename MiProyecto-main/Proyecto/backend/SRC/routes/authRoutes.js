const express = require('express');
const router = express.Router();
const { register, login, logout, loginBiometrico, verificar } = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/login-biometrico', loginBiometrico);
router.get('/verificar', verificar);

module.exports = router;