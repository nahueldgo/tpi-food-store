import Button from '../ui/Button';

interface PaginacionProps {
  pagina: number;        // empieza en 0
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) {
    return null;
  }
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button variante="secundario" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
        ← Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button variante="secundario" onClick={() => onCambiar(pagina + 1)} disabled={pagina + 1 >= totalPaginas}>
        Siguiente →
      </Button>
    </div>
  );
}

export default Paginacion;
