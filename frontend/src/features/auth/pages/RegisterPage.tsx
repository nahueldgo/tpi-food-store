import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import Input from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';
import { registrarApi } from '../api/auth';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await registrarApi(value);
        // Despues del registro se inicia sesion automaticamente
        await login({ username: value.username, password: value.password });
        navigate('/', { replace: true });
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Crear cuenta</h1>
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
            validators={{
              onChange: ({ value }) => (value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="username"
                label="Usuario"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined),
            }}
          >
            {(field) => (
              <Input
                id="full_name"
                label="Nombre completo"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_VALIDO.test(value) ? undefined : 'Email inválido') }}
          >
            {(field) => (
              <Input
                id="email"
                type="email"
                label="Email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.isTouched ? field.state.meta.errors.join(', ') : undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length < 8 ? 'Mínimo 8 caracteres' : undefined) }}
          >
            {(field) => (
              <Input
                id="password"
                type="password"
                label="Contraseña"
                autoComplete="new-password"
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
                {enviando ? 'Creando cuenta...' : 'Registrarme'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">Ingresá</Link>
        </p>
      </Card>
    </div>
  );
}

export default RegisterPage;
