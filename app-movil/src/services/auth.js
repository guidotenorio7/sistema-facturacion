import { postJson } from '../libs/api.js';

export const loginService = {
  async login(username, password) {
    try {
      const response = await postJson('/login', { username, password });
      
      if (response && response.token) {
        return {
          success: true,
          token: response.token,
          user: response.user || {
            uuid: response.user?.uuid,
            username: response.user?.username,
            fullName: response.user?.fullName,
            roles: response.user?.roles || [],
          },
        };
      }
      
      return {
        success: false,
        error: response?.message || 'Credenciales inválidas',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error en la conexión con el servidor',
      };
    }
  },
};

