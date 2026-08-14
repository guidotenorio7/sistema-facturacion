import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createInvoice, deleteInvoice, listInvoices, downloadInvoicePdf } from '../services/facturacionService.js';
import { useSnackbar } from './Snackbar.jsx';

const initialForm = {
  seriesNumber: '',
  issueDate: '',
  issuerName: '',
  issuerTaxId: '',
  receiverName: '',
  receiverTaxId: '',
  description: '',
  unitCost: '',
  quantity: '1',
  taxPercent: '',
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
    if (!form.description.trim() || !form.unitCost) {
      snackbar.enqueue('Completa detalle, costo unitario y cantidad', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const unitCost = parseFloat(form.unitCost) || 0;
      const quantity = parseInt(form.quantity, 10) || 1;
      const subtotal = parseFloat((unitCost * quantity).toFixed(2));
      const taxPercent = parseFloat(form.taxPercent) || 0;
      const taxAmount = taxPercent > 0 ? parseFloat(((subtotal * taxPercent) / 100).toFixed(2)) : 0;
      const total = parseFloat((subtotal + taxAmount).toFixed(2));

      await createInvoice({
        seriesNumber: form.seriesNumber || undefined,
        issueDate: form.issueDate || undefined,
        issuer: { name: form.issuerName || undefined, taxId: form.issuerTaxId || undefined },
        receiver: { name: form.receiverName || undefined, taxId: form.receiverTaxId || undefined },
        description: form.description,
        items: [{ description: form.description, quantity, unitPrice: unitCost, subtotal }],
        taxableBase: subtotal,
        taxes: taxAmount > 0 ? [{ name: 'IVA', rate: taxPercent, amount: taxAmount }] : [],
        amount: total,
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
          placeholder="Serie y número (ej: F-001-000123)"
          value={form.seriesNumber}
          onChange={(event) => setForm({ ...form, seriesNumber: event.target.value })}
        />
        <input
          type="date"
          placeholder="Fecha de emisión"
          value={form.issueDate}
          onChange={(event) => setForm({ ...form, issueDate: event.target.value })}
        />
        <input
          placeholder="Nombre emisor"
          value={form.issuerName}
          onChange={(event) => setForm({ ...form, issuerName: event.target.value })}
        />
        <input
          placeholder="CUIT/CUIL emisor"
          value={form.issuerTaxId}
          onChange={(event) => setForm({ ...form, issuerTaxId: event.target.value })}
        />
        <input
          placeholder="Detalle"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <input
          placeholder="Nombre receptor"
          value={form.receiverName}
          onChange={(event) => setForm({ ...form, receiverName: event.target.value })}
        />
        <input
          placeholder="CUIT/CUIL receptor"
          value={form.receiverTaxId}
          onChange={(event) => setForm({ ...form, receiverTaxId: event.target.value })}
        />
        <input
          type="number"
          placeholder="Costo unitario"
          value={form.unitCost}
          onChange={(event) => setForm({ ...form, unitCost: event.target.value })}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={form.quantity}
          onChange={(event) => setForm({ ...form, quantity: event.target.value })}
        />
        <input
          type="number"
          placeholder="Porcentaje impuesto (ej: 21)"
          value={form.taxPercent}
          onChange={(event) => setForm({ ...form, taxPercent: event.target.value })}
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
                <strong>{factura.seriesNumber || factura.invoiceNumber || factura.uuid}</strong>
                <p>Qty: {factura.quantity || 1} • ${Number((factura.taxableBase || 0)).toFixed(2)} c/u</p>
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
