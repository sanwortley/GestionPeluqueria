import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ Importar el AuthContext
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Usar el hook del contexto

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      const data = response.data;

      // ✅ Verificar si el rol es dueño
      if (data.role === 'dueño') {
        localStorage.setItem('token', data.token);
        login(data); // ✅ Guardar usuario en contexto
        navigate('/dashboard');
      } else {
        setError('Acceso denegado. Solo los usuarios con rol "dueño" pueden acceder al dashboard.');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Error al hacer login');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/romacabellonyb.png" alt="Roma Cabello" className="login-logo" />
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
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
