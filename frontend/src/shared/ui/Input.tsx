import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
