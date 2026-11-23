import type { EstadoPedido } from '../../features/pedidos/types/pedido';

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-sky-100 text-sky-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-gray-200 text-gray-700',
};

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  );
}

export default BadgeEstado;
