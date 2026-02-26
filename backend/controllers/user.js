import { UserService } from '../services/user.js';
import { checkForRole, checkForPermission } from '../middlewares/authorization_middleware.js';

export function user(app) {
  // Obtener todos los usuarios (solo admin)
  app.get(
    '/user',
    checkForPermission('user.list'),
    async (req, res) => {
      const users = await UserService.get();
      const result = users.map(user => ({
        uuid: user.uuid,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles
      }));
      res.send(result);
    }
  );

  // Crear nuevo usuario (solo admin)
  app.post(
    '/user',
    checkForPermission('user.create'),
    async (req, res) => {
      await UserService.create(req.body);
      res.status(204).send();
    }
  );

  // Eliminar usuario (solo admin)
  app.delete(
    '/user/:uuid',
    checkForPermission('user.delete'),
    async(req, res) => {
      await UserService.deleteByUuid(req.params.uuid);
      res.status(204).send();
    }
  );

  // Obtener datos del usuario actual
  app.get(
    '/user/profile/me',
    async (req, res) => {
      const username = req.session?.username;
      if (!username) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      const user = await UserService.getSingleOrNullByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        uuid: user.uuid,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
      });
    }
  );
}