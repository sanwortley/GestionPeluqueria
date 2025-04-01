
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';  // Importamos useLocation para obtener la ruta actual
import './Navbar.css'

const Navbar = () => {
  const location = useLocation();  // Obtiene la ruta actual
  const [activeLink, setActiveLink] = useState(location.pathname);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link 
            to="/" 
            className={`navbar-link ${activeLink === '/' ? 'active' : ''}`}
            onClick={() => setActiveLink('/')}
          >
            Inicio
          </Link>
        </li>
        <li className="navbar-item">
          <Link 
            to="/login" 
            className={`navbar-link ${activeLink === '/login' ? 'active' : ''}`}
            onClick={() => setActiveLink('/login')}
          >
            Gestion 
          </Link>
     
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
  