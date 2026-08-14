import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useSession } from '../components/Session';
import Screen from '../components/Screen';
import facturacionService from '../services/facturacionService';

export default function InvoiceCreateScreen() {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    seriesNumber: '',
    issueDate: '',
    issuerName: '',
    issuerTaxId: '',
    receiverName: '',
    receiverTaxId: '',
    description: '',
    itemDescription: '',
    quantity: '1',
    unitCost: '',
    taxPercent: '',
  });

  const totalAmount = (() => {
    const unit = parseFloat(formData.unitCost);
    const qty = parseInt(formData.quantity, 10);
    const taxPct = parseFloat(formData.taxPercent) || 0;
    if (!isNaN(unit) && unit >= 0 && !isNaN(qty) && qty > 0) {
      const subtotal = unit * qty;
      const tax = taxPct > 0 ? ((subtotal * taxPct) / 100) : 0;
      return (subtotal + tax).toFixed(2);
    }
    return '';
  })();

  // Debug: Verificar que el token existe
  useEffect(() => {
    console.log('InvoiceCreateScreen - Token disponible:', !!token);
    if (!token) {
      console.warn('Token no disponible en InvoiceCreateScreen');
    }
  }, [token]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    // Validar que exista costo unitario + cantidad o ítem
    const hasUnit = formData.unitCost && !isNaN(parseFloat(formData.unitCost));
    const hasItem = formData.itemDescription && formData.itemUnitPrice && formData.itemQuantity;
    if (!hasUnit && !hasItem) {
      Alert.alert('Error', 'Debe completar costo unitario y cantidad, o los datos del ítem');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        seriesNumber: formData.seriesNumber || undefined,
        issueDate: formData.issueDate || undefined,
        issuer: { name: formData.issuerName || undefined, taxId: formData.issuerTaxId || undefined },
        receiver: { name: formData.receiverName || undefined, taxId: formData.receiverTaxId || undefined },
        description: formData.description,
      };

      if (!isNaN(parseFloat(formData.unitCost)) && !isNaN(parseInt(formData.quantity, 10))) {
        const unitCost = parseFloat(formData.unitCost);
        const quantity = parseInt(formData.quantity, 10);
        const subtotal = parseFloat((unitCost * quantity).toFixed(2));
        const taxPercent = parseFloat(formData.taxPercent) || 0;
        const taxAmount = taxPercent > 0 ? parseFloat(((subtotal * taxPercent) / 100).toFixed(2)) : 0;
        invoiceData = { ...invoiceData, items: [{ description: formData.itemDescription || formData.description, quantity, unitPrice: unitCost, subtotal }], taxableBase: subtotal, taxes: taxAmount > 0 ? [{ name: 'IVA', rate: taxPercent, amount: taxAmount }] : [], total: parseFloat((subtotal + taxAmount).toFixed(2)), amount: parseFloat((subtotal + taxAmount).toFixed(2)) };
      } else {
        const quantity = parseInt(formData.itemQuantity, 10);
        const unitPrice = parseFloat(formData.itemUnitPrice);
        const amount = parseFloat((quantity * unitPrice).toFixed(2));
        invoiceData = { ...invoiceData, quantity, amount, items: [{ description: formData.itemDescription, quantity, unitPrice, subtotal: amount }] };
      }

      const result = await facturacionService.createInvoice(invoiceData, token);

      if (result.success) {
        Alert.alert('Éxito', 'Factura creada correctamente', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                invoiceNumber: `INV-${Date.now()}`,
                seriesNumber: '',
                issueDate: '',
                issuerName: '',
                issuerTaxId: '',
                receiverName: '',
                receiverTaxId: '',
                description: '',
                itemDescription: '',
                quantity: '1',
                unitCost: '',
                taxPercent: '',
              });
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al crear la factura');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
        <Text style={styles.title}>📄 Crear Nueva Factura</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Número de Factura</Text>
          <TextInput
            style={styles.inputDisabled}
            value={formData.invoiceNumber}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Serie y número</Text>
          <TextInput style={styles.input} value={formData.seriesNumber} onChangeText={(v) => handleChange('seriesNumber', v)} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de emisión</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.issueDate} onChangeText={(v) => handleChange('issueDate', v)} />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Nombre emisor</Text>
            <TextInput style={styles.input} value={formData.issuerName} onChangeText={(v) => handleChange('issuerName', v)} />
          </View>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>CUIT/CUIL emisor</Text>
            <TextInput style={styles.input} value={formData.issuerTaxId} onChangeText={(v) => handleChange('issuerTaxId', v)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Nombre receptor</Text>
            <TextInput style={styles.input} value={formData.receiverName} onChangeText={(v) => handleChange('receiverName', v)} />
          </View>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>CUIT/CUIL receptor</Text>
            <TextInput style={styles.input} value={formData.receiverTaxId} onChangeText={(v) => handleChange('receiverTaxId', v)} />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descripción del producto/servicio"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            editable={!loading}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción del ítem</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Ej: Servicio de consultoría"
            multiline
            numberOfLines={3}
            value={formData.itemDescription}
            onChangeText={(value) => handleChange('itemDescription', value)}
            editable={!loading}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Cantidad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1"
              keyboardType="number-pad"
              value={formData.quantity}
              onChangeText={(value) => handleChange('quantity', value)}
              editable={!loading}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Costo unitario *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 100.00"
              keyboardType="decimal-pad"
              value={formData.unitCost}
              onChangeText={(value) => handleChange('unitCost', value)}
              editable={!loading}
              placeholderTextColor="#bbb"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>% Impuesto</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" value={formData.taxPercent} onChangeText={(v) => handleChange('taxPercent', v)} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total calculado</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={totalAmount}
            editable={false}
            placeholder="0.00"
            placeholderTextColor="#bbb"
          />
        </View>

        <Text style={styles.requiredNote}>* Campos requeridos</Text>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ Creando...' : '✓ Crear Factura'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
          onPress={() => {
            setFormData({
              invoiceNumber: `INV-${Date.now()}`,
              clientEmail: '',
              description: '',
              itemDescription: '',
              itemQuantity: '1',
              itemUnitPrice: '',
              seriesNumber: '',
              issueDate: '',
              issuerName: '',
              issuerTaxId: '',
              receiverName: '',
              receiverTaxId: '',
              unitCost: '',
              quantity: '1',
              taxPercent: '',
            });
          }}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>Limpiar</Text>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  flex: {
    flex: 1,
  },
  requiredNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
