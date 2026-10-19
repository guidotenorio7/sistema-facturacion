# Sistema de Facturación

Sistema de facturación con **API backend**, **cliente web** y **app móvil**. Permite autenticarse, gestionar la información de facturación y generar facturas en PDF. Desarrollado de forma individual como proyecto académico de la Tecnicatura en Desarrollo de Software (Universidad Católica de Cuyo).

## Arquitectura

El frontend web y la app móvil son clientes independientes que consumen la misma API REST.

```
sistema-facturacion/
├── backend/     # API REST (Node.js + Express + MongoDB)
├── frontend/    # Cliente web (React + Vite)
└── app-movil/   # App móvil (React Native + Expo)
```

## Tecnologías

**Backend**
- Node.js (módulos ESM) y Express 5
- MongoDB con Mongoose
- Autenticación con JWT y contraseñas con bcrypt
- Middleware CORS
- Generación de facturas en PDF con PDFKit
- `express-validator` y `node-soap` figuran como dependencias, pero actualmente no se usan en el código de la aplicación

> **Estado de la integración AFIP:** la comunicación real con WSAA/WSFE todavía no está implementada. La autenticación y respuesta de AFIP se simulan para desarrollo; por lo tanto, las facturas generadas por ahora no son comprobantes fiscales autorizados.

**Frontend web**
- React 19
- Vite 7
- React Router 7
- CSS propio
- ESLint

**App móvil**
- React Native 0.81 con Expo 54
- React Navigation 7 (menú lateral)
- React Native Web (también corre en el navegador)
- React Native Picker para campos de selección

## Requisitos

- Node.js 20 o superior
- npm
- Una instancia de MongoDB (local o en la nube)
- Expo Go en el celular, o un emulador, para probar la app móvil

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/guidotenorio7/sistema-facturacion.git
cd sistema-facturacion
```

### 2. Backend

```bash
cd backend
npm install
```

El backend **no carga configuración desde un archivo `.env`**. La configuración local está en `backend/config.local.js`; ajustá allí `dbConnection` para apuntar a tu MongoDB y `jwtKey` para usar una clave secreta propia. No compartas ni publiques esa clave.

La API escucha en el puerto `3000` y sus rutas están bajo el prefijo `/api`.

Iniciá el servidor:

```bash
npm run dev
```

### 3. Frontend web

```bash
cd frontend
npm install
npm run dev
```

Por defecto Vite lo sirve en `http://localhost:5173`.
En desarrollo, Vite reenvía las solicitudes `/api` al backend en `http://localhost:3000`.

### 4. App móvil

```bash
cd app-movil
npm install
npx expo start
```

Escaneá el QR con Expo Go, o presioná `w` para abrirla en el navegador.
Antes de usarla, verificá `API_URL` en `app-movil/src/services/config.js`: para un teléfono físico debe apuntar a la IP de tu computadora en la red local (no a `localhost`) y al puerto/prefijo correctos del backend.

## Funcionalidades

- Inicio de sesión con tokens JWT y gestión de usuarios según permisos
- Validaciones de entrada implementadas en el código del backend
- Generación y descarga de facturas en PDF
- Integración AFIP simulada para desarrollo; la emisión fiscal real aún está pendiente
- Cliente web y app móvil conectados a la misma API

## Autor

**Guido Rubén Tenorio Dávila**
[LinkedIn](https://www.linkedin.com/in/guido-tenorio-27ab02207) · [GitHub](https://github.com/guidotenorio7)

## Licencia

Distribuido bajo licencia MIT. Ver el archivo [LICENSE](LICENSE).