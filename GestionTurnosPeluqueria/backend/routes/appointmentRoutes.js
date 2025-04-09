const express = require('express');
const router = express.Router();
const { authMiddleware, requireDueno } = require('../middleware/authMiddleware');

// Ruta protegida
router.get('/dashboard', authMiddleware, requireDueno, (req, res) => {
  res.json({ message: 'Bienvenido al dashboard, dueño' });
});

module.exports = router;
