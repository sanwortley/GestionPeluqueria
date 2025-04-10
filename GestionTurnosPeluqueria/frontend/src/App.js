import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';


function App() {
  return (
    <Router>  
      {/* Coloca Navbar fuera de las rutas para que siempre se muestre */}
      <Navbar />  
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      </Routes>
    </Router>
  );
}

export default App;

