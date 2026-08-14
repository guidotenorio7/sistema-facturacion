import { API_URL } from '../services/config.js';

export async function postJson(endpoint, data) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Intentar parsear JSON del error; si no es JSON, tomar texto bruto
      let msg = 'Error en la respuesta del servidor';
      try {
        const errorData = await response.json();
        msg = errorData.message || JSON.stringify(errorData) || msg;
      } catch (e) {
        try { msg = await response.text(); } catch (e2) { /* ignore */ }
      }
      throw new Error(msg);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getJson(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let msg = 'Error en la respuesta del servidor';
      try {
        const errorData = await response.json();
        msg = errorData.message || JSON.stringify(errorData) || msg;
      } catch (e) {
        try { msg = await response.text(); } catch (e2) { /* ignore */ }
      }
      throw new Error(msg);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
