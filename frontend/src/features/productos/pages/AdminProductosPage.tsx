import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import Skeleton from '../../../shared/components/Skeleton';
import TablaDatos from '../../../shared/components/TablaDatos';
import { formatearPrecio } from '../../../shared/utils/formato';
import Button from '../../../shared/ui/Button';
import Modal from '../../../shared/ui/Modal';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import ProductoForm from '../components/ProductoForm';
import StockForm from '../components/StockForm';
import { useActualizarStock, useEliminarProducto, useGuardarProducto, useProductos } from '../hooks/useProductos';
import type { Producto, ProductoInput, ProductoStockInput } from '../types/producto';

type ModalAbierto = { tipo: 'form'; producto: Producto | null } | { tipo: 'stock'; producto: Producto } | null;

function AdminProductosPage() {
  // El panel pide hasta 100 productos y pagina del lado del cliente
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const guardar = useGuardarProducto();
  const cambiarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [modal, setModal] = useState<ModalAbierto>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const abrir = (nuevo: ModalAbierto) => {
    setErrorModal(null);
    setModal(nuevo);
  };

  const guardarProducto = async (datos: ProductoInput) => {
    if (modal?.tipo !== 'form') return;
    try {
      await guardar.mutateAsync({ id: modal.producto?.id ?? null, datos });
      setModal(null);
    } catch (e) {
      setErrorModal(handleApiError(e));
    }
  };

  const guardarStock = async (datos: ProductoStockInput) => {
    if (modal?.tipo !== 'stock') return;
    try {
      await cambiarStock.mutateAsync({ id: modal.producto.id, datos });
      setModal(null);
    } catch (e) {
      setErrorModal(handleApiError(e));
    }
  };

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      { id: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
      { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
      { id: 'precio', header: 'Precio', cell: ({ row }) => formatearPrecio(row.original.precio_base) },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>
        ),
      },
      { id: 'disponible', header: 'Disponible', cell: ({ row }) => (row.original.disponible ? '✅ Sí' : '⏸️ No') },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button tamanio="sm" variante="secundario" onClick={() => abrir({ tipo: 'form', producto: row.original })}>
              Editar
            </Button>
            <Button tamanio="sm" variante="secundario" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button
              tamanio="sm"
              variante="peligro"
              disabled={eliminar.isPending}
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${row.original.nombre}"?`)) {
                  eliminar.mutate(row.original.id);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Button onClick={() => abrir({ tipo: 'form', producto: null })}>+ Nuevo producto</Button>
      </div>

      {isPending ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos." />
      ) : (
        <TablaDatos datos={data.items} columnas={columnas} />
      )}

      <Modal
        titulo={modal?.tipo === 'form' && modal.producto ? 'Editar producto' : 'Nuevo producto'}
        abierto={modal?.tipo === 'form'}
        onCerrar={() => setModal(null)}
      >
        {modal?.tipo === 'form' && (
          <ProductoForm
            key={modal.producto?.id ?? 'nuevo'}
            producto={modal.producto}
            categorias={categorias}
            error={errorModal}
            onGuardar={guardarProducto}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal titulo="Stock y disponibilidad" abierto={modal?.tipo === 'stock'} onCerrar={() => setModal(null)}>
        {modal?.tipo === 'stock' && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            error={errorModal}
            onGuardar={guardarStock}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

export default AdminProductosPage;
