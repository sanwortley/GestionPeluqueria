const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    req.user = usuario; // Guarda el usuario en el request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Nuevo middleware para verificar rol de dueño
const requireDueno = (req, res, next) => {
  if (req.user.rol !== 'dueño') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de dueño' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireDueno,
};
