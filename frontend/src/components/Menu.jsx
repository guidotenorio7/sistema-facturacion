import './Menu.css';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../libs/api.js';
import useSession from "./Session";

export default function Menu() {
  const session = useSession();
  const navigate = useNavigate();

  function logout(event) {
    event.preventDefault();
    localStorage.removeItem('session');
    delete api.headers.Authorization;
    session.setUser(null);
    session.setIsLoggedIn(false);
    navigate('/', { replace: true });
    window.location.reload();
  }

  return (
    <nav
      className="menu"
    >
      <ul>
        <li><Link to="/">Inicio</Link></li>
        {session.isLoggedIn && <>
          {session.user?.roles?.includes('admin') && <li><Link to="/usuarios">Usuarios</Link></li>}
          <li>
            <button className="menu-button" onClick={logout}>
              Salir
            </button>
          </li>
        </>}
        <li><Link to="/about">Acerca de</Link></li>
        <li><Link to="/contact">Contacto</Link></li>
      </ul>
    </nav>
  );
}