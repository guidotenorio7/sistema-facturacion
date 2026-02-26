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
    clientName: '',
    clientEmail: '',
    description: '',
    amount: '',
    quantity: '1',
  });

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
    if (!formData.clientName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (!formData.amount.trim() || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'El monto debe ser un número válido mayor a 0');
      return false;
    }
    if (!formData.quantity.trim() || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número válido mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || undefined,
        description: formData.description,
        amount: parseFloat(formData.amount),
        quantity: parseInt(formData.quantity),
      };

      const result = await facturacionService.createInvoice(invoiceData, token);

      if (result.success) {
        Alert.alert('Éxito', 'Factura creada correctamente', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                invoiceNumber: `INV-${Date.now()}`,
                clientName: '',
                clientEmail: '',
                description: '',
                amount: '',
                quantity: '1',
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
          <Text style={styles.label}>Nombre del Cliente *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo del cliente"
            value={formData.clientName}
            onChangeText={(value) => handleChange('clientName', value)}
            editable={!loading}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email del Cliente</Text>
          <TextInput
            style={styles.input}
            placeholder="cliente@example.com"
            keyboardType="email-address"
            value={formData.clientEmail}
            onChangeText={(value) => handleChange('clientEmail', value)}
            editable={!loading}
            placeholderTextColor="#bbb"
          />
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
            <Text style={styles.label}>Monto Total *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 100.00"
              keyboardType="decimal-pad"
              value={formData.amount}
              onChangeText={(value) => handleChange('amount', value)}
              editable={!loading}
              placeholderTextColor="#bbb"
            />
          </View>
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
              clientName: '',
              clientEmail: '',
              description: '',
              amount: '',
              quantity: '1',
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
