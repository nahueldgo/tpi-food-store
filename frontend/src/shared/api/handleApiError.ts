import axios from 'axios';

// Convierte el error de la API ({"detail": ...}) en un mensaje para mostrar en pantalla
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor.';
    }
    const detalle: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detalle === 'string') {
      return detalle;
    }
    if (Array.isArray(detalle)) {
      // 422 de FastAPI: lista de errores de validacion
      return 'Hay datos inválidos. Revisá el formulario.';
    }
    return `Error ${error.response.status}`;
  }
  return 'Ocurrió un error inesperado.';
}
