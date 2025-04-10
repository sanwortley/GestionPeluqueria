import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default RutaProtegida;
