import type { ReactNode } from 'react';

interface ModalProps {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
}

function Modal({ titulo, abierto, onCerrar, children }: ModalProps) {
  if (!abierto) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-700" aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
