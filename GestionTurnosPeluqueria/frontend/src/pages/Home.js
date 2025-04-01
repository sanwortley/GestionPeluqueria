import React, { useState, useEffect } from 'react';
import { getTurnos, createTurno } from '../services/turnoService';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa los estilos
import './Home.css'; // Importa los estilos de la página

const Home = () => {
  const [turnos, setTurnos] = useState([]);  // Estado para almacenar los turnos
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [cliente, setCliente] = useState('');
  const [servicio, setServicio] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [confirmacionVisible, setConfirmacionVisible] = useState(false); // Estado para la confirmación
  const hoy = new Date();
  const semanaSiguiente = new Date();
  semanaSiguiente.setDate(hoy.getDate() + 13); // Fecha máxima es 13 días después

  // Llamada a la API para obtener los turnos
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const data = await getTurnos();  // Llamamos a la API para obtener los turnos
        if (Array.isArray(data)) {
          setTurnos(data); // Solo se actualiza si los datos son un arreglo
        } else {
          console.error('Los datos de turnos no son un arreglo:', data);
          setTurnos([]);  // En caso de error, inicializamos como un arreglo vacío
        }
      } catch (error) {
        console.error('Error al obtener los turnos:', error);
        setTurnos([]);  // En caso de error en la llamada, también inicializamos como un arreglo vacío
      }
    };
    fetchTurnos();
  }, [fechaSeleccionada]);

  // Función para manejar la selección de fechas
  const handleDateChange = (newDate) => {
    const nuevaFecha = newDate.toISOString().split('T')[0];
    setFechaSeleccionada(nuevaFecha);
    setModalVisible(true);
    actualizarHorariosDisponibles(nuevaFecha);
  };

  const actualizarHorariosDisponibles = (fechaSeleccionada) => {
    const horarios = [];
    let hora = 10;
    let minutos = 0;

    // Verificar que turnos no sea undefined o vacío
    const turnosDelDia = (turnos || []).filter(t => t.fecha === fechaSeleccionada).map(t => t.hora);

    for (let i = 0; i < 14; i++) {
      const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      const ahora = new Date(); // Hora actual
      const horaSeleccionada = new Date(fechaSeleccionada);
      horaSeleccionada.setHours(hora);
      horaSeleccionada.setMinutes(minutos);

      // Verificar si el horario ya ha pasado
      if (horaSeleccionada < ahora || turnosDelDia.includes(horaStr)) {
        continue; // No mostrar horarios pasados o ya reservados
      }

      horarios.push(horaStr);

      minutos += 45;
      if (minutos >= 60) {
        minutos = 0;
        hora++;
        if (hora === 14) hora = 14; // Salta a 14:45
        if (hora === 14 && minutos === 0) minutos = 45;
      }
    }

    setHorariosDisponibles(horarios);
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
    setTimeout(() => setMensajeExito(''), 8000); // Mostrar mensaje por 3 segundos

    // Limpiar el formulario
    setCliente('');
    setFechaSeleccionada('');
    setServicio('');
    setHorarioSeleccionado('');
    setHorariosDisponibles([]);
    setModalVisible(false);
    setConfirmacionVisible(false); // Cerrar la ventana de confirmación
  };

  const cancelarConfirmacion = () => {
    setConfirmacionVisible(false); // Cerrar la ventana emergente de confirmación
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
