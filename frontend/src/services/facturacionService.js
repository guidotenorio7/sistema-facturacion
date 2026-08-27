import { getJson, postJson, patch, deleteItem, headers as apiHeaders } from '../libs/api.js';

export async function listInvoices() {
  const response = await getJson('/facturacion');
  return {
    success: true,
    data: Array.isArray(response) ? response : response?.data || [],
  };
}

export async function createInvoice(invoice) {
  const response = await postJson('/facturacion', invoice);
  return {
    success: true,
    data: response?.data || response,
  };
}

export async function createInvoiceWeb(invoice) {
  const response = await postJson('/facturacion', invoice);
  return {
    success: true,
    data: response?.data || response,
  };
}

export async function deleteInvoice(uuid) {
  await deleteItem('/facturacion', { path: uuid });
  return { success: true };
}

export async function updateInvoiceStatus(uuid, status) {
  const response = await patch(`/facturacion/${uuid}/status`, { status }, { json: true });
  return response?.data || response;
}

export async function downloadInvoicePdf(uuid) {
  const authHeader = apiHeaders.Authorization || (() => {
    try {
      const s = localStorage.getItem('session');
      if (!s) return null;
      const parsed = JSON.parse(s);
      return parsed.token ? `Bearer ${parsed.token}` : null;
    } catch { return null; }
  })();

  const response = await fetch(`/api/facturacion/${uuid}/pdf`, {
    method: 'GET',
    credentials: 'include',
    headers: authHeader ? { Authorization: authHeader } : undefined,
  });

  if (!response.ok) throw new Error('No se pudo obtener el PDF');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${uuid}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return { success: true };
}
