import { Navigate, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { formatearPrecio } from '../../../shared/utils/formato';
import Card from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';
import CheckoutForm, { type DatosCheckout } from '../components/CheckoutForm';
import { useCrearPedido } from '../hooks/usePedidos';

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  if (items.length === 0 && !crearPedido.isSuccess) {
    return <Navigate to="/carrito" replace />;
  }

  const confirmar = async (datos: DatosCheckout) => {
    try {
      await crearPedido.mutateAsync({
        ...datos,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });
      vaciar();
      navigate('/mis-pedidos');
    } catch {
      // el error se muestra con crearPedido.error
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h1 className="mb-4 text-xl font-bold text-gray-900">Datos de entrega</h1>
        {crearPedido.isError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {handleApiError(crearPedido.error)}
          </p>
        )}
        <CheckoutForm enviando={crearPedido.isPending} onConfirmar={confirmar} />
      </Card>
      <Card className="h-fit p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Resumen</h2>
        <ul className="divide-y divide-gray-100 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-2">
              <span>{i.cantidad} × {i.nombre}</span>
              <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-orange-600">{formatearPrecio(total)}</span>
        </div>
      </Card>
    </div>
  );
}

export default CheckoutPage;
