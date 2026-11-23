import { useForm } from '@tanstack/react-form';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import type { Categoria } from '../../categorias/types/categoria';
import type { Producto, ProductoInput } from '../types/producto';

interface ProductoFormProps {
  producto: Producto | null; // null = alta
  categorias: Categoria[];
  error: string | null;
  onGuardar: (datos: ProductoInput) => Promise<void>;
  onCancelar: () => void;
}

function ProductoForm({ producto, categorias, error, onGuardar, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },
    onSubmit: async ({ value }) => {
      await onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      });
    },
  });

  const mensajeError = (errores: unknown[], tocado: boolean) => (tocado ? errores.join(', ') || undefined : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
      >
        {(field) => (
          <Input
            id="nombre"
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={mensajeError(field.state.meta.errors, field.state.meta.isTouched)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Input
            id="descripcion"
            label="Descripción"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              value === '' || Number(value) < 0 ? 'Precio mayor o igual a 0' : undefined,
          }}
        >
          {(field) => (
            <Input
              id="precio_base"
              type="number"
              min={0}
              step="0.01"
              label="Precio ($)"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta.errors, field.state.meta.isTouched)}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              value === '' || Number(value) < 0 || !Number.isInteger(Number(value))
                ? 'Entero mayor o igual a 0'
                : undefined,
          }}
        >
          {(field) => (
            <Input
              id="stock"
              type="number"
              min={0}
              step="1"
              label="Stock"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={mensajeError(field.state.meta.errors, field.state.meta.isTouched)}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value === '' ? 'Elegí una categoría' : undefined) }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">Categoría</label>
            <select
              id="categoria_id"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            id="imagen_url"
            type="url"
            label="URL de la imagen (opcional)"
            placeholder="https://..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>Cancelar</Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar || enviando}>
              {enviando ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export default ProductoForm;
