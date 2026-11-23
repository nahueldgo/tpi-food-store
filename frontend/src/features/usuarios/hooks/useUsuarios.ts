import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios';

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? activarUsuario(id) : desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
