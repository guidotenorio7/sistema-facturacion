import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    default: () => `INV-${Date.now()}`,
  },
  series: {
    type: String,
    default: '',
  },
  number: {
    type: String,
    default: '',
  },
  seriesNumber: {
    type: String,
    default: '',
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  localId: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    required: true,
  },
  pointOfSale: {
    type: Number,
    default: 1,
  },
  cbteTipo: {
    // Tipo de comprobante (AFIP): 1=Factura A, 6=Factura B, etc.
    type: Number,
    default: 6,
  },
  docTipo: {
    // Tipo de documento cliente: 80=CUIT, 86=CUIL, 99=Consumidor Final, etc.
    type: Number,
    default: 99,
  },
  docNro: {
    type: String,
    default: '0',
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    default: '',
  },
  issuer: {
    name: String,
    address: String,
    taxId: String,
  },
  receiver: {
    name: String,
    address: String,
    taxId: String,
  },
  description: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    default: 1,
  },
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      subtotal: Number,
    },
  ],
  subtotal: {
    type: Number,
    default: 0,
  },
  taxableBase: {
    type: Number,
    default: 0,
  },
  taxes: [
    {
      name: String,
      rate: Number,
      amount: Number,
    },
  ],
  taxAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    // pending, sent, accepted, rejected
    type: String,
    enum: ['pending', 'sent', 'accepted', 'rejected'],
    default: 'pending',
  },
  cae: String,
  caeExpiration: Date,
  afipResponse: mongoose.Schema.Types.Mixed,
  afipObservations: [String],
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttemptAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('invoices', invoiceSchema);
