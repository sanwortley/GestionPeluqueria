import React from 'react';
import './TurnoCard.css'; // Asegúrate de tener este archivo para los estilos

const TurnoCard = ({ turno }) => {
  return (
    <div className="turno-card">
      <div className="turno-card-header">
        <h3 className="turno-title">{turno.servicio}</h3>
        <p className="turno-cliente">Cliente: {turno.cliente}</p>
      </div>
      <div className="turno-card-body">
        <p className="turno-fecha">Fecha: {turno.fecha}</p>
        <p className="turno-hora">Hora: {turno.hora}</p>
      </div>
    </div>
  );
};

export default TurnoCard;
