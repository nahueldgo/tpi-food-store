import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import Skeleton from '../../../shared/components/Skeleton';
import TablaDatos from '../../../shared/components/TablaDatos';
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato';
import BadgeEstado from '../../../shared/ui/BadgeEstado';
import Button from '../../../shared/ui/Button';
import Modal from '../../../shared/ui/Modal';
import PedidoDetalle from '../components/PedidoDetalle';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido';

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
};

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  // El panel pide hasta 100 pedidos y pagina del lado del cliente
  const { data, isPending, isError, error, refetch } = usePedidos(0, 100, estado);
  const cambiarEstado = useCambiarEstadoPedido();

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { id: 'id', header: '#', cell: ({ row }) => <span className="font-medium">{row.original.id}</span> },
      { id: 'fecha', header: 'Fecha', cell: ({ row }) => formatearFecha(row.original.created_at) },
      { id: 'cliente', header: 'Cliente (id)', cell: ({ row }) => row.original.usuario_id },
      { id: 'total', header: 'Total', cell: ({ row }) => formatearPrecio(row.original.total) },
      { id: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button tamanio="sm" variante="secundario" onClick={() => setDetalle(row.original)}>
              Ver
            </Button>
            {/* Solo se ofrecen las transiciones validas de la maquina de estados */}
            {TRANSICIONES[row.original.estado].map((siguiente) => (
              <Button
                key={siguiente}
                tamanio="sm"
                variante={siguiente === 'CANCELADO' ? 'peligro' : 'primario'}
                disabled={cambiarEstado.isPending}
                onClick={() => {
                  if (siguiente !== 'CANCELADO' || window.confirm(`¿Cancelar el pedido #${row.original.id}? Se devolverá el stock.`)) {
                    cambiarEstado.mutate({ id: row.original.id, estado: siguiente });
                  }
                }}
              >
                {textoAccion[siguiente]}
              </Button>
            ))}
          </div>
        ),
      },
    ],
    [cambiarEstado],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <select
          value={estado ?? ''}
          onChange={(e) => setEstado(e.target.value === '' ? undefined : (e.target.value as EstadoPedido))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {cambiarEstado.isError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {isPending ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <TablaDatos datos={data.items} columnas={columnas} />
      )}

      <Modal titulo={`Pedido #${detalle?.id ?? ''}`} abierto={detalle !== null} onCerrar={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>
    </div>
  );
}

export default AdminPedidosPage;
