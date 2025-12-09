import express from 'express';
import config from './config.js';
import mongoose from 'mongoose';
import configureDependencies from './configure_dpendencies.js';
import configureMiddlewares from './middlewares/configure_middlewares.js';
import corsMiddleware from './middlewares/cors_middleware.js'; // ✅ usar export default

// Validar jwtKey
if (!config.jwtKey) {
  console.error(
    `No se ha definido un jwtKey en la configuración. Por favor cree un archivo config.local.js según se especifica en config.js.`
  );
  process.exit(1);
}

// Conexión a MongoDB
mongoose.connect(config.dbConnection)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(error => console.error('Error al conectar:', error));

const app = express();

// Middlewares globales
app.use(corsMiddleware);
app.use(express.json());

// Router principal
const router = express.Router();
app.use('/api', router);

// Configurar middlewares y dependencias
configureMiddlewares(router);
configureDependencies();

// Ruta de prueba
router.get('/ping', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});

// Levantar servidor
app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
