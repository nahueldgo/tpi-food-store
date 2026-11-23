import { api } from '../../../shared/api/axiosInstance';
import type { Usuario } from '../../usuarios/types/usuario';
import type { Credenciales, MensajeRespuesta, RegistroData } from '../types/auth';

export async function loginApi({ username, password }: Credenciales): Promise<MensajeRespuesta> {
  // El login de OAuth2 se envia como formulario, no como JSON
  const formulario = new URLSearchParams({ username, password });
  const { data } = await api.post<MensajeRespuesta>('/auth/token', formulario);
  return data;
}

export async function registrarApi(datos: RegistroData): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', datos);
  return data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}

export async function meApi(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}
