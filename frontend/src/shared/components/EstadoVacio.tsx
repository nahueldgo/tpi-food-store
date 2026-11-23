import type { ReactNode } from 'react';

function EstadoVacio({ mensaje, children }: { mensaje: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
      <p>{mensaje}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default EstadoVacio;
