import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import Skeleton from '../../../shared/components/Skeleton';
import TablaDatos from '../../../shared/components/TablaDatos';
import Button from '../../../shared/ui/Button';
import Modal from '../../../shared/ui/Modal';
import CategoriaForm from '../components/CategoriaForm';
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias';
import type { Categoria, CategoriaInput } from '../types/categoria';

function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias();
  const guardar = useGuardarCategoria();
  const eliminar = useEliminarCategoria();

  // undefined = modal cerrado, null = alta, Categoria = edicion
  const [seleccionada, setSeleccionada] = useState<Categoria | null | undefined>(undefined);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const abrir = (categoria: Categoria | null) => {
    setErrorModal(null);
    setSeleccionada(categoria);
  };

  const guardarCategoria = async (datos: CategoriaInput) => {
    try {
      await guardar.mutateAsync({ id: seleccionada?.id ?? null, datos });
      setSeleccionada(undefined);
    } catch (e) {
      setErrorModal(handleApiError(e)); // por ejemplo, 409 por nombre repetido
    }
  };

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { id: 'id', header: '#', cell: ({ row }) => row.original.id },
      { id: 'nombre', header: 'Nombre', cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
      { id: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button tamanio="sm" variante="secundario" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button
              tamanio="sm"
              variante="peligro"
              disabled={eliminar.isPending}
              onClick={() => {
                if (window.confirm(`¿Dar de baja la categoría "${row.original.nombre}"?`)) {
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
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </div>

      {isPending ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : data.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías." />
      ) : (
        <TablaDatos datos={data} columnas={columnas} />
      )}

      <Modal
        titulo={seleccionada ? 'Editar categoría' : 'Nueva categoría'}
        abierto={seleccionada !== undefined}
        onCerrar={() => setSeleccionada(undefined)}
      >
        {seleccionada !== undefined && (
          <CategoriaForm
            key={seleccionada?.id ?? 'nueva'}
            categoria={seleccionada}
            error={errorModal}
            onGuardar={guardarCategoria}
            onCancelar={() => setSeleccionada(undefined)}
          />
        )}
      </Modal>
    </div>
  );
}

export default AdminCategoriasPage;
