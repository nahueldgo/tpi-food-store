import { Link, useNavigate } from 'react-router-dom';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import { formatearPrecio } from '../../../shared/utils/formato';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';

function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío.">
        <Link to="/" className="font-medium text-orange-600 hover:underline">Ver el menú</Link>
      </EstadoVacio>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Tu carrito</h1>
      <Card className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium text-gray-900">{item.nombre}</p>
              <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variante="secundario" tamanio="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
                −
              </Button>
              <span className="w-8 text-center font-medium">{item.cantidad}</span>
              <Button variante="secundario" tamanio="sm" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
            <Button variante="fantasma" tamanio="sm" onClick={() => quitar(item.producto_id)} aria-label={`Quitar ${item.nombre}`}>
              ✕
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-orange-600">{formatearPrecio(total)}</span>
        </div>
      </Card>
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Button variante="secundario" onClick={vaciar}>Vaciar carrito</Button>
        <Button onClick={() => navigate('/checkout')}>Confirmar pedido →</Button>
      </div>
    </div>
  );
}

export default CarritoPage;
