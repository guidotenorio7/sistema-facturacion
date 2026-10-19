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
- Validación de datos con express-validator
- Generación de facturas en PDF con PDFKit
- CORS

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

Creá un archivo `.env` dentro de `backend/` con tus variables de entorno, por ejemplo:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/facturacion
JWT_SECRET=una_clave_secreta_larga
```

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

### 4. App móvil

```bash
cd app-movil
npm install
npx expo start
```

Escaneá el QR con Expo Go, o presioná `w` para abrirla en el navegador.

## Funcionalidades

- Registro e inicio de sesión con tokens JWT
- Validación de datos de entrada en la API
- Generación de facturas en PDF
- Cliente web y app móvil conectados a la misma API

## Autor

**Guido Rubén Tenorio Dávila**
[LinkedIn](https://www.linkedin.com/in/guido-tenorio-27ab02207) · [GitHub](https://github.com/guidotenorio7)

## Licencia

Distribuido bajo licencia MIT. Ver el archivo [LICENSE](LICENSE).