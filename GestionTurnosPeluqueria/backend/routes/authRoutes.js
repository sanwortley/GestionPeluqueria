// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Importar el modelo de Usuario

const router = express.Router();

// Ruta para login y generar JWT
router.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;

  // Buscar el usuario en la base de datos por el campo 'usuario'
  const usuarioDb = await Usuario.findOne({ usuario });
  if (!usuarioDb) {
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  // Comparar la contraseña
  const isMatch = await bcrypt.compare(password, usuarioDb.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Contraseña incorrecta' });
  }

  // Crear y firmar el JWT
  const token = jwt.sign({ id: usuarioDb._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;
