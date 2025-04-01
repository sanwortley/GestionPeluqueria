// src/utils/api.js
export const fetchWithTimeout = async (url, options, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response.json();
    } catch (error) {
      console.error('Error en la solicitud API:', error);
    }
  };
  