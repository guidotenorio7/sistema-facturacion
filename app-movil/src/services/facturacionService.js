import { API_URL } from './config';

const facturacionService = {
  // Crear una nueva factura
  async createInvoice(invoiceData, token) {
    try {
      if (!token) {
        throw new Error('Token no disponible. Por favor inicia sesión nuevamente.');
      }

      const response = await fetch(`${API_URL}/facturacion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.log('Error creating invoice:', error);
      return {
        success: false,
        error: error.message || 'Error al crear factura',
      };
    }
  },

  // Obtener historial de facturas del usuario
  async getInvoices(token, status = null) {
    try {
      if (!token) {
        throw new Error('Token no disponible. Por favor inicia sesión nuevamente.');
      }

      let endpoint = `${API_URL}/facturacion`;
      if (status) {
        endpoint += `?status=${status}`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.log('Error fetching invoices:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener facturas',
      };
    }
  },

  // Obtener estado de una factura específica
  async getInvoiceStatus(uuid, token) {
    try {
      if (!token) {
        throw new Error('Token no disponible. Por favor inicia sesión nuevamente.');
      }

      const response = await fetch(`${API_URL}/facturacion/${uuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.log('Error fetching invoice status:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener estado de factura',
      };
    }
  },

  // Eliminar una factura por UUID
  async deleteInvoice(uuid, token) {
    try {
      if (!token) {
        throw new Error('Token no disponible. Por favor inicia sesión nuevamente.');
      }

      const response = await fetch(`${API_URL}/facturacion/${uuid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.log('Error deleting invoice:', error);
      return { success: false, error: error.message || 'Error al eliminar factura' };
    }
  },

  // Construir URL pública para descargar el PDF de la factura (incluye token como query)
  getInvoicePdfUrl(uuid, token) {
    if (!token) return `${API_URL}/facturacion/${uuid}/pdf`;
    // Añadir token en query para permitir la descarga desde un navegador
    return `${API_URL}/facturacion/${uuid}/pdf?token=${encodeURIComponent(token)}`;
  },
};

export default facturacionService;
