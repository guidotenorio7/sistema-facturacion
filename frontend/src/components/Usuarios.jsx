import { useState, useEffect } from 'react';
import * as userService from '../services/userService.js';
import Button from './Button.jsx';
import { Link } from 'react-router-dom';
import useModal from './Modal.jsx';
import { useSnackbar } from './Snackbar.jsx';
import useSession from './Session.jsx';

export default function Usuarios() {
  const session = useSession();
  const [usuarios, setUsuarios] = useState([]);
  const modal = useModal();
  const snackbar = useSnackbar();
  const isAdmin = session.user?.roles?.includes('admin');

  useEffect(() => {
    if (!isAdmin) {
      setUsuarios([]);
      return;
    }

    userService.get()
      .then(setUsuarios)
      .catch(() => snackbar.enqueue('No se pudieron cargar los usuarios', { variant: 'error' }));
  }, [isAdmin, snackbar]);

  function deleteUsuario(uuid) {
    modal.open(
      '¿Confirma que desea eliminar este usuario?',
      'Confirmar eliminación',
      {
        onYes: () => {
          userService.deleteUser(uuid)
            .then(() => {
              snackbar.enqueue('Usuario eliminado', { variant: 'success' });
              userService.get()
                .then(setUsuarios);
            })
            .catch(err => {
              snackbar.enqueue(`Error al eliminar el usuario: ${err.message}`, { variant: 'error' });
            });

          modal.close();
        },
      }
    );
  }

  if (!isAdmin) {
    return (
      <div className="access-denied-card">
        <h3>Acceso denegado</h3>
        <p>Usted no tiene acceso.</p>
      </div>
    );
  }

  return (
    <div className="home-shell animate-content">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">Usuarios</p>
          <h2>Listado de usuarios</h2>
          <p>Estos datos se cargan desde la base de datos del backend.</p>
        </div>
        <Button>
          <Link to="/usuario">
            Agregar
          </Link>
        </Button>
      </section>

      <section className="home-summary">
        {usuarios.map((usuario) => (
          <div className="home-summary-row" key={usuario.uuid}>
            <div>
              <strong>{usuario.fullName}</strong>
              <p>{usuario.username} • {usuario.email}</p>
              <small>{usuario.roles?.join(', ')}</small>
            </div>
            <div className="home-summary-meta">
              <Button>
                <Link to={`/usuario/${usuario.uuid}`}>
                  Editar
                </Link>
              </Button>
              <Button onClick={() => deleteUsuario(usuario.uuid)}>
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}