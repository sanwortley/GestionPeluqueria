import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


const Dashboard = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);


  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page'); // Limpiar al salir
    };
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchTurnos();
    }
  }, [navigate]);

  const fetchTurnos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/turnos', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener turnos');
      }
      const data = await response.json();

      // Ordenar los turnos por fecha y hora
      const turnosOrdenados = data.sort((a, b) => {
        const fechaA = new Date(`${a.fecha} ${a.hora}`);
        const fechaB = new Date(`${b.fecha} ${b.hora}`);
        return fechaA - fechaB; // Orden ascendente
      });

      setTurnos(turnosOrdenados);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarTurno = async (_id) => {
    console.log(`Intentando eliminar el turno con ID: ${_id}`); // Para depuración
  
    try {
      const response = await fetch(`http://localhost:5000/api/turnos/${_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error al eliminar el turno: ${errorMessage}`);
      }
  
      // Actualizar la lista de turnos sin el eliminado
      setTurnos(prevTurnos => prevTurnos.filter(turno => turno._id !== _id));
      console.log('Turno eliminado correctamente');
    } catch (error) {
      console.error(error);
    }
  };
  
  
  

  return (
    <div className="dashboard-container">
  <img src="/clientes.jpg" alt="Logo" className="dashboard-logo" />
  <div className="turnos-container">
    <table className="turnos-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Hora</th>
          <th>Servicio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {turnos.length > 0 ? (
          turnos.map((turno) => (
            <tr key={turno._id}>
              <td>{turno.cliente}</td>
              <td>{turno.fecha}</td>
              <td>{turno.hora}</td>
              <td>{turno.servicio}</td>
              <td>
              <button className="delete-button"onClick={() => eliminarTurno(turno._id)}
              >
                    <i className="fa-solid fa-trash"></i>
              </button>

              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No hay turnos agendados</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

    
  );
};

export default Dashboard;
