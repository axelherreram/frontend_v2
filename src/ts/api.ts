import axios from 'axios';
import Swal from 'sweetalert2';

const AUTH_BASE = import.meta.env.VITE_AUTH_URL;
const REFRESH_URL = `${AUTH_BASE}/refresh`;
const LOGOUT_URL  = `${AUTH_BASE}/logout`;

/**
 * Centralized Axios instance with automatic token injection and silent token refresh.
 *
 * Security model:
 * - accessToken  → localStorage (1h, renovable)
 * - refreshToken → HttpOnly cookie establecida por el servidor (7d, inaccesible desde JS)
 *
 * Flow on 401:
 *  1. POST /auth/refresh sin body — la cookie viaja automáticamente (withCredentials)
 *  2. Si el refresh es exitoso → guardar nuevo accessToken y reintentar el request original
 *  3. Si el refresh falla     → notificar al usuario y redirigir al login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // ← necesario para que la cookie HttpOnly viaje en cada request
});

// ─── Request interceptor ────────────────────────────────────────────────────
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

// ─── Estado del proceso de refresh ──────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

/**
 * Cierra la sesión del usuario:
 * 1. Llama a POST /auth/logout para que el servidor limpie la cookie HttpOnly
 * 2. Muestra un mensaje explicativo al usuario
 * 3. Limpia localStorage y redirige al login
 */
const forceLogout = async () => {
  // Intentar limpiar la cookie en el servidor (sin esperar resultado)
  try {
    await axios.post(LOGOUT_URL, {}, { withCredentials: true });
  } catch {
    // Si el logout falla, continuar de todas formas
  }

  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');

  // ✅ #11 — Notificar al usuario ANTES de redirigir
  await Swal.fire({
    icon: 'warning',
    title: 'Sesión expirada',
    text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Iniciar sesión',
    allowOutsideClick: false,
  });

  window.location.href = '/';
};

// ─── Response interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Solo actuar en 401, solo una vez por request (_retry anti-loop)
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Si ya hay un refresh en curso → encolar este request
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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ Sin body — el refreshToken viaja automáticamente como cookie HttpOnly
        const { data } = await axios.post(REFRESH_URL, {}, { withCredentials: true });
        const newToken: string = data.token;

        // Guardar nuevo accessToken
        localStorage.setItem('authToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Resolver cola pendiente
        flushQueue(null, newToken);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falló → notificar y desconectar
        flushQueue(refreshError, null);
        await forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Estandarizar mensajes de error para otros códigos
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
