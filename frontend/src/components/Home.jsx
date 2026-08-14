import { Link } from 'react-router-dom';
import useSession from './Session.jsx';
import { useEffect, useState } from 'react';
import { listInvoices } from '../services/facturacionService.js';

const shortcuts = [
  { title: 'Usuarios', description: 'Administra personas y permisos.', path: '/usuarios' },
  { title: 'Acerca de', description: 'Conoce más sobre la plataforma.', path: '/about' },
];

export default function Home() {
  const session = useSession();
  const [stats, setStats] = useState({ total: 0, pending: 0, amount: 0, recent: [] });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await listInvoices();
        if (!mounted) return;
        const items = res.data || [];
        const total = items.length;
        const pending = items.filter(i => i.status === 'pending').length;
        const amount = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
        const recent = items.slice(0, 5);
        setStats({ total, pending, amount, recent });
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => { mounted = false };
  }, []);

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
        <div className="home-summary-cards">
          <div className="stat-card">
            <strong>{stats.total}</strong>
            <small>Total facturas</small>
          </div>
          <div className="stat-card">
            <strong>{stats.pending}</strong>
            <small>Pendientes</small>
          </div>
          <div className="stat-card">
            <strong>${Number(stats.amount || 0).toFixed(2)}</strong>
            <small>Monto total</small>
          </div>
          <div className="stat-card actions-card">
            <Link className="button" to="/facturas">Ir a facturas</Link>
          </div>
        </div>
        {shortcuts.map((item) => (
          <Link key={item.title} className="home-card" to={item.path}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="home-recent">
        <h3>Recientes</h3>
        {stats.recent && stats.recent.length > 0 ? (
          <ul>
            {stats.recent.map(r => (
              <li key={r.uuid}>{r.seriesNumber || r.invoiceNumber || r.uuid} — {r.description} — ${Number(r.amount || 0).toFixed(2)}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#cbd5e1' }}>Sin facturas recientes</p>
        )}
      </section>
    </div>
  );
}