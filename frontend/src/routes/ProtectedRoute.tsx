import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Rol } from '../features/usuarios/types/usuario';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  roles?: Rol[]; // sin roles: alcanza con tener sesion
}

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    // checkSession todavia esta confirmando la sesion con el backend
    return (
      <div className="flex justify-center py-20 text-gray-500">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        Verificando sesión...
      </div>
    );
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
