import React from 'react';
import { sound } from '../lib/audio';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'amber' | 'rose' | 'blue' | 'slate' | 'white' | 'crimson' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'brand',
  size = 'md',
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sound.playPop();
      if (onClick) onClick(e);
    }
  };

  const variants = {
    brand: 'bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-800 shadow-[0_4px_0_0_#1e3a8a] active:shadow-none active:translate-y-1',
    amber: 'bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-none active:translate-y-1',
    rose: 'bg-rose-500 hover:bg-rose-600 text-white border-2 border-rose-700 shadow-[0_4px_0_0_#be123c] active:shadow-none active:translate-y-1',
    crimson: 'bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-800 shadow-[0_4px_0_0_#9f1239] active:shadow-none active:translate-y-1',
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-800 shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-800 shadow-[0_4px_0_0_#1d4ed8] active:shadow-none active:translate-y-1',
    slate: 'bg-slate-700 hover:bg-slate-800 text-white border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] active:shadow-none active:translate-y-1',
    white: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-[0_4px_0_0_#cbd5e1] active:shadow-none active:translate-y-1',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold rounded-xl',
    md: 'px-5 py-2.5 text-sm font-extrabold rounded-2xl',
    lg: 'px-6 py-3.5 text-base font-black rounded-2xl tracking-wide',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-75 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
