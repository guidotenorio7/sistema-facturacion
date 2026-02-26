import express from 'express';
import config from './config.js';
import mongoose from 'mongoose';
import configureDependencies from './configure_dpendencies.js';
import configureMiddlewares from './middlewares/configure_middlewares.js';
import { corsMiddleware } from './middlewares/cors_middleware.js';
import { getDependency } from './libs/dependencies.js';
import { controllers } from './controllers/controllers.js';

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

// 🔑 Ruta de login con username
router.post('/login', async (req, res) => {
  try {
    const LoginService = getDependency('LoginService');
    const response = await LoginService.login(req.body);
    res.json(response);
  } catch (error) {
    console.error('Error en login:', error);
    if (error.name === 'InvalidArgumentException') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'InvalidCredentialsException') {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registrar controladores (usuarios, facturación, etc)
controllers(router);

// Levantar servidor
app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
