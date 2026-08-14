import { Link } from 'react-router-dom';
import useSession from './Session.jsx';

const shortcuts = [
  { title: 'Facturas', description: 'Consulta y gestiona tus comprobantes.', path: '/facturas' },
  { title: 'Usuarios', description: 'Administra personas y permisos.', path: '/usuarios' },
  { title: 'Acerca de', description: 'Conoce más sobre la plataforma.', path: '/about' },
];

export default function Home() {
  const session = useSession();

  return (
    <div className="home-shell animate-content">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">Panel principal</p>
          <h2>Hola, {session.user?.fullName || 'usuario'} 👋</h2>
          <p>Tu espacio de facturación y administración listo para trabajar desde cualquier dispositivo.</p>
        </div>
        <div className="home-hero-badge">Movil • Rápido • Claro</div>
      </section>

      <section className="home-grid">
        {shortcuts.map((item) => (
          <Link key={item.title} className="home-card" to={item.path}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}