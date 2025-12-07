import { API_URL } from './config';

const userService = {
  async getUsers(token) {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.log('Error fetching users:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener usuarios',
      };
    }
  },

  async createUser(userData, token) {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log('Error creating user:', error);
      return {
        success: false,
        error: error.message || 'Error al crear usuario',
      };
    }
  },

  async updateUser(uuid, userData, token) {
    try {
      const response = await fetch(`${API_URL}/user/${uuid}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.log('Error updating user:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar usuario',
      };
    }
  },

  async deleteUser(uuid, token) {
    try {
      const response = await fetch(`${API_URL}/user/${uuid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.log('Error deleting user:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar usuario',
      };
    }
  },
};

export default userService;
