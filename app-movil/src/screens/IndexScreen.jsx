import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../components/Session';
import Screen from '../components/Screen';

export default function IndexScreen() {
  const navigation = useNavigation();
  const { user, setIsInitiated, setToken, setUser } = useSession();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            setIsInitiated(false);
            setToken(null);
            setUser(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'invoice-create',
      title: 'Crear Factura',
      description: 'Crear una nueva factura',
      icon: '📄',
      action: () => navigation.navigate('InvoiceCreate'),
    },
    {
      id: 'invoice-history',
      title: 'Historial de Facturas',
      description: 'Ver todas tus facturas',
      icon: '📋',
      action: () => navigation.navigate('InvoiceHistory'),
    },
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      action: () => navigation.navigate('Users'),
    },
    {
      id: 'about',
      title: 'Acerca de',
      description: 'Información de la aplicación',
      icon: 'ℹ️',
      action: () => navigation.navigate('About'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          ¡Bienvenido{user?.fullName ? ', ' + user.fullName : ''}!
        </Text>
        <Text style={styles.subtitle}>
          Selecciona una opción para continuar
        </Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={item.action}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Facturador Activo</Text>
        <Text style={styles.infoText}>
          Tienes acceso a todas las funcionalidades de facturación. Crea, gestiona y visualiza tus facturas de forma sencilla.
        </Text>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 20,
    gap: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemPressed: {
    backgroundColor: '#f0f0f0',
    opacity: 0.8,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#999',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#558B2F',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 25,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
