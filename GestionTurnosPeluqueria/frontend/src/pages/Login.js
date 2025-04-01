import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Llamada al backend para verificar el login
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      // Si el login es exitoso, guardar el token y redirigir
      localStorage.setItem('token', response.data.token); // Guardar el token en localStorage
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (err) {
      // Si hay un error, mostrarlo
      setError(err.response?.data?.message || 'Error al hacer login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar sesión</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
