import { formatearPrecio } from '../../../shared/utils/formato';
import type { Pedido } from '../types/pedido';

function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm">
      <table className="w-full">
        <thead className="text-left text-xs text-gray-500 uppercase">
          <tr>
            <th className="pb-2">Producto</th>
            <th className="pb-2 text-right">Precio</th>
            <th className="pb-2 text-right">Cant.</th>
            <th className="pb-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((linea) => (
            <tr key={linea.producto_id}>
              {/* nombre y precio copiados al momento de la compra */}
              <td className="py-1">{linea.nombre_producto}</td>
              <td className="py-1 text-right">{formatearPrecio(linea.precio_unitario)}</td>
              <td className="py-1 text-right">{linea.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(linea.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 grid gap-1 border-t pt-3 text-gray-600">
        <p><strong>Entrega:</strong> {pedido.direccion_entrega}</p>
        <p><strong>Pago:</strong> {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</p>
        {pedido.notas && <p><strong>Notas:</strong> {pedido.notas}</p>}
      </div>
    </div>
  );
}

export default PedidoDetalle;
