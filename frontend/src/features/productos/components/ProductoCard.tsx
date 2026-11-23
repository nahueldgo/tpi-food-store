import { useState } from 'react';
import { formatearPrecio } from '../../../shared/utils/formato';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';
import type { Producto } from '../types/producto';

interface ProductoCardProps {
  producto: Producto;
}

function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);
  const [imagenRota, setImagenRota] = useState(false);

  const sinStock = producto.stock === 0;
  const puedeAgregar = producto.disponible && producto.stock > enCarrito;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex h-40 items-center justify-center bg-orange-50 text-5xl">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            onError={() => setImagenRota(true)}
          />
        ) : (
          <span aria-hidden="true">🍽️</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium tracking-wide text-orange-600 uppercase">{producto.categoria.nombre}</span>
        <h3 className="mt-1 font-semibold text-gray-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 text-sm text-gray-600">{producto.descripcion}</p>}
        <p className="mt-3 text-xl font-bold text-gray-900">{formatearPrecio(producto.precio_base)}</p>
        <p className={`text-xs ${sinStock ? 'text-red-600' : 'text-gray-500'}`}>
          {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
        </p>
        <Button
          className="mt-auto w-full"
          disabled={!puedeAgregar}
          onClick={() =>
            agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
          }
        >
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en carrito)` : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  );
}

export default ProductoCard;
