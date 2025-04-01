import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Turnos() {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/turnos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTurnos(response.data);
      } catch (error) {
        console.error('Error al obtener turnos', error);
        alert('No se pudo obtener los turnos');
      }
    };

    fetchTurnos();
  }, []);

  return (
    <div>
      <h1>Mis Turnos</h1>
      <ul>
        {turnos.map((turno) => (
          <li key={turno._id}>{turno.fecha} - {turno.hora}</li>
        ))}
      </ul>
    </div>
  );
}

export default Turnos;
