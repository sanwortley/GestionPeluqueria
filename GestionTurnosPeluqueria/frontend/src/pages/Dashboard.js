import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');  // No necesitas otro <Router> aquí
    }
  }, [navigate]);

  return (
    <div>
      <h2>Bienvenido al Dashboard</h2>
    </div>
  );
};

export default Dashboard;
