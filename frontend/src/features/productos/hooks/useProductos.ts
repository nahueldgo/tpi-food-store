import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from '../api/productos';
import type { FiltrosProductos, ProductoInput, ProductoStockInput } from '../types/producto';

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData, // mantiene la pagina anterior mientras carga la nueva
  });
}

export function useGuardarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number | null; datos: ProductoInput }) =>
      id === null ? crearProducto(datos) : actualizarProducto(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useActualizarStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockInput }) => actualizarStock(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productos'] }),
  });
}
