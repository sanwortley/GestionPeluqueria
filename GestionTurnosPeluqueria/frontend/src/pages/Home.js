import React, { useState, useEffect } from 'react';
import { getTurnos, createTurno } from '../services/turnoService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa los estilos
import './Home.css'; // Importa los estilos de la página
//import logo from '../public/romacabellobyn.png  '; // Importa el logo de la aplicación

const Home = () => {
  const [turnos, setTurnos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEspecialVisible, setModalEspecialVisible] = useState(false);
  const [cliente, setCliente] = useState('');
  const [servicio, setServicio] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);

  const hoy = new Date();
  const semanaSiguiente = new Date();
  semanaSiguiente.setDate(hoy.getDate() + 13);

  const cancelarConfirmacion = () => {
    setConfirmacionVisible(false);
  };

  useEffect(() => {
    if (fechaSeleccionada) {
      const fetchTurnos = async () => {
        try {
          const data = await getTurnos();
          console.log("Turnos obtenidos:", data); // 🔹 Verifica en consola
  
          if (Array.isArray(data)) {
            setTurnos(data);
          } else {
            console.error('Los datos de turnos no son un arreglo:', data);
            setTurnos([]);
          }
        } catch (error) {
          console.error('Error al obtener los turnos:', error);
          setTurnos([]);
        }
      };
      fetchTurnos();
    }
  }, [fechaSeleccionada]);

  const handleDateChange = (newDate) => {
    const nuevaFecha = newDate.toISOString().split('T')[0]; 
    setFechaSeleccionada(nuevaFecha);
  
    const fechaSeleccionadaDate = new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()));
    const diaSeleccionado = fechaSeleccionadaDate.getUTCDay();
  
    console.log("📆 Fecha seleccionada:", nuevaFecha, "Día (getUTCDay()):", diaSeleccionado);
  
    if (diaSeleccionado === 0 || diaSeleccionado === 6) {
      console.log("🛑 Es fin de semana, mostrando modal especial...");
      setModalEspecialVisible(true);
      setModalVisible(false);  
      console.log("Estado modal especial después de set:", modalEspecialVisible);
      return;  
    }
  
    setModalEspecialVisible(false);
    setModalVisible(true);
    actualizarHorariosDisponibles(nuevaFecha);
  };
  
  

  const actualizarHorariosDisponibles = (fechaSeleccionada) => {
    const horarios = [];
    const turnosDelDia = (turnos || []).filter(t => t.fecha === fechaSeleccionada).map(t => t.hora);
    const ahora = new Date();
    const fechaSeleccionadaDate = new Date(fechaSeleccionada + "T00:00:00"); // 🔹 Convertir a Date
    
    let hora = 10;
    let minutos = 0;
  
    while (hora < 13) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const horaSeleccionada = new Date(fechaSeleccionadaDate);
      horaSeleccionada.setHours(hora, minutos, 0, 0);  
  
      // ✅ Corrección: Si la fecha es hoy, comparar solo la hora
      if (
        (fechaSeleccionadaDate.getTime() !== ahora.setHours(0, 0, 0, 0) || horaSeleccionada.getTime() > ahora.getTime()) &&
        !turnosDelDia.includes(horaStr)
      ) {
        horarios.push(horaStr);
      }
  
      minutos += 45;
      if (minutos >= 60) {
        minutos -= 60;
        hora++;
      }
    }
  
    hora = 15;
    minutos = 0;
    while (hora < 21) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const horaSeleccionada = new Date(fechaSeleccionadaDate);
      horaSeleccionada.setHours(hora, minutos, 0, 0);
  
      if (
        (fechaSeleccionadaDate.getTime() !== ahora.setHours(0, 0, 0, 0) || horaSeleccionada.getTime() > ahora.getTime()) &&
        !turnosDelDia.includes(horaStr)
      ) {
        horarios.push(horaStr);
      }
  
      minutos += 45;
      if (minutos >= 60) {
        minutos -= 60;
        hora++;
      }
    }
  
    setHorariosDisponibles(horarios);
  };

  const handleHorarioClick = (hora) => {
    setHorarioSeleccionado(hora); // Actualiza el estado con el horario seleccionado
  };
  
  
  
  
  const handleReservarClick = () => {
    if (esFormularioValido()) {
      setConfirmacionVisible(true);
    } else {
      alert("Por favor, completa todos los campos antes de continuar.");
    }
  };
  
  
  const confirmarTurno = async () => {
    if (!horarioSeleccionado || !cliente || !servicio) return;
  
    // Validación de que no se pueda crear turno en fin de semana
    const fechaSeleccionadaDate = new Date(fechaSeleccionada);
    const diaSeleccionado = fechaSeleccionadaDate.getDay(); // 0 es domingo, 6 es sábado
  
    if (diaSeleccionado === 0 || diaSeleccionado === 6) {
      alert('No se pueden crear turnos los fines de semana.');
      setConfirmacionVisible(false); // Cerrar la ventana de confirmación
      return;
    }
  
    // Crear el turno
    await createTurno({ cliente, fecha: fechaSeleccionada, hora: horarioSeleccionado, servicio });
    setMensajeExito('¡Turno creado correctamente!');
  
    // Esperar 3 segundos antes de limpiar el formulario y cerrar el modal
    setTimeout(() => {
      setMensajeExito(''); // Limpiar el mensaje de éxito
      setCliente(''); // Limpiar el nombre del cliente
      setFechaSeleccionada(''); // Limpiar la fecha seleccionada
      setServicio(''); // Limpiar el servicio seleccionado
      setHorarioSeleccionado(''); // Limpiar el horario seleccionado
      setHorariosDisponibles([]); // Limpiar los horarios disponibles
      setModalVisible(false); // Cerrar el modal de creación de turno
      setConfirmacionVisible(false); // Cerrar la ventana de confirmación
    }, 3000); // 3 segundos
  
    // Cerrar la ventana de confirmación inmediatamente después de confirmar el turno
    setConfirmacionVisible(false); // Esta línea cierra la ventana de confirmación después de crear el turno
  };
  
  // Función para determinar si el día es un fin de semana (sábado o domingo)
  const esFinDeSemana = (fecha) => {
    const dia = new Date(fecha).getDay(); // 0 es domingo, 6 es sábado
    return dia === 0 || dia === 6; // Retorna true si es fin de semana
  };

  // Estilo personalizado para cada día
  const tileClassName = ({ date }) => {
    // Si es un fin de semana, aplica un color gris
    if (esFinDeSemana(date)) {
      return 'fin-de-semana';
    }
    // Si no es un fin de semana (lunes a viernes), aplica color negro
    return 'dia-laborable';
  };

  const esFormularioValido = () => {
    return cliente.trim() !== "" && servicio.trim() !== "" && horarioSeleccionado;
  };
  

  return (
    <div className="main-content">
  {/* Imagen en lugar del título */}
  <img src="/romacabellonyb.png" alt="Roma Cabello" className="logo" />

  {/* Calendario */}
  <div className="calendar-container">
    <Calendar
      onChange={handleDateChange}
      value={hoy}
      view="month"
      minDate={hoy}  
      maxDate={semanaSiguiente}  
      tileClassName={tileClassName}  
    />
  </div>

  {/* Modal con el formulario para crear un turno */}
  {modalVisible && fechaSeleccionada && (
    <div className="disponibilidad-overlay">
      <div className="disponibilidad-modal">
        <h2>Turno para {fechaSeleccionada}</h2>
        <button className="close-button" onClick={() => setModalVisible(false)}>×</button>

        <div className="horarios-container">
          {horariosDisponibles.length > 0 ? (
            horariosDisponibles.map((hora) => (
              <button
                key={hora}
                className={`horario-button ${horarioSeleccionado === hora ? "seleccionado" : ""}`}
                onClick={() => handleHorarioClick(hora)}
              >
                {hora}
              </button>
            ))
          ) : (
            <p>No hay horarios disponibles</p>
          )}
        </div>

        {/* Mostrar formulario solo si se seleccionó un horario */}
        {horarioSeleccionado && (
          <form className="turno-form">
            <input 
              type="text" 
              placeholder="Nombre del Cliente" 
              value={cliente} 
              onChange={(e) => setCliente(e.target.value)} 
              required 
            />

            <select 
              value={servicio} 
              onChange={(e) => setServicio(e.target.value)} 
              required
            >
              <option value="">Seleccionar Servicio</option>
              <option value="Corte de Pelo">Corte de Pelo</option>
            </select>

            <button 
              type="button" 
              onClick={handleReservarClick} 
              disabled={!esFormularioValido()} 
            >
              Reservar
            </button>
          </form>
        )}

        {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}
      </div>
    </div>
  )}

  {/* Modal especial para sábados y domingos (🚨 MOVIDO AQUÍ 🚨) */}
  {modalEspecialVisible && (
    <div className="modal-especial-overlay">
      <div className="modal-especial-content">
        <p>⚠️ Sábados y domingos son para turnos especiales.</p>
        <p>📞 Comunicate con +54 9 351 542 7973</p>
        <button onClick={() => setModalEspecialVisible(false)}>Cerrar</button>
      </div>
    </div>
  )}

  {/* Ventana emergente de confirmación */}
  {confirmacionVisible && (
    <div className="modal-confirmacion">
      <div className="modal-content">
        <h3>¿Confirmar el turno?</h3>
        <p>Cliente: {cliente}</p>
        <p>Fecha: {fechaSeleccionada}</p>
        <p>Hora: {horarioSeleccionado}</p>
        <p>Servicio: {servicio}</p>
        <button onClick={confirmarTurno}>Confirmar</button>
        <button onClick={cancelarConfirmacion}>Cancelar</button>
      </div>
    </div>
  )}
</div>

  );
  
  
};

export default Home;
