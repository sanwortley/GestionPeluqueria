import React, { useState, useEffect } from 'react';
import { createTurno, getTurnos } from '../services/turnoService';

const TurnoForm = () => {
  const [cliente, setCliente] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [servicio, setServicio] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [turnosOcupados, setTurnosOcupados] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const hoy = new Date();
  const semanaSiguiente = new Date();
  semanaSiguiente.setDate(hoy.getDate() + 14);

  // Función para verificar si el día seleccionado es un fin de semana
  const esFinDeSemana = (fechaSeleccionada) => {
    const dia = new Date(fechaSeleccionada).getDay();
    return dia === 6 || dia === 0; // 6 es sábado, 0 es domingo
  };

  useEffect(() => {
    const fetchTurnos = async () => {
      if (fecha) {
        const turnos = await getTurnos();
        const turnosDelDia = turnos.filter(t => t.fecha === fecha).map(t => t.hora);
        setTurnosOcupados(turnosDelDia);
      }
    };
    fetchTurnos();
  }, [fecha]);

  useEffect(() => {
    const generarHorarios = () => {
      const horarios = [];
      let hora = 10;
      let minutos = 0;
      
      for (let i = 0; i < 14; i++) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        if (!turnosOcupados.includes(horaStr)) {
          horarios.push(horaStr);
        }
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
    generarHorarios();
  }, [turnosOcupados]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente || !fecha || !hora || !servicio) return;
    await createTurno({ cliente, fecha, hora, servicio });
    setMensajeExito('¡Turno creado correctamente!');
    setTimeout(() => setMensajeExito(''), 3000); // Mostrar mensaje por 3 segundos
    setCliente('');
    setFecha('');
    setServicio('');
    setHora('');
    setHorariosDisponibles([]);
  };

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    // Asegurarse de que no se seleccionen fines de semana
    if (esFinDeSemana(nuevaFecha)) {
      alert('Los sábados y domingos no están disponibles. Selecciona un día de la semana.');
    } else {
      setFecha(nuevaFecha);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="turno-form">
      <h2>Crear Nuevo Turno</h2>
      <input 
        type="text" 
        placeholder="Nombre del Cliente" 
        value={cliente} 
        onChange={(e) => setCliente(e.target.value)} 
        required 
      />
      
      <input 
        type="date" 
        value={fecha} 
        onChange={handleFechaChange}  // Usamos la función que valida la fecha
        min={hoy.toISOString().split('T')[0]} 
        max={semanaSiguiente.toISOString().split('T')[0]} 
        required 
      />
      
      <select value={servicio} onChange={(e) => setServicio(e.target.value)} required>
        <option value="">Seleccionar Servicio</option>
        <option value="Corte de Pelo">Corte de Pelo</option>
        <option value="Tintura">Tintura</option>
        <option value="Peinado">Peinado</option>
      </select>
      
      <select value={hora} onChange={(e) => setHora(e.target.value)} required>
        <option value="">Seleccionar Horario</option>
        {horariosDisponibles.map((hora) => (
          <option key={hora} value={hora}>{hora}</option>
        ))}
      </select>
      
      <button type="submit">Reservar Turno</button>

      {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}
    </form>
  );
};

export default TurnoForm;
