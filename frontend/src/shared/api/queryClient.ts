import { QueryClient } from '@tanstack/react-query';

// Instancia unica de TanStack Query para toda la aplicacion
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
