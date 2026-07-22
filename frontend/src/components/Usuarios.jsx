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
      .then(setUsuarios);
  }, [isAdmin]);

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

  return <>
    <h3>Usuarios</h3>
    <Button>
      <Link to={`/usuario`}>
        Agregar
      </Link>
    </Button>
    <table className="data-table"
    >
      <thead>
        <tr>
          <th>Nombre de usuario</th>
          <th>Nombre completo</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(usuario => <tr key={usuario.uuid}>
          <td>{usuario.username}</td>
          <td>{usuario.fullName}</td>
          <td>{usuario.email}</td>
          <td>{usuario.roles.join(", ")}</td>
          <td>
            <Button>
              <Link to={`/usuario/${usuario.uuid}`}>
                Editar
              </Link>
            </Button>
            <Button
              onClick={() => deleteUsuario(usuario.uuid)}
            >
              Eliminar
            </Button>
          </td>
        </tr>)}
      </tbody>
    </table>
  </>;
}