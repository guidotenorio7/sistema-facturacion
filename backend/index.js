import express from 'express';
import config from './config.js';
import mongoose from 'mongoose';
import configureDependencies from './configure_dpendencies.js';
import configureMiddlewares from './middlewares/configure_middlewares.js';
import { corsMiddleware } from './middlewares/cors_middleware.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/user.js'; // tu modelo de usuario

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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comparar contra hashedPassword
    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { uuid: user.uuid, roles: user.roles },
      config.jwtKey,
      { expiresIn: '1h' } // opcional: expira en 1 hora
    );

    res.json({ token, role: user.roles });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Levantar servidor
app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
