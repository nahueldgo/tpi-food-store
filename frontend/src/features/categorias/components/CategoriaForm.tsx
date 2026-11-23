import { useForm } from '@tanstack/react-form';
import Button from '../../../shared/ui/Button';
import Input from '../../../shared/ui/Input';
import type { Categoria, CategoriaInput } from '../types/categoria';

interface CategoriaFormProps {
  categoria: Categoria | null; // null = alta
  error: string | null;
  onGuardar: (datos: CategoriaInput) => Promise<void>;
  onCancelar: () => void;
}

function CategoriaForm({ categoria, error, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null });
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            return largo < 2 || largo > 100 ? 'Entre 2 y 100 caracteres' : undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="nombre-categoria"
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') || undefined : undefined}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            id="descripcion-categoria"
            label="Descripción"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
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

export default CategoriaForm;
