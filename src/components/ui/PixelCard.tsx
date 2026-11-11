import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'primary' | 'secondary' | 'accent';
  title?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  className = '',
  glow = 'none',
  title,
  badge,
  icon,
}) => {
  const glowClass = {
    none: 'pixel-border',
    primary: 'pixel-border-glow-primary',
    secondary: 'pixel-border-glow-secondary',
    accent: 'pixel-border border-[#ffd700] shadow-[4px_4px_0px_0px_#000,0_0_16px_rgba(255,215,0,0.3)]',
  }[glow];

  return (
    <div className={`bg-[#181528] relative ${glowClass} p-4 sm:p-5 ${className}`}>
      {(title || icon || badge) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2b2545]">
          <div className="flex items-center gap-2">
            {icon && <div className="text-xl flex items-center justify-center">{icon}</div>}
            {title && (
              <h3 className="font-silkscreen font-bold text-sm sm:text-base tracking-wide text-[#f0edf6] uppercase">
                {title}
              </h3>
            )}
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
