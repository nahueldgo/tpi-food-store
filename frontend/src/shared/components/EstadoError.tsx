import Button from '../ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700" role="alert">
      <p>{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" className="mt-3" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default EstadoError;
