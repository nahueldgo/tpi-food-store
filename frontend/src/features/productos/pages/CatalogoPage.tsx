import { useDeferredValue, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import EstadoError from '../../../shared/components/EstadoError';
import EstadoVacio from '../../../shared/components/EstadoVacio';
import Paginacion from '../../../shared/components/Paginacion';
import Skeleton from '../../../shared/components/Skeleton';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import ProductoCard from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';

const POR_PAGINA = 8;

function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const busquedaDiferida = useDeferredValue(busqueda); // no consulta en cada tecla

  const { data: categorias } = useCategorias();
  const { data, isPending, isError, error, refetch } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busquedaDiferida.trim() || undefined,
    categoria_id: categoriaId,
  });

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Nuestro menú</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(0);
          }}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value === '' ? undefined : Number(e.target.value));
            setPagina(0);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: POR_PAGINA }, (_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : isError ? (
          <EstadoError mensaje={handleApiError(error)} onReintentar={() => refetch()} />
        ) : data.items.length === 0 ? (
          <EstadoVacio mensaje="No encontramos productos con esos filtros." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.items.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        )}
      </div>
    </div>
  );
}

export default CatalogoPage;
