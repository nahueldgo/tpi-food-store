import { useForm } from '@tanstack/react-form';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import type { Producto, ProductoStockInput } from '../types/producto';

interface StockFormProps {
  producto: Producto;
  error: string | null;
  onGuardar: (datos: ProductoStockInput) => Promise<void>;
  onCancelar: () => void;
}

function StockForm({ producto, error, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onGuardar({ stock: Number(value.stock), disponible: value.disponible });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <p className="text-sm text-gray-600">{producto.nombre}</p>
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
            id="stock-nuevo"
            type="number"
            min={0}
            step="1"
            label="Stock"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') || undefined : undefined}
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
              {enviando ? 'Guardando...' : 'Actualizar stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export default StockForm;
