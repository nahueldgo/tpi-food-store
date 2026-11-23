import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginApi, logoutApi, meApi } from '../features/auth/api/auth';
import type { Credenciales } from '../features/auth/types/auth';
import type { Usuario } from '../features/usuarios/types/usuario';

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (credenciales: Credenciales) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        await loginApi(credenciales);   // el backend deja la cookie HttpOnly
        const usuario = await meApi();   // datos del usuario de la sesion
        set({ usuario });
      },

      logout: async () => {
        try {
          await logoutApi();             // el backend borra la cookie
        } finally {
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        // Se llama al montar la app: confirma con el backend si la cookie sigue valida.
        // Si nunca hubo sesion en este navegador no hace falta preguntar.
        if (get().usuario === null) {
          set({ cargando: false });
          return;
        }
        set({ cargando: true });
        try {
          const usuario = await meApi();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: 'foodstore-auth',
      // Solo se guarda el usuario; el token nunca sale de la cookie HttpOnly
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
);
