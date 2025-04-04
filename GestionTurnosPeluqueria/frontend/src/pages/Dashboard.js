import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa"; // Importar el ícono de tacho de basura
import "./Dashboard.css";



const Dashboard = () => {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState([]);
  const [mostrarTurnos, setMostrarTurnos] = useState(false);
 
  
  const [horariosDisponibles, setHorariosDisponibles] = useState({
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  });

  const horarios = [
    "10:00", "10:45", "11:30", "12:15", "14:45", "15:30",
    "16:15", "17:00", "17:45", "18:30", "19:15", "20:00", "20:45"
  ];

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR');
  };
  const getDiaSemana = (fecha) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[new Date(fecha).getDay()];
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchTurnos();
      fetchHorariosDisponibles();
    }
  }, [navigate]);

  
  
  const fetchTurnos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/turnos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener turnos");
      const data = await response.json();
      setTurnos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHorariosDisponibles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/horarios", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener horarios");
      const data = await response.json();
      setHorariosDisponibles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleHorario = (dia, horario) => {
    setHorariosDisponibles((prev) => {
      const nuevosHorarios = { ...prev };
      nuevosHorarios[dia] = nuevosHorarios[dia].includes(horario)
        ? nuevosHorarios[dia].filter((h) => h !== horario)
        : [...nuevosHorarios[dia], horario];
      return nuevosHorarios;
    });
  };

  const guardarHorarios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/horarios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(horariosDisponibles),
      });

      if (!response.ok) throw new Error("Error al guardar horarios");
      alert("Horarios actualizados con éxito");
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarTurno = async (turnoId) => {
    const confirmado = window.confirm("¿Estás seguro de que querés eliminar este turno?");
    if (!confirmado) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/turnos/${turnoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) throw new Error("Error al eliminar en el servidor");
  
      // Eliminar el turno del estado local
      setTurnos(prevTurnos => prevTurnos.filter(turno => turno._id !== turnoId));
  
      alert("Turno eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      alert("Ocurrió un error al intentar eliminar el turno.");
    }
  };
  
  

  return (
    <div className="dashboard-container">
      <h2>{mostrarTurnos ? "Listado de Turnos" : "Configurar Horarios Disponibles"}</h2>

      <button className="toggle-button" onClick={() => setMostrarTurnos(!mostrarTurnos)}>
        {mostrarTurnos ? "Volver a Horarios" : "Ver Turnos"}
      </button>

      {mostrarTurnos ? (
        <div className="turnos-container">
          <table className="turnos-table">
  <thead>
    <tr>
      <th>Cliente</th>
      <th>Fecha</th>
      <th>Día</th>
      <th>Hora</th>
      <th>Servicio</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {turnos?.length > 0 ? (
      turnos.map((turno) => (
        <tr key={turno._id}>
          <td>{turno.cliente}</td>
          <td>{formatearFecha(turno.fecha)}</td>
          <td>{getDiaSemana(turno.fecha)}</td>
          <td>{turno.hora}</td>
          <td>{turno.servicio || "No especificado"}</td>
          <td>
            <button className="delete-button" onClick={() => eliminarTurno(turno._id)}>
              <FaTrash />
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6">No hay turnos disponibles</td>
      </tr>
    )}
  </tbody>
</table>

        </div>
      ) : (
        <div className="horarios-container">
          {Object.keys(horariosDisponibles).filter((dia) => dia !== "_id").map((dia) => (
            <div key={dia} className="dia-container">
              <h3>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
              <div className="checkbox-group">
                {horarios.map((horario) => (
                  <label key={horario} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={horariosDisponibles[dia]?.includes(horario) || false}
                      onChange={() => toggleHorario(dia, horario)}
                    />
                    {horario}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!mostrarTurnos && (
        <button className="save-button" onClick={guardarHorarios}>
          Guardar Horarios
        </button>

      )}
    </div>
  );
};

export default Dashboard;
