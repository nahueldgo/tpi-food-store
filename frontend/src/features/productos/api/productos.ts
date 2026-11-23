import { api } from '../../../shared/api/axiosInstance';
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockInput,
} from '../types/producto';

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // Axios arma la query string; los filtros vacios no se envian
  const params = {
    skip: filtros.skip,
    limit: filtros.limit,
    search: filtros.search || undefined,
    categoria_id: filtros.categoria_id,
    disponible: filtros.disponible,
  };
  const { data } = await api.get<ProductosPaginados>('/productos', { params });
  return data;
}

export async function crearProducto(datos: ProductoInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', datos);
  return data;
}

export async function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function actualizarStock(id: number, datos: ProductoStockInput): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
