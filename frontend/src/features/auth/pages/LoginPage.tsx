import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const destino = (location.state as { desde?: string } | null)?.desde ?? '/';

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value);
        navigate(destino, { replace: true });
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Ingresar</h1>
        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim() === '' ? 'Ingresá tu usuario' : undefined) }}
          >
            {(field) => (
              <Input
                id="username"
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value === '' ? 'Ingresá tu contraseña' : undefined) }}
          >
            {(field) => (
              <Input
                id="password"
                type="password"
                label="Contraseña"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([puedeEnviar, enviando]) => (
              <Button type="submit" disabled={!puedeEnviar || enviando}>
                {enviando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">Registrate</Link>
        </p>
      </Card>
    </div>
  );
}

export default LoginPage;
