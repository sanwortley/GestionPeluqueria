import React, { useState, useEffect } from 'react';
import { getTurnos, createTurno } from '../services/turnoService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa los estilos
import './Home.css'; // Importa los estilos de la página

const Home = () => {
  const [turnos, setTurnos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
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
    const fetchTurnos = async () => {
      try {
        const data = await getTurnos();
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
  }, [fechaSeleccionada]);

  const handleDateChange = (newDate) => {
    const nuevaFecha = newDate.toISOString().split('T')[0];
    setFechaSeleccionada(nuevaFecha);
    setModalVisible(true);
    actualizarHorariosDisponibles(nuevaFecha);
  };

  const actualizarHorariosDisponibles = (fechaSeleccionada) => {
    const horarios = [];
    const turnosDelDia = (turnos || []).filter(t => t.fecha === fechaSeleccionada).map(t => t.hora); // Filtra los turnos del día seleccionado
    const ahora = new Date(); // Hora actual
    let hora = 10; // Empezamos a las 10 de la mañana
    let minutos = 0;
    
    // Horarios de la mañana de 10:00 a 13:00
    while (hora < 13) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const horaSeleccionada = new Date(fechaSeleccionada);
      horaSeleccionada.setHours(hora);
      horaSeleccionada.setMinutes(minutos);
  
      // Verifica que el horario no haya pasado y no esté reservado
      if (horaSeleccionada > ahora && !turnosDelDia.includes(horaStr)) {
        horarios.push(horaStr);
      }
  
      minutos += 45;  // Se suman 45 minutos después de cada turno
      if (minutos >= 60) {
        minutos -= 60;  // Restamos 60 minutos si sobrepasa una hora
        hora++;  // Aumentamos la hora en 1
      }
    }
  
    // Horarios de la tarde/noche de 15:00 a 21:00
    hora = 15; // Empezamos a las 15:00
    minutos = 0; // Reiniciamos los minutos para la tarde
    while (hora < 21) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const horaSeleccionada = new Date(fechaSeleccionada);
      horaSeleccionada.setHours(hora);
      horaSeleccionada.setMinutes(minutos);
  
      // Verifica que el horario no haya pasado y no esté reservado
      if (horaSeleccionada > ahora && !turnosDelDia.includes(horaStr)) {
        horarios.push(horaStr);
      }
  
      minutos += 45;  // Se suman 45 minutos después de cada turno
      if (minutos >= 60) {
        minutos -= 60;  // Restamos 60 minutos si sobrepasa una hora
        hora++;  // Aumentamos la hora en 1
      }
    }
  
    setHorariosDisponibles(horarios); // Actualiza el estado con los horarios disponibles
  };

  const handleHorarioClick = (hora) => {
    setHorarioSeleccionado(hora);
    setConfirmacionVisible(true); // Mostrar la ventana de confirmación
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

  // Validación para habilitar el botón de confirmar turno
  const esFormularioValido = () => {
    return cliente !== '' && servicio !== '' && horarioSeleccionado !== '';
  };

  return (
    <div className="main-content">
      <h1>Roma Cabello</h1>
  
      {/* Calendario */}
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={hoy}
          view="month"
          minDate={hoy}  // Fecha mínima es la actual
          maxDate={semanaSiguiente}  // Fecha máxima es 13 días después
          tileClassName={tileClassName}  // Asignamos el estilo a los días del calendario
        />
      </div>
  
      {/* Modal con el formulario para crear un turno */}
      {modalVisible && (
        <div className="disponibilidad-overlay">
          <div className="disponibilidad-modal">
            <h2>Crear Turno para {fechaSeleccionada}</h2>
            <button className="close-button" onClick={() => setModalVisible(false)}>X</button>
            
            <div className="horarios-container">
              {horariosDisponibles.length > 0 ? (
                horariosDisponibles.map((hora) => (
                  <button key={hora} className="horario-button" onClick={() => handleHorarioClick(hora)}>
                    {hora}
                  </button>
                ))
              ) : (
                <p>No hay horarios disponibles</p>
              )}
            </div>
  
            {horarioSeleccionado && (
              <form className="turno-form">
                <input 
                  type="text" 
                  placeholder="Nombre del Cliente" 
                  value={cliente} 
                  onChange={(e) => setCliente(e.target.value)} 
                  required 
                />
                
                <select value={servicio} onChange={(e) => setServicio(e.target.value)} required>
                  <option value="">Seleccionar Servicio</option>
                  <option value="Corte de Pelo">Corte de Pelo</option>
                </select>
                
                <button 
                  type="button" 
                  onClick={() => setConfirmacionVisible(true)} 
                  disabled={!esFormularioValido()} // Deshabilitar si no está todo completo
                >
                  Confirmar Turno
                </button>
              </form>
            )}
  
            {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}
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
