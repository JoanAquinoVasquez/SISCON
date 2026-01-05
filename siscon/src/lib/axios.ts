// src/lib/axios.ts
import axios from 'axios';
import { API_URL } from '../config/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el token fue revocado o es inválido, cerrar sesión automáticamente
    if (error.response?.status === 401) {
      console.warn('Token revocado o inválido. Cerrando sesión...');
      
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token');
      
      // Recargar la página para ir al login
      window.location.href = '/siscon/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
