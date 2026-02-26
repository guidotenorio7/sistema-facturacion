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

  // Listar facturas del usuario (usuario, operador, admin)
  app.get(
    '/facturacion',
    checkForPermission('invoice.list'),
    FacturacionController.listInvoices
  );
}
