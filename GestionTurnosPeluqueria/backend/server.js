// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurar dotenv
dotenv.config();

// Iniciar servidor
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Conectar a la base de datos
  await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));

  // Schemas y modelos
  const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['cliente', 'dueño'], default: 'cliente' },
  });

  usuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  const horariosSchema = new mongoose.Schema({
    lunes: [String],
    martes: [String],
    miercoles: [String],
    jueves: [String],
    viernes: [String],
    sabado: [String],
    domingo: [String],
  });

  const turnoSchema = new mongoose.Schema({
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    cliente: { type: String, required: true },
    servicio: { type: String, required: true },
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
  });

  const Usuario = mongoose.model('Usuario', usuarioSchema);
  const Horario = mongoose.model('Horario', horariosSchema);
  const Turno = mongoose.model('Turno', turnoSchema);

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

  // REGISTER
  app.post('/api/register', async (req, res) => {
    console.log("🟡 Datos recibidos en /api/register:", req.body);
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

  // LOGIN
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

    if (usuario.role === 'dueño') {
      const token = jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // ✅ Aquí se devuelve también el role para que el frontend lo valide correctamente
      res.json({
        token,
        role: usuario.role,
        nombre: usuario.nombre,
        email: usuario.email,
        id: usuario._id
      });
    } else {
      res.status(403).json({ message: 'No tienes permisos para acceder al dashboard' });
    }
  });

  app.get('/api/dashboard', verificarToken, async (req, res) => {
    if (req.usuarioRole !== 'dueño') return res.status(403).json({ message: 'Acceso denegado' });

    try {
      const turnos = await Turno.find();
      res.json(turnos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // TURNOS
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

    if (!fecha || !hora || !cliente || !servicio) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
      const nuevoTurno = new Turno({ fecha, hora, cliente, servicio, usuarioId });
      await nuevoTurno.save();
      res.status(201).json({ message: 'Turno creado exitosamente', turno: nuevoTurno });
    } catch (err) {
      res.status(500).json({ message: 'Error al crear el turno', error: err.message });
    }
  });

  // HORARIOS
  app.post("/api/horarios", async (req, res) => {
    try {
      const datos = req.body;
      let horarios = await Horario.findOne();

      if (!horarios) {
        horarios = new Horario(datos);
      } else {
        Object.assign(horarios, datos);
      }

      await horarios.save();
      res.json({ message: "Horarios guardados correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al guardar horarios" });
    }
  });

  app.get("/api/horarios", async (req, res) => {
    try {
      let horariosDoc = await Horario.findOne();

      if (!horariosDoc) {
        return res.json({
          lunes: [], martes: [], miercoles: [],
          jueves: [], viernes: [], sabado: [], domingo: []
        });
      }

      const { lunes, martes, miercoles, jueves, viernes, sabado, domingo } = horariosDoc;
      res.json({ lunes, martes, miercoles, jueves, viernes, sabado, domingo });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener horarios" });
    }
  });

  app.put('/api/horarios', async (req, res) => {
    try {
      const nuevosHorarios = req.body;

      const actualizado = await Horario.findOneAndUpdate(
        {},
        nuevosHorarios,
        { new: true }
      );

      res.json({ mensaje: 'Horarios actualizados correctamente', actualizado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar los horarios' });
    }
  });

  app.delete('/api/turnos/:id', async (req, res) => {
    try {
      const { id } = req.params;

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

  // Iniciar servidor
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

startServer().catch(err => console.error(err));
