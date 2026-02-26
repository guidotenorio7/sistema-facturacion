# 📄 Guía del Facturador - App Móvil Tenorio

## ✅ Cambios Realizados

Se ha implementado un **facturador completamente funcional** en la app móvil con las siguientes características:

### 🎯 Nuevas Funcionalidades

#### 1. **Crear Facturas** 
- Pantalla intuitiva para crear nuevas facturas
- Campos: Cliente, Email, Descripción, Cantidad y Monto
- Número de factura generado automáticamente
- Validación de datos antes de guardar

#### 2. **Ver Historial**
- Lista completa de todas tus facturas
- Información detallada de cada factura
- Estado de cada documento
- Resumen con total de facturas y monto total
- Función de actualizar/refrescar la lista

#### 3. **Menú Principal Mejorado**
- Dashboard con accesos rápidos
- Opciones claras para cada funcionalidad
- Navegación intuitiva


## 📱 Cómo Usar

### En la App Móvil

1. **Después de iniciar sesión**, verás el menú principal con opciones
2. **Para crear una factura**:
   - Toca "Crear Factura"
   - Completa los campos requeridos:
     - Nombre del cliente (requerido)
     - Email del cliente (opcional)
     - Descripción (requerido) - qué producto/servicio
     - Cantidad (requerido)
     - Monto total (requerido)
   - El número de factura se genera automáticamente
   - Toca "Crear Factura"

3. **Para ver el historial**:
   - Toca "Historial de Facturas"
   - Verás todas tus facturas ordenadas por fecha (más recientes primero)
   - Puedes ver:
     - Número de factura
     - Nombre del cliente
     - Email del cliente
     - Descripción
     - Cantidad
     - Monto
     - Estado
     - Fecha de creación
   - Desliza hacia abajo para refrescar la lista

### Datos de Prueba

Para probar el facturador, usa credenciales válidas del sistema con los que ya accedes a la app.

## 🔧 Cambios en el Backend

### Nuevas Rutas API

```
POST   /api/facturacion          - Crear nueva factura
GET    /api/facturacion          - Obtener historial de facturas
GET    /api/facturacion/:uuid    - Obtener estado de factura específica
```

### Campos de Factura

**Requeridos:**
- `clientName` - Nombre del cliente
- `amount` - Monto total de la factura

**Opcionales:**
- `invoiceNumber` - Se genera automáticamente si no se proporciona
- `clientEmail` - Email del cliente
- `description` - Descripción del producto/servicio
- `quantity` - Cantidad (default: 1)

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "invoiceNumber": "INV-1708361234567",
    "clientName": "Juan Pérez",
    "amount": 1500.50,
    "status": "pending",
    "createdAt": "2024-02-20T10:30:00Z"
  }
}
```

## 📝 Estructura de Carpetas

### Frontend (app-movil)
```
src/
├── screens/
│   ├── InvoiceCreateScreen.jsx    ✨ NUEVO - Crear facturas
│   ├── InvoiceHistoryScreen.jsx   ✨ NUEVO - Ver historial
│   └── IndexScreen.jsx            ✏️ ACTUALIZADO - Menú principal
├── services/
│   ├── facturacionService.js      ✨ NUEVO - API del facturador
│   └── userService.js
└── Layout.jsx                     ✏️ ACTUALIZADO - Rutas de navegación
```

### Backend
```
controllers/
├── facturacion.js                 ✏️ ACTUALIZADO - Controlador simplificado
└── facturacion_routes.js

models/
└── invoice.js                     ✏️ ACTUALIZADO - Modelo mejorado

index.js                           ✏️ ACTUALIZADO - Registro de rutas
```

## 🔐 Autenticación

Todas las rutas de facturación requieren un token JWT válido en el header:
```
Authorization: Bearer {token}
```

El token se obtiene automáticamente al iniciar sesión en la app.

## ✨ Características del Facturador

- ✅ Crear facturas con datos básicos
- ✅ Vista de historial completo
- ✅ Resumen de estadísticas (total de facturas y monto)
- ✅ Estados de factura (pending, sent, accepted, rejected)
- ✅ Números de factura únicos y automáticos
- ✅ Campos opcionales para compatibilidad con AFIP (para futuro integración)
- ✅ Búsqueda por estado (si es necesario)
- ✅ Actualización en tiempo real

## 🚀 Próximos Pasos (Futuro)

Si deseas expandir funcionalidades:

1. **Integración AFIP**: Completar la integración con los servicios AFIP (WSAA/WSFE)
2. **Búsqueda y Filtrado**: Agregar filtros por fecha, estado, cliente, etc.
3. **Edición de Facturas**: Permitir editar facturas pendientes
4. **PDF**: Generar PDFs de facturas
5. **Email**: Enviar facturas por email directamente desde la app
6. **Impresión**: Integrar con impresoras Bluetooth

## 📞 Soporte

Si tienes problemas:
1. Verifica que hayas iniciado sesión correctamente
2. Comprueba que el backend esté corriendo (`npm start` en la carpeta backend)
3. Revisa la consola de errores para detalles específicos
4. Asegúrate de tener conexión de red

## 📄 Archivos Modificados

- ✏️ `backend/index.js` - Agregado registro de controladores
- ✏️ `backend/controllers/facturacion.js` - Simplificado para app móvil
- ✏️ `backend/models/invoice.js` - Agregados campos opcionales
- ✏️ `app-movil/src/Layout.jsx` - Agregadas rutas del facturador
- ✏️ `app-movil/src/screens/IndexScreen.jsx` - Actualizado menú principal
- ✨ `app-movil/src/screens/InvoiceCreateScreen.jsx` - NUEVO
- ✨ `app-movil/src/screens/InvoiceHistoryScreen.jsx` - NUEVO
- ✨ `app-movil/src/services/facturacionService.js` - NUEVO

---

**Facturador Implementado: ✅ Completado**
