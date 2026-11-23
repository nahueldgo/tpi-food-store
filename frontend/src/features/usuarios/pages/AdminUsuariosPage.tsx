import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import Skeleton from '../../../shared/components/Skeleton';
import TablaDatos from '../../../shared/components/TablaDatos';
import Button from '../../../shared/ui/Button';
import { useAuthStore } from '../../../store/authStore';
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '../types/usuario';

function AdminUsuariosPage() {
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const cambiarEstado = useCambiarEstadoUsuario();
  const usuarioActual = useAuthStore((s) => s.usuario);

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { id: 'username', header: 'Usuario', cell: ({ row }) => <span className="font-medium">{row.original.username}</span> },
      { id: 'full_name', header: 'Nombre', cell: ({ row }) => row.original.full_name },
      { id: 'email', header: 'Email', cell: ({ row }) => row.original.email },
      {
        id: 'role',
        header: 'Rol',
        cell: ({ row }) => <span className="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase">{row.original.role}</span>,
      },
      {
        id: 'estado',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="text-red-600">Desactivado</span>
          ) : (
            <span className="text-emerald-700">Activo</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const usuario = row.original;
          if (!usuario.disabled && usuario.id === usuarioActual?.id) {
            return <span className="text-xs text-gray-400">(tu cuenta)</span>; // no se puede desactivar a si mismo
          }
          return usuario.disabled ? (
            <Button
              tamanio="sm"
              disabled={cambiarEstado.isPending}
              onClick={() => cambiarEstado.mutate({ id: usuario.id, activar: true })}
            >
              Activar
            </Button>
          ) : (
            <Button
              tamanio="sm"
              variante="peligro"
              disabled={cambiarEstado.isPending}
              onClick={() => cambiarEstado.mutate({ id: usuario.id, activar: false })}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [cambiarEstado, usuarioActual],
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Usuarios</h1>
      {cambiarEstado.isError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}
      {isPending ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : (
        <TablaDatos datos={data} columnas={columnas} />
      )}
    </div>
  );
}

export default AdminUsuariosPage;
