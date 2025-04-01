// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Componente para envolver la app y proporcionar el contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto en componentes
export const useAuth = () => useContext(AuthContext);
