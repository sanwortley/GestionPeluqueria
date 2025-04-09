import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutaProtegida = ({ children }) => {
  const { auth } = useAuth();

  if (!auth || auth.role !== 'dueño') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RutaProtegida;
