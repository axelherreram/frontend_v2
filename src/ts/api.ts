import axios from 'axios';

const REFRESH_URL = `${import.meta.env.VITE_AUTH_URL}/refresh`;

/**
 * Centralized Axios instance with automatic token injection and silent token refresh.
 *
 * Features:
 * - Request interceptor: injects `Authorization: Bearer <token>` on every request.
 * - Response interceptor: on 401, attempts a silent refresh via POST /auth/refresh.
 *   If successful, the original request is retried with the new token.
 *   If the refresh also fails (expired/invalid refreshToken), the user is logged out
 *   and redirected to the login page.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Inyecta el access token en cada request automáticamente.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flag para evitar múltiples refreshes simultáneos (evita loop infinito)
let isRefreshing = false;
// Cola de requests que llegaron mientras el refresh estaba en curso
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Resuelve o rechaza todos los requests en cola tras el intento de refresh */
const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  pendingQueue = [];
};

/** Limpia localStorage y redirige al login */
const forceLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  window.location.href = '/';
};

// ─── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo actuar en 401 y solo una vez por request (_retry flag anti-loop)
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      const refreshToken = localStorage.getItem('refreshToken');

      // Sin refresh token → logout directo
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      // Si ya hay un refresh en curso, encolar este request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      // Marcar como en proceso de refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(REFRESH_URL, { refreshToken });
        const newToken: string = data.token;

        // Guardar el nuevo access token
        localStorage.setItem('authToken', newToken);

        // Actualizar header por defecto para futuros requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Resolver todos los requests en cola
        flushQueue(null, newToken);

        // Reintentar el request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // El refresh token también expiró o es inválido → logout
        flushQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores: estandarizar el mensaje
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        (error.response?.data ? JSON.stringify(error.response.data) : null) ||
        error.message ||
        'Error desconocido';
      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error('Error inesperado'));
  },
);

export default api;
