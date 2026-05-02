import axios from 'axios';

/**
 * Centralized Axios instance with automatic token injection.
 * All API calls should use this instance instead of raw axios
 * to avoid repeating the auth token boilerplate in every file.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically injects the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return Promise.reject(new Error('Token de autenticación no encontrado'));
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standardizes error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
        || (error.response?.data ? JSON.stringify(error.response.data) : null)
        || error.message
        || 'Error desconocido';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Error inesperado'));
  }
);

export default api;
