import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createInvoice, deleteInvoice, listInvoices, downloadInvoicePdf } from '../services/facturacionService.js';
import { useSnackbar } from './Snackbar.jsx';

const initialForm = {
  clientName: '',
  clientEmail: '',
  description: '',
  amount: '',
};

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();

  async function loadFacturas() {
    try {
      const result = await listInvoices();
      if (result.success) {
        setFacturas(result.data || []);
      }
    } catch (error) {
      snackbar.enqueue('No se pudieron cargar las facturas', { variant: 'error' });
    }
  }

  useEffect(() => {
    loadFacturas();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.clientName.trim() || !form.description.trim() || !form.amount) {
      snackbar.enqueue('Completa cliente, detalle y monto', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await createInvoice({
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        description: form.description,
        amount: Number(form.amount),
        quantity: 1,
      });
      snackbar.enqueue('Factura creada correctamente', { variant: 'success' });
      setForm(initialForm);
      await loadFacturas();
    } catch (error) {
      snackbar.enqueue(error.message || 'No se pudo crear la factura', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(uuid) {
    try {
      await deleteInvoice(uuid);
      snackbar.enqueue('Factura eliminada', { variant: 'success' });
      await loadFacturas();
    } catch (error) {
      snackbar.enqueue('No se pudo eliminar la factura', { variant: 'error' });
    }
  }

  return (
    <div className="home-shell animate-content">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">Facturación</p>
          <h2>Gestiona tus facturas</h2>
          <p>Las facturas se cargan desde la base de datos y puedes crear o eliminar registros.</p>
        </div>
        <Link className="button" to="/">
          Volver al inicio
        </Link>
      </section>

      <form className="invoice-form" onSubmit={handleSubmit}>
        <h3>Nueva factura</h3>
        <input
          placeholder="Cliente"
          value={form.clientName}
          onChange={(event) => setForm({ ...form, clientName: event.target.value })}
        />
        <input
          placeholder="Email (opcional)"
          value={form.clientEmail}
          onChange={(event) => setForm({ ...form, clientEmail: event.target.value })}
        />
        <input
          placeholder="Detalle"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <input
          type="number"
          placeholder="Monto"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear factura'}
        </button>
      </form>

      <section className="home-summary">
        {facturas.length === 0 ? (
          <div className="home-summary-row">
            <div>
              <strong>No hay facturas</strong>
              <p>Aún no hay comprobantes registrados en la base de datos.</p>
            </div>
          </div>
        ) : (
          facturas.map((factura) => (
            <div className="home-summary-row" key={factura.uuid}>
              <div>
                <strong>{factura.invoiceNumber || factura.uuid}</strong>
                <p>{factura.clientName}</p>
                <small>{factura.description}</small>
              </div>
              <div className="home-summary-meta">
                <span>${Number(factura.amount || 0).toFixed(2)}</span>
                <small>{factura.status || 'pending'}</small>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button className="button" type="button" onClick={async () => {
                    try {
                      await downloadInvoicePdf(factura.uuid);
                      snackbar.enqueue('Descarga iniciada', { variant: 'success' });
                    } catch (err) {
                      snackbar.enqueue('No se pudo descargar el PDF', { variant: 'error' });
                    }
                  }}>
                    Descargar
                  </button>
                  <button className="danger-button" type="button" onClick={() => handleDelete(factura.uuid)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
