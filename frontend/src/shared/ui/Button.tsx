import type { ButtonHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanio?: 'sm' | 'md';
}

const estilos: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'text-gray-600 hover:bg-gray-100',
};

function Button({ variante = 'primario', tamanio = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  const medida = tamanio === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${medida} ${estilos[variante]} ${className}`}
      {...props}
    />
  );
}

export default Button;
