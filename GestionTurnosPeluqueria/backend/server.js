// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurar dotenv para cargar las variables de entorno
dotenv.config();

// Crear una aplicación de Express
const app = express();

// Middleware para parsear datos JSON
app.use(express.json());

// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Conectar a la base de datos de MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB correctamente');
  })
  .catch((err) => {
    console.error('Error de conexión a MongoDB:', err);
  });

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
  usuario: {
    type: String,
    unique: true,  // Si no es necesario, puedes eliminar esta restricción
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

// Crear el modelo de Usuario
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Definir el esquema de Turno
const turnoSchema = new mongoose.Schema({
  fecha: {
    type: String,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  cliente: {
    type: String,
    required: true,
  },
  servicio: {
    type: String,
    required: true,
  },
});

// Crear el modelo de Turno
const Turno = mongoose.model('Turno', turnoSchema);

// Ruta para crear un usuario predeterminado (solo para pruebas)
app.post('/api/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  const usuarioExistente = await Usuario.findOne({ email });
  if (usuarioExistente) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }

  const usuario = new Usuario({
    nombre,
    email,
    password, // La contraseña será encriptada automáticamente en el middleware
  });

  try {
    await usuario.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Error al crear el usuario:', err); // Aquí se muestra el error detallado
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
});


// Ruta para obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();  // Obtener todos los usuarios
    res.json(usuarios);  // Enviar la respuesta con los usuarios
  } catch (err) {
    res.status(400).json({ message: 'Error al obtener los usuarios' });
  }
});

// Ruta para login y generar JWT
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Buscar el usuario en la base de datos
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  // Comparar la contraseña
const isMatch = await bcrypt.compare(password, usuario.password);
if (!isMatch) {
  return res.status(400).json({ message: 'Contraseña incorrecta' });
}


  // Crear y firmar el JWT
  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Middleware para verificar el token de autenticación
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
};

// Ruta para obtener los turnos (protegida por JWT)
app.get('/api/turnos', verificarToken, async (req, res) => {
  try {
    const turnos = await Turno.find();  // Obtener todos los turnos
    res.json(turnos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('API Running');
});

// Configurar el puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
