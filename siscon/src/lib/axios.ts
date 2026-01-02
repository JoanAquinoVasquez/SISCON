// src/lib/axios.ts
import axios from 'axios';
import { API_URL } from '../config/api';
import { getAuth, signOut } from 'firebase/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de Firebase
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
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
      const errorMessage = error.response?.data?.message || '';
      
      // Detectar si el token fue revocado o es inválido
      if (
        errorMessage.includes('revoked') || 
        errorMessage.includes('Invalid token') ||
        errorMessage.includes('expired')
      ) {
        console.warn('Token revocado o inválido. Cerrando sesión...');
        
        // Cerrar sesión en Firebase
        const auth = getAuth();
        await signOut(auth);
        
        // Limpiar almacenamiento local
        localStorage.clear();
        sessionStorage.clear();
        
        // Recargar la página para ir al login
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
