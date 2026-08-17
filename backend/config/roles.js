/**
 * Definición de Roles y Permisos
 * 
 * Este archivo define qué puede hacer cada rol en el sistema
 */

export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario',
  OPERADOR: 'operador',
};

/**
 * Matriz de Permisos
 * Define qué acciones puede realizar cada rol
 */
export const PERMISSIONS = {
  // Gestión de Usuarios
  'user.list': ['admin'],
  'user.create': ['admin'],
  'user.edit': ['admin'],
  'user.delete': ['admin'],
  'user.view_all': ['admin'],

  // Gestión de Facturas
  // Política:
  // - admin: todos los permisos
  // - operador: puede crear y eliminar facturas; puede también ver/listar
  // - usuario: solo ver/listar facturas
  'invoice.create': ['admin', 'operador'],
  'invoice.list': ['admin', 'operador', 'usuario'],
  'invoice.view': ['admin', 'operador', 'usuario'],
  'invoice.delete': ['admin', 'operador'],
  'invoice.export': ['admin', 'operador', 'usuario'],

  // Reporting
  'report.view': ['admin', 'operador'],
  'report.export': ['admin'],

  // Settings
  'settings.manage': ['admin'],
};

/**
 * Descripciones de Roles
 */
export const ROLE_DESCRIPTIONS = {
  admin: {
    name: 'Administrador',
    description: 'Acceso completo a todas las funcionalidades del sistema',
    color: '#d32f2f',
    icon: '👨‍💼',
  },
  operador: {
    name: 'Operador',
    description: 'Puede crear y eliminar facturas; puede ver/listar facturas propias',
    color: '#f57c00',
    icon: '👨‍💻',
  },
  usuario: {
    name: 'Usuario',
    description: 'Puede ver y listar sus facturas; no puede crear, editar ni eliminar',
    color: '#388e3c',
    icon: '👤',
  },
};

/**
 * Función para verificar si un rol tiene permiso para una acción
 * @param {string|string[]} userRoles - Rol o array de roles del usuario
 * @param {string} permission - Permiso a verificar
 * @returns {boolean} True si tiene permiso
 */
export function normalizeRole(role) {
  if (!role) return role;

  const normalized = String(role).trim();
  if (normalized === 'operator' || normalized === 'operador') return 'operador';
  if (normalized === 'user' || normalized === 'usuario') return 'usuario';
  if (normalized === 'admin') return 'admin';

  return normalized;
}

export function normalizeRoles(userRoles) {
  if (!userRoles) return [];
  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];
  return roles.map(normalizeRole).filter(Boolean);
}

export function hasPermission(userRoles, permission) {
  if (!userRoles) return false;

  const roles = normalizeRoles(userRoles);
  const allowedRoles = PERMISSIONS[permission] || [];

  return roles.some(role => allowedRoles.includes(role));
}

/**
 * Función para obtener descripción de un rol
 * @param {string} role - El rol
 * @returns {object} Descripción del rol
 */
export function getRoleDescription(role) {
  return ROLE_DESCRIPTIONS[role] || {
    name: role,
    description: 'Rol sin definir',
    color: '#666',
    icon: '❓',
  };
}
