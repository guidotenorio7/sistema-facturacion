# 👥 Sistema de Roles y Permisos

## Descripción General

El sistema ahora tiene 3 roles con permisos diferenciados:

## 🎓 Roles

### 1. **ADMIN** (Administrador)
- **Color:** Rojo (#d32f2f)
- **Acceso a:**
  - Gestión completa de usuarios (crear, listar, editar, eliminar)
  - Crear y gestionar todas las facturas
  - Ver reportes y exportarlos
  - Acceso a configuración del sistema
  
**Permisos:**
```
✅ user.list       - Ver todos los usuarios
✅ user.create     - Crear nuevos usuarios
✅ user.edit       - Editar usuarios
✅ user.delete     - Eliminar usuarios
✅ invoice.create  - Crear facturas
✅ invoice.list    - Listar facturas
✅ invoice.view    - Ver detalles de factura
✅ invoice.delete  - Eliminar facturas
✅ invoice.export  - Exportar facturas
✅ report.view     - Ver reportes
✅ report.export   - Exportar reportes
✅ settings.manage - Gestionar configuración
```

---

### 2. **OPERADOR** (Operador)
- **Color:** Naranja (#f57c00)
- **Acceso a:**
  - Crear y gestionar facturas
  - Ver lista de facturas
  - Ver reportes
  - Exportar facturas
  - No puede ver/gestionar usuarios
  
**Permisos:**
```
✅ invoice.create  - Crear facturas
✅ invoice.list    - Listar facturas
✅ invoice.view    - Ver detalles de factura
✅ invoice.export  - Exportar facturas
✅ report.view     - Ver reportes
❌ user.*          - No acceso a usuarios
❌ settings.*      - No acceso a configuración
```

---

### 3. **USUARIO** (Usuario Regular)
- **Color:** Verde (#388e3c)
- **Acceso a:**
  - Crear sus propias facturas
  - Ver sus propias facturas
  - No puede ver usuarios ni reportes
  
**Permisos:**
```
✅ invoice.create  - Crear facturas propias
✅ invoice.list    - Listar sus facturas
✅ invoice.view    - Ver detalles de sus facturas
❌ invoice.delete  - No puede eliminar
❌ invoice.export  - No puede exportar
❌ user.*          - No acceso a usuarios
❌ report.*        - No acceso a reportes
❌ settings.*      - No acceso a configuración
```

---

## 🔄 Matriz de Permisos

| Acción | Admin | Operador | Usuario |
|--------|:-----:|:--------:|:-------:|
| Ver usuarios | ✅ | ❌ | ❌ |
| Crear usuario | ✅ | ❌ | ❌ |
| Editar usuario | ✅ | ❌ | ❌ |
| Eliminar usuario | ✅ | ❌ | ❌ |
| Crear factura | ✅ | ✅ | ✅ |
| Listar facturas | ✅ | ✅ | ✅ |
| Ver factura | ✅ | ✅ | ✅ |
| Eliminar factura | ✅ | ❌ | ❌ |
| Exportar factura | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | ❌ |
| Exportar reportes | ✅ | ❌ | ❌ |
| Gestionar configuración | ✅ | ❌ | ❌ |

---

## 🔧 Cómo Asignar Roles a un Usuario

Al crear un usuario, asigna uno o más roles:

### En la API (Backend):
```javascript
POST /api/user
{
  "username": "juan",
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "roles": ["operador"]  // O ["usuario"], ["admin"], etc.
}
```

### En la Base de Datos (MongoDB):
```javascript
db.users.updateOne(
  { username: "juan" },
  { $set: { roles: ["operador"] } }
)
```

---

## 📝 Ejemplos de Roles

### Usuario Administrativo
```javascript
{
  username: "admin",
  roles: ["admin"]
}
```

### Operador de Facturación
```javascript
{
  username: "operador1",
  roles: ["operador"]
}
```

### Usuario Final
```javascript
{
  username: "cliente1",
  roles: ["usuario"]
}
```

### Usuario con Múltiples Roles
```javascript
{
  username: "gerente",
  roles: ["operador", "admin"]  // Tendrá permisos de ambos
}
```

---

## 🛡️ Protección en Rutas

Todas las rutas ahora verifican permisos:

```javascript
// Solo admin puede eliminar usuarios
app.delete('/user/:uuid', checkForPermission('user.delete'), controller);

// Usuarios, operadores y admin pueden crear facturas
app.post('/facturacion', checkForPermission('invoice.create'), controller);
```

---

## 📊 Estructura en Backend

El sistema está en `backend/config/roles.js` con:

- `ROLES` - Constantes de nombres de roles
- `PERMISSIONS` - Matriz de qué rol puede hacer qué
- `ROLE_DESCRIPTIONS` - Descripciones y colores
- `hasPermission()` - Función para verificar permisos
- `getRoleDescription()` - Función para obtener descripción

---

## 🚀 Próximas Implementaciones Sugeridas

1. **Panel de Control**: mostrar información diferente según el rol
2. **Menú personalizado**: mostrar opciones solo si el usuario tiene permiso
3. **Reportes avanzados**: datos diferentes según el rol
4. **Auditoría**: registrar quién hace qué

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo cambiar los permisos?**
R: Sí, edita `backend/config/roles.js` en el objeto `PERMISSIONS`

**P: ¿Cómo agrego un nuevo permiso?**
R: Agregalo a `PERMISSIONS` en `backend/config/roles.js` y usa `checkForPermission()` en tus rutas

**P: ¿Un usuario puede tener múltiples roles?**
R: Sí, asigna un array: `roles: ["operador", "usuario"]`

**P: ¿Los permisos se sincronizan con la app móvil?**
R: Sí, el backend valida todos los permisos. La app simplemente respeta lo que le permite el backend.
