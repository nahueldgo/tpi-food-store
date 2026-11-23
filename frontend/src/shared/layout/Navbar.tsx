import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-orange-700 text-white' : 'text-orange-50 hover:bg-orange-500'
  }`;

function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadEnCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-orange-600 shadow">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        <NavLink to="/" className="mr-4 text-xl font-bold text-white">
          🍕 Food Store
        </NavLink>

        <NavLink to="/" end className={claseLink}>Catálogo</NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito{cantidadEnCarrito > 0 && ` (${cantidadEnCarrito})`}
        </NavLink>
        {usuario && <NavLink to="/mis-pedidos" className={claseLink}>Mis pedidos</NavLink>}

        {/* El panel solo se muestra al admin (la proteccion real esta en el backend) */}
        {usuario?.role === 'admin' && (
          <>
            <span className="mx-1 h-6 w-px bg-orange-400" />
            <NavLink to="/admin/resumen" className={claseLink}>Resumen</NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>Categorías</NavLink>
            <NavLink to="/admin/productos" className={claseLink}>Productos</NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>Pedidos</NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>Usuarios</NavLink>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-orange-50">
                {usuario.full_name}{' '}
                <span className="rounded bg-orange-800 px-1.5 py-0.5 text-xs uppercase">{usuario.role}</span>
              </span>
              <Button variante="secundario" tamanio="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>Ingresar</NavLink>
              <NavLink to="/register" className={claseLink}>Registrarse</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
