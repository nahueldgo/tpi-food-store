import { useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import { useAuthStore } from './store/authStore';

function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Unica llamada en un useEffect: confirmar la sesion al montar la aplicacion
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <AppRouter />;
}

export default App;
