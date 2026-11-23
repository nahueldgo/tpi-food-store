import type { HTMLAttributes } from 'react';

function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`} {...props} />;
}

export default Card;
