import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Alert, SectionList } from 'react-native';
import { Linking } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '../components/Session';
import facturacionService from '../services/facturacionService';

export default function InvoiceHistoryScreen() {
  const { token } = useSession();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Debug: Verificar que el token existe
  useEffect(() => {
    console.log('InvoiceHistoryScreen - Token disponible:', !!token);
    if (!token) {
      console.warn('Token no disponible en InvoiceHistoryScreen');
    }
  }, [token]);

  // Cargar facturas cuando se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [token])
  );

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const result = await facturacionService.getInvoices(token);
      if (result.success) {
        setInvoices(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar las facturas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await facturacionService.getInvoices(token);
      if (result.success) {
        setInvoices(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'completada':
        return '#4CAF50';
      case 'pending':
      case 'pendiente':
        return '#FF9800';
      case 'cancelled':
      case 'cancelada':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const renderInvoiceItem = ({ item }) => (
    <Pressable
      onLongPress={() => {
        // toggle selection
        setSelectedIds(prev => {
          if (prev.includes(item.uuid)) return prev.filter(id => id !== item.uuid);
          return [...prev, item.uuid];
        });
      }}
    >
      <View style={[styles.card, selectedIds.includes(item.uuid) && styles.cardSelected]}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceNumber}>
          {item.invoiceNumber || item.number || `Factura #${item.id}`}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status || 'Pendiente'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{item.clientName || 'N/A'}</Text>
        </View>

        {item.clientEmail && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{item.clientEmail}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={styles.value}>{item.description || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cantidad:</Text>
          <Text style={styles.value}>{item.quantity || 1}</Text>
        </View>

        <View style={[styles.infoRow, styles.amountRow]}>
          <Text style={styles.label}>Monto:</Text>
          <Text style={styles.amountValue}>
            ${parseFloat(item.amount || 0).toFixed(2)}
          </Text>
        </View>

        {item.createdAt && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.downloadButton}
            onPress={() => {
              try {
                const url = facturacionService.getInvoicePdfUrl(item.uuid, token);
                Linking.openURL(url);
              } catch (err) {
                Alert.alert('Error', 'No se pudo abrir el PDF');
              }
            }}
          >
            <Text style={styles.downloadText}>Descargar</Text>
          </Pressable>
        </View>
      </View>
    </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay facturas registradas</Text>
      <Text style={styles.emptySubText}>
        Crea una nueva factura para comenzar
      </Text>
    </View>
  );

  // Componente para el header del FlatList
  const renderHeader = () => (
    <View>
      <Text style={styles.title}>Historial de Facturas</Text>

      {invoices.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Facturas:</Text>
            <Text style={styles.summaryValue}>{invoices.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Monto Total:</Text>
            <Text style={styles.summaryValue}>
              ${invoices
                .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
                .toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <>
      {selectedIds.length > 0 && (
        <View style={styles.selectionBar}>
          <Pressable
            style={styles.deleteSelectedButton}
            onPress={async () => {
              Alert.alert(
                'Confirmar eliminación',
                `¿Eliminar ${selectedIds.length} factura(s)?`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        for (const id of selectedIds) {
                          await facturacionService.deleteInvoice(id, token);
                        }
                        setSelectedIds([]);
                        loadInvoices();
                        Alert.alert('Éxito', 'Facturas eliminadas');
                      } catch (err) {
                        Alert.alert('Error', 'Error al eliminar facturas');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.deleteSelectedText}>Eliminar seleccionadas ({selectedIds.length})</Text>
          </Pressable>
        </View>
      )}

      <FlatList
      style={styles.container}
      data={invoices}
      renderItem={renderInvoiceItem}
      keyExtractor={(item) => item.uuid || `invoice-${item.id || Math.random()}`}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.listContent,
        invoices.length === 0 && styles.emptyListContent,
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4CAF50']}
        />
      }
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#d32f2f',
  },
  selectionBar: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deleteSelectedButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteSelectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  cardHeader: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    flex: 0.35,
  },
  value: {
    fontSize: 13,
    color: '#333',
    flex: 0.65,
    textAlign: 'right',
  },
  amountRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 10,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  downloadButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  downloadText: {
    color: '#fff',
    fontWeight: '700',
  },
});
