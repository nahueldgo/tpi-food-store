import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cambiarEstadoPedido, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos';
import type { EstadoPedido } from '../types/pedido';

export function usePedidos(skip: number, limit: number, estado?: EstadoPedido) {
  return useQuery({
    queryKey: ['pedidos', { skip, limit, estado }],
    queryFn: () => listarPedidos(skip, limit, estado),
    placeholderData: keepPreviousData,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      // Cambian los pedidos y tambien el stock de los productos
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen'] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['resumen'] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['resumen'], queryFn: obtenerResumen });
}
