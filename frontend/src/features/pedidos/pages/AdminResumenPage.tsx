import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import Skeleton from '../../../shared/components/Skeleton';
import { formatearPrecio } from '../../../shared/utils/formato';
import ResumenCard from '../components/ResumenCard';
import { useResumenPedidos } from '../hooks/usePedidos';

function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Resumen del negocio</h1>
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos de hoy" valor={String(data.pedidos_hoy)} icono="📅" color="bg-orange-100" />
          <ResumenCard titulo="Pendientes" valor={String(data.pendientes)} icono="⏳" color="bg-amber-100" />
          <ResumenCard titulo="En preparación" valor={String(data.en_preparacion)} icono="👨‍🍳" color="bg-sky-100" />
          <ResumenCard titulo="Entregados" valor={String(data.entregados)} icono="✅" color="bg-emerald-100" />
          <ResumenCard titulo="Cancelados" valor={String(data.cancelados)} icono="❌" color="bg-gray-200" />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            icono="💰"
            color="bg-emerald-100"
          />
        </div>
      )}
    </div>
  );
}

export default AdminResumenPage;
