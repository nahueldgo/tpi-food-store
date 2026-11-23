import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🚫</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">No tenés permiso para ver esta página</h1>
      <Link to="/" className="mt-6 inline-block font-medium text-orange-600 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  );
}

export default UnauthorizedPage;
