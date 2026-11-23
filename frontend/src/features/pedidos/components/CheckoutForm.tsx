import { useForm } from '@tanstack/react-form';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import type { FormaPago } from '../types/pedido';

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string | null;
}

interface CheckoutFormProps {
  enviando: boolean;
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
}

function CheckoutForm({ enviando, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      await onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      });
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
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            return largo < 5 || largo > 200 ? 'La dirección debe tener entre 5 y 200 caracteres' : undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="direccion_entrega"
            label="Dirección de entrega"
            placeholder="Calle, número, piso..."
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') || undefined : undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-1 text-sm font-medium text-gray-700">Forma de pago</legend>
            <div className="flex gap-4">
              {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((opcion) => (
                <label key={opcion} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="forma_pago"
                    value={opcion}
                    checked={field.state.value === opcion}
                    onChange={() => field.handleChange(opcion)}
                    className="accent-orange-600"
                  />
                  {opcion === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="notas" className="text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea
              id="notas"
              rows={2}
              maxLength={500}
              placeholder="Ej: tocar timbre 3B"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(puedeEnviar) => (
          <Button type="submit" disabled={!puedeEnviar || enviando}>
            {enviando ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CheckoutForm;
