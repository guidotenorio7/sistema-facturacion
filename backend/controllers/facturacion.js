import { getDependency } from '../libs/dependencies.js';
import { InvalidArgumentException } from '../exceptions/invalid_arguments_exception.js';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export class FacturacionController {
  static async createInvoice(req, res) {
    try {
      // Extraer usuario del JWT (del middleware de autenticación)
      // Los datos están en req.session (no en req.user)
      console.log('DEBUG createInvoice - req.session:', req.session);
      const userId = req.session?.userId;
      const username = req.session?.username;

      if (!userId || !username) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const body = req.body;

      // Validar datos básicos: description o items deben existir
      if (!body.description && (!body.items || body.items.length === 0)) {
        return res.status(400).json({ error: 'Descripción o items son requeridos' });
      }
      // amount no es estrictamente requerido: se puede calcular desde items o taxableBase

      const InvoiceModel = getDependency('InvoiceModel');

      let items = [];
      if (Array.isArray(body.items) && body.items.length > 0) {
        items = body.items.map((item) => {
          const quantity = parseInt(item.quantity, 10) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          return {
            description: item.description || body.description || 'Producto/Servicio',
            quantity,
            unitPrice,
            subtotal: parseFloat((quantity * unitPrice).toFixed(2)),
          };
        });
      } else if (!isNaN(parseFloat(body.unitCost)) && !isNaN(parseInt(body.quantity, 10))) {
        const quantity = parseInt(body.quantity, 10) || 1;
        const unitPrice = parseFloat(body.unitCost) || 0;
        items = [
          {
            description: body.itemDescription || body.description || 'Producto/Servicio',
            quantity,
            unitPrice,
            subtotal: parseFloat((quantity * unitPrice).toFixed(2)),
          },
        ];
      } else {
        items = [
          {
            description: body.description || 'Producto/Servicio',
            quantity: parseInt(body.quantity, 10) || 1,
            unitPrice: (!isNaN(parseFloat(body.amount)) && parseInt(body.quantity,10)) ? parseFloat(body.amount) / (parseInt(body.quantity, 10) || 1) : 0,
            subtotal: !isNaN(parseFloat(body.amount)) ? parseFloat(body.amount) : 0,
          },
        ];
      }

      const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      // Determinar taxable base y taxes
      const taxableBase = (body.taxableBase !== undefined && body.taxableBase !== null)
        ? parseFloat(body.taxableBase)
        : subtotal;

      let taxes = Array.isArray(body.taxes) ? body.taxes.map(t => ({
        name: t.name || 'IVA',
        rate: parseFloat(t.rate) || 0,
        amount: parseFloat(t.amount) || 0,
      })) : [];

      // Si no vienen taxes pero viene taxAmount o taxPercent, construir taxes
      if ((!taxes || taxes.length === 0) && (body.taxAmount || body.taxPercent)) {
        const taxAmountFromBody = parseFloat(body.taxAmount) || 0;
        const rate = parseFloat(body.taxPercent) || 0;
        if (taxAmountFromBody > 0) {
          taxes = [{ name: 'Impuesto', rate: rate, amount: taxAmountFromBody }];
        } else if (rate > 0) {
          const amt = parseFloat(((taxableBase * rate) / 100).toFixed(2));
          taxes = [{ name: 'Impuesto', rate: rate, amount: amt }];
        }
      }

      const taxAmount = taxes.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const total = parseFloat((taxableBase + taxAmount).toFixed(2));
      const quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1;

      const invoiceData = {
        uuid: crypto.randomUUID(),
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        series: body.series || body.serie || '',
        number: body.number || body.num || '',
        seriesNumber: body.seriesNumber || (body.series && body.number ? `${body.series}-${body.number}` : ''),
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        issuer: body.issuer || {},
        receiver: body.receiver || { name: body.receiverName || body.clientName || '', taxId: body.receiverTaxId || body.docNro || '' },
        clientName: (body.receiver && body.receiver.name) || body.receiverName || body.clientName || '',
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
        taxableBase,
        taxes,
        taxAmount,
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
      // Si no viene sesión establecida por middleware, permitir token en query para descargar desde movil
      if (!req.session) {
        const tokenFromQuery = req.query?.token;
        if (tokenFromQuery) {
          try {
            const data = jwt.verify(tokenFromQuery, config.jwtKey);
            req.session = { ...data, roles: data.roles };
          } catch (err) {
            // ignorar, se validará más adelante por permisos
          }
        }
      }
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

  static async getInvoicePdf(req, res) {
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

      // Generar PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      const filename = `${invoice.seriesNumber || invoice.invoiceNumber || invoice.uuid}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Factura', { align: 'center' });
      doc.moveDown(0.5);

      // Series/Number and issue date
      const seriesNum = invoice.seriesNumber || [invoice.series, invoice.number].filter(Boolean).join(' ');
      doc.fontSize(12).text(`Comprobante: ${seriesNum || invoice.invoiceNumber || invoice.uuid}`);
      const issueDate = invoice.issueDate || invoice.createdAt || new Date();
      doc.text(`Fecha de emisión: ${new Date(issueDate).toLocaleString()}`);
      doc.moveDown(0.5);

      // Issuer and Receiver
      doc.fontSize(12).text('Emisor:', { underline: true });
      if (invoice.issuer) {
        doc.text(`${invoice.issuer.name || ''}`);
        if (invoice.issuer.taxId) doc.text(`CUIT/CUIL: ${invoice.issuer.taxId}`);
        if (invoice.issuer.address) doc.text(`${invoice.issuer.address}`);
      }
      doc.moveDown(0.3);
      doc.fontSize(12).text('Receptor:', { underline: true });
      if (invoice.receiver) {
        doc.text(`${invoice.receiver.name || invoice.clientName || ''}`);
        if (invoice.receiver.taxId) doc.text(`CUIT/CUIL: ${invoice.receiver.taxId}`);
        if (invoice.receiver.address) doc.text(`${invoice.receiver.address}`);
      }
      if (invoice.clientEmail) doc.text(`Email: ${invoice.clientEmail}`);
      doc.moveDown(0.5);

      // Descripción
      if (invoice.description) {
        doc.fontSize(12).text('Descripción de la operación:', { underline: true });
        doc.text(invoice.description);
        doc.moveDown(0.5);
      }

      // Items
      const items = invoice.items || [];
      if (items.length > 0) {
        doc.fontSize(12).text('Items:', { underline: true });
        doc.moveDown(0.3);
        items.forEach((it, idx) => {
          const desc = it.description || '';
          const qty = it.quantity || 1;
          const unit = (it.unitPrice || 0).toFixed(2);
          const subtotalIt = (it.subtotal || (qty * (it.unitPrice || 0))).toFixed(2);
          doc.text(`${idx + 1}. ${desc} — ${qty} x $${unit} = $${subtotalIt}`);
        });
        doc.moveDown(0.5);
      }

      // Base imponible y desglose impuestos
      doc.fontSize(12).text(`Base imponible: $${(invoice.taxableBase || invoice.subtotal || 0).toFixed(2)}`);
      const taxes = invoice.taxes || [];
      if (taxes.length > 0) {
        doc.moveDown(0.2);
        doc.text('Impuestos aplicables:');
        taxes.forEach(t => {
          doc.text(`- ${t.name || 'Impuesto'} (${t.rate || 0}%): $${(t.amount || 0).toFixed(2)}`);
        });
      }

      doc.moveDown(0.5);
      doc.fontSize(14).text(`Importe total: $${(invoice.total || 0).toFixed(2)}`, { align: 'right' });

      doc.end();
    } catch (error) {
      console.error('FacturacionController.getInvoicePdf:', error);
      return res.status(error.statusCode || 500).json({ error: error.message || 'Error al generar PDF' });
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
          seriesNumber: inv.seriesNumber || ((inv.series || inv.number) ? `${inv.series || ''}${inv.series && inv.number ? '-' : ''}${inv.number || ''}` : ''),
          issueDate: inv.issueDate || inv.createdAt,
          clientName: inv.clientName,
          clientEmail: inv.clientEmail,
          description: inv.description,
          amount: inv.total,
          taxableBase: inv.taxableBase || inv.subtotal || 0,
          taxes: inv.taxes || [],
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

      // Verificar permisos de eliminación por ownership
      const username = req.session?.username;
      const userRoles = req.session?.roles || [];
      const isAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
      const isOperator = Array.isArray(userRoles) && userRoles.includes('operador');

      if (isOperator && !isAdmin) {
        // operador solo puede eliminar sus propias facturas
        if (invoice.createdBy !== username) {
          return res.status(403).json({ error: 'Acceso prohibido: solo puede eliminar sus propias facturas' });
        }
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
