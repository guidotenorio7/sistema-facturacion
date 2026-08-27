import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createInvoice, deleteInvoice, listInvoices, updateInvoiceStatus, downloadInvoicePdf } from '../services/facturacionService.js';
import { useSnackbar } from './Snackbar.jsx';

const emptyItem = () => ({ description: '', unitPrice: '', quantity: '1' });

const initialForm = {
  seriesNumber: '',
  issueDate: '',
  issuerName: '',
  issuerTaxId: '',
  receiverName: '',
  receiverTaxId: '',
  description: '',
  taxPercent: '',
  items: [emptyItem()],
};

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const snackbar = useSnackbar();

  async function loadFacturas() {
    try {
      const result = await listInvoices();
      if (result.success) {
        setFacturas(result.data || []);
      }
    } catch {
      snackbar.enqueue('No se pudieron cargar las facturas', { variant: 'error' });
    }
  }

  useEffect(() => {
    loadFacturas();
  }, []);

  function updateItem(index, field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      items: currentForm.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  }

  function addItem() {
    setForm((currentForm) => ({
      ...currentForm,
      items: [...currentForm.items, emptyItem()],
    }));
  }

  function removeItem(index) {
    setForm((currentForm) => {
      if (currentForm.items.length === 1) {
        return { ...currentForm, items: [emptyItem()] };
      }

      return {
        ...currentForm,
        items: currentForm.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  }

  const invoiceItems = form.items
    .map((item) => ({
      description: item.description.trim(),
      quantity: parseInt(item.quantity, 10) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
    }))
    .filter((item) => item.description || item.quantity > 0 || item.unitPrice > 0);

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxPercent = parseFloat(form.taxPercent) || 0;
  const taxAmount = taxPercent > 0 ? parseFloat(((subtotal * taxPercent) / 100).toFixed(2)) : 0;
  const total = parseFloat((subtotal + taxAmount).toFixed(2));

  async function handleSubmit(event) {
    event.preventDefault();

    if (invoiceItems.length === 0 || invoiceItems.some((item) => !item.description.trim() || item.unitPrice <= 0)) {
      snackbar.enqueue('Completa el detalle y el precio unitario de cada producto', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const normalizedItems = invoiceItems.map((item) => ({
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        subtotal: parseFloat(((item.quantity || 1) * item.unitPrice).toFixed(2)),
      }));

      const invoiceDescription = form.description.trim() || normalizedItems.map((item) => item.description).join(', ');

      await createInvoice({
        seriesNumber: form.seriesNumber || undefined,
        issueDate: form.issueDate || undefined,
        issuer: { name: form.issuerName || undefined, taxId: form.issuerTaxId || undefined },
        receiver: { name: form.receiverName || undefined, taxId: form.receiverTaxId || undefined },
        description: invoiceDescription,
        items: normalizedItems,
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
    } catch {
      snackbar.enqueue('No se pudo eliminar la factura', { variant: 'error' });
    }
  }

  async function handleStatusChange(factura) {
    const nextStatus = factura.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateInvoiceStatus(factura.uuid, nextStatus);
      snackbar.enqueue(nextStatus === 'completed' ? 'Factura marcada como revisada' : 'Factura pendiente restaurada', { variant: 'success' });
      await loadFacturas();
    } catch (error) {
      snackbar.enqueue(error.message || 'No se pudo actualizar la factura', { variant: 'error' });
    }
  }

  const visibleFacturas = facturas.filter((factura) => showCompleted || factura.status !== 'completed');

  return (
    <div className="home-shell animate-content">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">Facturación</p>
          <h2>Gestiona tus facturas</h2>
          <p>Organiza tus comprobantes, revisa los pendientes y conserva todo tu historial.</p>
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
          placeholder="Nombre receptor"
          value={form.receiverName}
          onChange={(event) => setForm({ ...form, receiverName: event.target.value })}
        />
        <input
          placeholder="CUIT/CUIL receptor"
          value={form.receiverTaxId}
          onChange={(event) => setForm({ ...form, receiverTaxId: event.target.value })}
        />

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          {form.items.map((item, index) => (
            <div key={`item-${index}`} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 0.8fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input
                placeholder="Detalle"
                value={item.description}
                onChange={(event) => updateItem(index, 'description', event.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio unitario"
                value={item.unitPrice}
                onChange={(event) => updateItem(index, 'unitPrice', event.target.value)}
              />
              <input
                type="number"
                min="1"
                placeholder="Cant."
                value={item.quantity}
                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
              />
              {form.items.length > 1 && (
                <button type="button" className="danger-button" onClick={() => removeItem(index)}>
                  Quitar
                </button>
              )}
            </div>
          ))}
          <button type="button" className="button" onClick={addItem}>
            Agregar otro producto
          </button>
        </div>

        <input
          type="number"
          placeholder="Porcentaje impuesto (ej: 21)"
          value={form.taxPercent}
          onChange={(event) => setForm({ ...form, taxPercent: event.target.value })}
        />

        <div style={{ margin: '0.75rem 0' }}>
          <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
        </div>
        <div style={{ margin: '0.75rem 0' }}>
          <strong>Impuesto:</strong> ${taxAmount.toFixed(2)}
        </div>
        <div style={{ margin: '0.75rem 0', fontSize: '1.1rem' }}>
          <strong>Total:</strong> ${total.toFixed(2)}
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear factura'}
        </button>
      </form>

      <section className="home-summary">
        <div className="invoice-list-header">
          <div>
            <h3>Comprobantes</h3>
            <p>Marca como revisada una factura para retirarla de pendientes.</p>
          </div>
          <label className="check-control">
            <input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} />
            Mostrar revisadas
          </label>
        </div>
        {visibleFacturas.length === 0 ? (
          <div className="home-summary-row">
            <div>
              <strong>{facturas.length ? 'Todo al día' : 'No hay facturas'}</strong>
              <p>{facturas.length ? 'No tienes comprobantes pendientes de revisar.' : 'Aún no hay comprobantes registrados en la base de datos.'}</p>
            </div>
          </div>
        ) : (
          visibleFacturas.map((factura) => {
            const items = Array.isArray(factura.items) && factura.items.length > 0
              ? factura.items
              : [{ description: factura.description || 'Factura', quantity: factura.quantity || 1, unitPrice: factura.taxableBase || factura.amount || 0 }];

            const itemSummary = items
              .map((item) => `${item.description || 'Producto'} • $${Number(item.unitPrice || 0).toFixed(2)} x ${Number(item.quantity || 1)}`)
              .join(' | ');

            return (
              <div className="home-summary-row" key={factura.uuid}>
                <div>
                  <strong>{factura.seriesNumber || factura.invoiceNumber || factura.uuid}</strong>
                  <p>{itemSummary}</p>
                  <small>{factura.description}</small>
                </div>
                <div className="home-summary-meta">
                  <span>${Number(factura.amount || 0).toFixed(2)}</span>
                  <small className={factura.status === 'completed' ? 'status-completed' : ''}>{factura.status === 'completed' ? 'Revisada' : (factura.status || 'Pendiente')}</small>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="check-button" type="button" onClick={() => handleStatusChange(factura)} aria-label={factura.status === 'completed' ? 'Restaurar factura pendiente' : 'Marcar factura como revisada'}>
                      {factura.status === 'completed' ? '↩ Restaurar' : '✓ Revisada'}
                    </button>
                    <button className="button" type="button" onClick={async () => {
                      try {
                        await downloadInvoicePdf(factura.uuid);
                        snackbar.enqueue('Descarga iniciada', { variant: 'success' });
                      } catch {
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
            );
          })
        )}
      </section>
    </div>
  );
}
