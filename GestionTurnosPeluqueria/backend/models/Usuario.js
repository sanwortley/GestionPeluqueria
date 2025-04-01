// models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el esquema de Usuario (para login)
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});


// Encriptar la contraseña antes de guardarla
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Comparar la contraseña al hacer login
usuarioSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Crear el modelo de Usuario
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
