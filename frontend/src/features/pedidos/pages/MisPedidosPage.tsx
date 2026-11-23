import { useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import Paginacion from '../../../shared/components/Paginacion';
import Skeleton from '../../../shared/components/Skeleton';
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato';
import BadgeEstado from '../../../shared/ui/BadgeEstado';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import PedidoDetalle from '../components/PedidoDetalle';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';

const POR_PAGINA = 5;

function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [abierto, setAbierto] = useState<number | null>(null);
  const { data, isPending, isError, error, refetch } = usePedidos(pagina * POR_PAGINA, POR_PAGINA);
  const cancelar = useCancelarPedido();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mis pedidos</h1>

      {cancelar.isError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {handleApiError(cancelar.error)}
        </p>
      )}

      {isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste pedidos." />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {data.items.map((pedido) => (
              <Card key={pedido.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="text-sm text-gray-500">{formatearFecha(pedido.created_at)}</span>
                  <span className="ml-auto text-lg font-bold">{formatearPrecio(pedido.total)}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variante="secundario"
                    tamanio="sm"
                    onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                  >
                    {abierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                  </Button>
                  {/* Solo se puede cancelar en PENDIENTE (RN-04) */}
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variante="peligro"
                      tamanio="sm"
                      disabled={cancelar.isPending}
                      onClick={() => {
                        if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) {
                          cancelar.mutate(pedido.id);
                        }
                      }}
                    >
                      Cancelar pedido
                    </Button>
                  )}
                </div>
                {abierto === pedido.id && <PedidoDetalle pedido={pedido} />}
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={Math.ceil(data.total / POR_PAGINA)} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}

export default MisPedidosPage;
