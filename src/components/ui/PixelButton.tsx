import React from 'react';
import { soundFx } from '../../audio/synthAudio';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'retro-dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  children,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      soundFx.playClick();
      onClick?.(e);
    }
  };

  const variantStyles = {
    primary: 'bg-[#ff0055] text-white hover:bg-[#ff1a6b] active:bg-[#e6004c]',
    secondary: 'bg-[#00f0ff] text-[#09080e] hover:bg-[#33f3ff] active:bg-[#00d4e0]',
    accent: 'bg-[#ffd700] text-[#09080e] hover:bg-[#ffe033] active:bg-[#e6c200]',
    danger: 'bg-[#ff3b30] text-white hover:bg-[#ff5147] active:bg-[#d92a20]',
    ghost: 'bg-transparent text-white border-white/40 hover:bg-white/10',
    'retro-dark': 'bg-[#211c38] text-[#f0edf6] border-[#3b335c] hover:bg-[#2c264a]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 font-silkscreen gap-1.5',
    md: 'text-sm px-4 py-2 font-silkscreen gap-2',
    lg: 'text-base px-6 py-3 font-pixel gap-3',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`pixel-btn inline-flex items-center justify-center font-bold tracking-wider uppercase cursor-pointer select-none transition-all disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

