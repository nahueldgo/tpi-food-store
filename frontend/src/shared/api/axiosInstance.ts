import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada';

// Cliente HTTP unico: el navegador adjunta la cookie HttpOnly en cada peticion
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Interceptor de respuesta: si la sesion vencio o la cuenta fue desactivada, limpia la sesion
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const url = error.config?.url ?? '';
      const esLoginOMe = url.endsWith('/auth/token') || url.endsWith('/auth/me');
      const detalle: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail;

      const sesionVencida = error.response.status === 401 && !esLoginOMe;
      const cuentaDesactivada = error.response.status === 400 && detalle === CUENTA_DESACTIVADA;

      if (sesionVencida || cuentaDesactivada) {
        // ProtectedRoute redirige a /login al quedar sin usuario
        useAuthStore.getState().limpiarSesion();
      }
    }
    return Promise.reject(error);
  },
);
