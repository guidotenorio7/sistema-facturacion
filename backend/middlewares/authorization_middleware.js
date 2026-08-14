import jwt from 'jsonwebtoken';
import config from '../config.js';
import { ForbiddenException } from '../exceptions/forbidden_exception.js';
import { hasPermission, normalizeRoles } from '../config/roles.js';

export function authorizationMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    next();
    return;
  }

  const scheme = auth
    .substring(0, 7)
    .toUpperCase();
  if (scheme !== 'BEARER ') {
    throw new Error('Invalid authorization scheme');
  }

  const token = auth
    .substring(7)
    .trim();
  let data;
  try {
    data = jwt.verify(token, config.jwtKey);
  } catch (err) {
    console.warn('authorizationMiddleware: token verification failed:', err.message);
    // Responder 401 en caso de token inválido en lugar de lanzar excepción
    res.status(401).json({ error: 'Token inválido' });
    return;
  }
  const normalizedRoles = normalizeRoles(data.roles);

  req.session = {
    ...data,
    roles: normalizedRoles,
  };
    
  next();
}

/**
 * Middleware para verificar si un usuario tiene un rol específico
 * @param {string|string[]} requiredRoles - Un rol o array de roles requeridos
 * @returns {function} Middleware function
 */
export function checkForRole(requiredRoles) {
  return (req, res, next) => {
    const userRoles = req.session?.roles || [];
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Verifica si el usuario tiene al menos uno de los roles requeridos
    const hasRole = rolesArray.some(role => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException();
    }

    next();
  };
}

/**
 * Middleware para verificar si un usuario tiene permiso para una acción
 * @param {string} permission - El permiso a verificar (ej: 'user.create', 'invoice.delete')
 * @returns {function} Middleware function
 */
export function checkForPermission(permission) {
  return (req, res, next) => {
    const userRoles = req.session?.roles || [];

    if (!hasPermission(userRoles, permission)) {
      throw new ForbiddenException();
    }

    next();
  };
}