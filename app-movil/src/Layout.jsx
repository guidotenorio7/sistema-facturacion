import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSession } from './components/Session';
import IndexScreen from './screens/IndexScreen';
import UsersScreen from './screens/UsersScreen';
import AboutScreen from './screens/AboutScreen';
import LoginScreen from './screens/LoginScreen';
import InvoiceCreateScreen from './screens/InvoiceCreateScreen';
import InvoiceHistoryScreen from './screens/InvoiceHistoryScreen';

const Drawer = createDrawerNavigator();

export default function Layout() {
  console.log('Rendering Layout component');
  const { isInitiated } = useSession();
  console.log('isInitiated:', isInitiated);

  if (!isInitiated) {
    return <LoginScreen />;
  }

  return (
    <Drawer.Navigator initialRouteName="Index">
      <Drawer.Screen
        name="Index"
        component={IndexScreen}
        options={{ title: 'Inicio' }}
      />
      <Drawer.Screen
        name="InvoiceCreate"
        component={InvoiceCreateScreen}
        options={{ title: 'Crear Factura' }}
      />
      <Drawer.Screen
        name="InvoiceHistory"
        component={InvoiceHistoryScreen}
        options={{ title: 'Historial de Facturas' }}
      />
      <Drawer.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: 'Usuarios' }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Acerca de' }}
      />
    </Drawer.Navigator>
  );
}
