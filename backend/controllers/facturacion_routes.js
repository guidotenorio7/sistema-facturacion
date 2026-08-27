import { FacturacionController } from './facturacion.js';
import { checkForPermission } from '../middlewares/authorization_middleware.js';

export function facturacion(app) {
  // Crear factura (usuario, operador, admin)
  app.post(
    '/facturacion',
    checkForPermission('invoice.create'),
    FacturacionController.createInvoice
  );

  // Obtener estado de una factura (usuario, operador, admin)
  app.get(
    '/facturacion/:uuid',
    checkForPermission('invoice.view'),
    FacturacionController.getInvoiceStatus
  );

  // Marcar una factura como revisada sin eliminarla
  app.patch(
    '/facturacion/:uuid/status',
    checkForPermission('invoice.update'),
    FacturacionController.updateInvoiceStatus
  );

  // Listar facturas del usuario (usuario, operador, admin)
  app.get(
    '/facturacion',
    checkForPermission('invoice.list'),
    FacturacionController.listInvoices
  );

  // Descargar/obtener PDF de una factura
  app.get(
    '/facturacion/:uuid/pdf',
    checkForPermission('invoice.export'),
    FacturacionController.getInvoicePdf
  );

  // Eliminar factura (solo admin por permisos)
  app.delete(
    '/facturacion/:uuid',
    checkForPermission('invoice.delete'),
    FacturacionController.deleteInvoice
  );
}
