// turnoService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/turnos'; // Cambia esta URL por la de tu API

export const getTurnos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los turnos:', error);
    return [];
  }
};

export const createTurno = async (turno) => {
  try {
    const response = await axios.post(API_URL, turno);
    return response.data;  // Devuelve la respuesta de la creación del turno
  } catch (error) {
    console.error('Error al crear el turno:', error);
    throw error;  // Lanza el error para que pueda ser manejado por el componente
  }
};
