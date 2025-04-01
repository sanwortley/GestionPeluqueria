// src/services/turnoService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/turnos';

// Obtener turnos
export const getTurnos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los turnos', error);
  }
};

// Crear turno
export const createTurno = async (turnoData) => {
  try {
    const response = await axios.post(API_URL, turnoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el turno', error);
  }
};
