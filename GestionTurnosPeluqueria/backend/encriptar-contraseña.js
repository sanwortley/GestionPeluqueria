const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario'); // Asegúrate de que la ruta sea correcta

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/turnos-peluqueria', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conectado a MongoDB');

    // Buscar el usuario por correo electrónico
    const usuario = await Usuario.findOne({ email: 'test@correo.com' });

    if (usuario) {
      console.log('Usuario encontrado:', usuario);

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash('1234', 10);

      // Actualizar la contraseña en la base de datos
      usuario.password = hashedPassword;
      await usuario.save();

      console.log('Contraseña actualizada correctamente');
      process.exit();
    } else {
      console.log('Usuario no encontrado');
      process.exit();
    }
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });
