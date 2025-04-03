// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurar dotenv para cargar las variables de entorno
dotenv.config();

async function startServer() {
  // Crear la aplicación de Express
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Conectar a la base de datos
  await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));

  // Definir modelos
  const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Esto está bien
    password: { type: String, required: true },
    role: { type: String, enum: ['cliente', 'dueño'], default: 'cliente' },
  });
  usuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  const Usuario = mongoose.model('Usuario', usuarioSchema);

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
    usuarioId: {  // Aquí el usuarioId no debe ser obligatorio si es opcional
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Usuario',
      required: false,  // Esto permite que el campo sea opcional
    },
  });

  const Turno = mongoose.model('Turno', turnoSchema);

  // Rutas
  app.post('/api/register', async (req, res) => {
    console.log("🟡 Datos recibidos en /api/register:", req.body); // 👀 Verifica qué llega
  
    const { nombre, email, password } = req.body;
  
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
  
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
  
    const usuario = new Usuario({ nombre, email, password });
  
    try {
      await usuario.save();
      res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (err) {
      console.error('❌ Error al crear usuario:', err);
      res.status(500).json({ message: 'Error al crear usuario', error: err.message });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
  
    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
  
    // Solo si el rol es "dueño", se genera el token
    if (usuario.role === 'dueño') {
      const token = jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(403).json({ message: 'No tienes permisos para acceder al dashboard' });
    }
  });

  // Middleware para verificar token
  const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuarioRole = decoded.role;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Token inválido' });
    }
  };

  app.get('/api/dashboard', verificarToken, async (req, res) => {
    if (req.usuarioRole !== 'dueño') return res.status(403).json({ message: 'Acceso denegado' });

    try {
      const turnos = await Turno.find();
      res.json(turnos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
// Ruta para obtener todos los turnos (protegida por JWT)
app.get('/api/turnos', async (req, res) => { 
  try {
      const turnos = await Turno.find();  
      res.json(turnos);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
});

  app.post('/api/turnos', async (req, res) => {
    const { fecha, hora, cliente, servicio, usuarioId } = req.body;
  
    // Si no hay un usuarioId, puedes asignarlo a null o dejarlo vacío
    const turno = new Turno({
      fecha,
      hora,
      cliente,  // Asegúrate de que el cliente esté siempre presente
      servicio, // Asegúrate de que el servicio esté siempre presente
      usuarioId: usuarioId || null,  // Si no se pasa un usuarioId, se asigna null
    });
  
    try {
      await turno.save();
      res.status(201).json({ message: 'Turno reservado exitosamente' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


app.delete('/api/turnos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Convertir el ID a ObjectId de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
  
      return res.status(400).json({ error: 'ID inválido' });
    }

    const resultado = await Turno.findByIdAndDelete(new mongoose.Types.ObjectId(id));

    if (!resultado) {
      
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json({ mensaje: 'Turno eliminado correctamente' });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

  
  
  
  

  // Configurar el puerto y escuchar
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

// Iniciar el servidor
startServer().catch(err => console.error(err));
