# Sistema de Gestión de Turnos para Roma Cabello

Aplicación web completa para la gestión de turnos en la peluquería Roma, con autenticación de usuarios y panel de administración.

## Tecnologías Utilizadas

### Frontend
- React.js
- React Router
- Context API (para gestión de estado)
- Axios (para conexión con el backend)
- Bootstrap/CSS personalizado

 **Base de datos**: MongoDB (para almacenar turnos y usuarios)
- **Autenticación**: JWT (JSON Web Tokens)
- 
### Backend
- Node.js
- Express.js
- MongoDB (presumiblemente, por los modelos vistos)
- JWT (JSON Web Tokens para autenticación)
- Bcrypt (para encriptación de contraseñas)

## Instalación

## Instalar dependencias del backend:
```bash
cd backend
npm install
```

## Instalar dependencias del frontend:
```bash
cd ../frontend
npm install
```

## Configuración

1. Backend:
   - Crear un archivo `.env` en la carpeta backend con las siguientes variables:
   ```
   PORT=5000
   MONGODB_URI=tu_cadena_de_conexión_mongodb
   JWT_SECRET=tu_secreto_para_jwt
   ```

2. Frontend:
   - El frontend está configurado para conectarse al backend en `http://localhost:5000` por defecto.

## Ejecución

1. Iniciar el servidor backend:
```bash
cd backend
npm start
```

2. Iniciar la aplicación frontend (en otra terminal):
```bash
cd frontend
npm start
```

## Funcionalidades Principales

- Autenticación de usuarios (login/registro)
- Gestión de turnos (creación, visualización, modificación)
- Panel de administración (Dashboard)
- Página principal informativa (Home)
- Sistema de rutas protegidas

## Estructura del Proyecto

```
GestionTurnosPeluqueria/
├── backend/               # Código del servidor
│   ├── controllers/       # Lógica de los endpoints
│   ├── middleware/        # Middlewares (autenticación)
│   ├── models/            # Modelos de datos
│   ├── routes/            # Definición de rutas
│   └── server.js          # Punto de entrada del servidor
├── frontend/              # Aplicación React
│   ├── public/            # Assets públicos
│   └── src/               # Código fuente
│       ├── components/    # Componentes reutilizables
│       ├── context/       # Contexto de autenticación
│       ├── pages/         # Páginas principales
│       ├── services/      # Servicios API
│       └── utils/         # Utilidades
└── README.md              # Este archivo


## ¿Qué hace este proyecto?


## Para clientes:
- Visualizar los servicios disponibles
- Reservar turnos online
- Modificar o cancelar turnos existentes
- Recibir recordatorios de turnos

## Para administradores/peluqueros:
- Gestionar todos los turnos registrados
- Ver el calendario diario/semanal de citas
- Administrar la disponibilidad de horarios
- Gestionar los servicios ofrecidos
- Administrar los clientes registrados

### Funcionalidades técnicas:
- Sistema de autenticación seguro para clientes y administradores
- Panel de control para administración
- Reservas en tiempo real
- Notificaciones y recordatorios
- Historial de turnos por cliente

## ¿Por qué es útil?
- Reduce el trabajo manual de gestión de turnos
- Minimiza errores en las reservas
- Mejora la experiencia del cliente
- Optimiza el tiempo de los peluqueros
- Proporciona datos para analizar el negocio

## Próximas características (Roadmap):
- Integración con WhatsApp para notificaciones
- Sistema de fidelización de clientes
- Pasarela de pagos online
- Dashboard con métricas del negocio
```
