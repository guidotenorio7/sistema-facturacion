import { getDependency } from '../libs/dependencies.js';
import { InvalidArgumentException } from '../exceptions/invalid_arguments_exception.js';
import crypto from 'crypto';

export class FacturacionController {
  static async createInvoice(req, res) {
    try {
      // Extraer usuario del JWT (del middleware de autenticación)
      // Los datos están en req.session (no en req.user)
      const userId = req.session?.userId;
      const username = req.session?.username;

      if (!userId || !username) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const body = req.body;

      // Validar datos básicos requeridos para crear factura simple
      if (!body.clientName) {
        return res.status(400).json({ error: 'clientName es requerido' });
      }
      if (body.amount === undefined || body.amount === null) {
        return res.status(400).json({ error: 'amount es requerido' });
      }

      const InvoiceModel = getDependency('InvoiceModel');

      const items = Array.isArray(body.items) && body.items.length > 0
        ? body.items.map((item) => {
            const quantity = parseInt(item.quantity, 10) || 0;
            const unitPrice = parseFloat(item.unitPrice) || 0;
            return {
              description: item.description || body.description || 'Producto/Servicio',
              quantity,
              unitPrice,
              subtotal: parseFloat((quantity * unitPrice).toFixed(2)),
            };
          })
        : [
            {
              description: body.description || 'Producto/Servicio',
              quantity: parseInt(body.quantity, 10) || 1,
              unitPrice: parseFloat(body.amount) / (parseInt(body.quantity, 10) || 1),
              subtotal: parseFloat(body.amount),
            },
          ];

      const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      const total = subtotal + (parseFloat(body.taxAmount) || 0);
      const quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1;

      const invoiceData = {
        uuid: crypto.randomUUID(),
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        clientName: body.clientName,
        clientEmail: body.clientEmail || '',
        description: body.description || '',
        quantity,
        items,
        createdBy: username,
        // Datos AFIP con valores por defecto para factura simple
        pointOfSale: body.pointOfSale || 1,
        cbteTipo: body.cbteTipo || 6, // 6 = Factura B
        docTipo: body.docTipo || 99, // 99 = Consumidor Final
        docNro: body.docNro || '0',
        subtotal,
        taxAmount: parseFloat(body.taxAmount) || 0,
        total,
        status: 'pending',
        createdAt: new Date(),
      };

      // Crear factura en la base de datos
      const newInvoice = new InvoiceModel(invoiceData);
      const savedInvoice = await newInvoice.save();

      // Intentar enviar a AFIP de forma asincrónica (opcional)
      // FacturacionService.sendToAFIP(savedInvoice).catch(err => console.error(err));

      return res.status(201).json({
        success: true,
        data: {
          uuid: savedInvoice.uuid,
          invoiceNumber: savedInvoice.invoiceNumber,
          clientName: savedInvoice.clientName,
          amount: savedInvoice.total,
          status: savedInvoice.status,
          createdAt: savedInvoice.createdAt,
        },
      });
    } catch (error) {
      console.error('FacturacionController.createInvoice:', error);
      return res.status(error.statusCode || 400).json({
        error: error.message || 'Error al crear factura',
      });
    }
  }

  static async getInvoiceStatus(req, res) {
    try {
      const { uuid } = req.params;
      if (!uuid) {
        return res.status(400).json({ error: 'UUID requerido' });
      }

      const InvoiceModel = getDependency('InvoiceModel');
      const invoice = await InvoiceModel.findOne({ uuid });

      if (!invoice) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      return res.status(200).json({
        success: true,
        data: {
          uuid: invoice.uuid,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: invoice.total,
          status: invoice.status,
          createdAt: invoice.createdAt,
          cae: invoice.cae || null,
        },
      });
    } catch (error) {
      console.error('FacturacionController.getInvoiceStatus:', error);
      return res.status(error.statusCode || 400).json({
        error: error.message || 'Error al obtener factura',
      });
    }
  }

  static async listInvoices(req, res) {
    try {
      // Extraer usuario del JWT
      const username = req.session?.username;
      if (!username) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const { status } = req.query;
      const InvoiceModel = getDependency('InvoiceModel');

      const filters = { createdBy: username };
      if (status) {
        filters.status = status;
      }

      const invoices = await InvoiceModel.find(filters).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: invoices.map(inv => ({
          uuid: inv.uuid,
          invoiceNumber: inv.invoiceNumber,
          clientName: inv.clientName,
          clientEmail: inv.clientEmail,
          description: inv.description,
          amount: inv.total,
          quantity: inv.quantity || (inv.items?.[0]?.quantity || 1),
          status: inv.status,
          createdAt: inv.createdAt,
          cae: inv.cae || null,
        })),
      });
    } catch (error) {
      console.error('FacturacionController.listInvoices:', error);
      return res.status(error.statusCode || 400).json({
        error: error.message || 'Error al listar facturas',
      });
    }
  }

  static async deleteInvoice(req, res) {
    try {
      const { uuid } = req.params;
      if (!uuid) {
        return res.status(400).json({ error: 'UUID requerido' });
      }

      const InvoiceModel = getDependency('InvoiceModel');
      const invoice = await InvoiceModel.findOne({ uuid });

      if (!invoice) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      await InvoiceModel.deleteOne({ uuid });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('FacturacionController.deleteInvoice:', error);
      return res.status(error.statusCode || 400).json({
        error: error.message || 'Error al eliminar factura',
      });
    }
  }
}
