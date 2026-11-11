import React from 'react';

interface PixelProgressProps {
  value: number;
  max: number;
  label?: string;
  sublabel?: string;
  variant?: 'xp' | 'hp' | 'mana' | 'gold' | 'neon' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max,
  label,
  sublabel,
  variant = 'xp',
  size = 'md',
  showPercent = false,
}) => {
  const percent = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));

  const variantBar = {
    xp: 'bg-gradient-to-r from-[#8a2be2] via-[#ff007f] to-[#ff0055]',
    hp: 'bg-gradient-to-r from-[#d90429] to-[#ef233c]',
    mana: 'bg-gradient-to-r from-[#0077b6] to-[#00f0ff]',
    gold: 'bg-gradient-to-r from-[#ffb703] to-[#ffd700]',
    neon: 'bg-gradient-to-r from-[#00f0ff] to-[#7000ff]',
    success: 'bg-gradient-to-r from-[#059669] to-[#10b981]',
  }[variant];

  const height = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  }[size];

  return (
    <div className="w-full">
      {(label || sublabel || showPercent) && (
        <div className="flex justify-between items-center text-xs font-silkscreen mb-1 text-[#b5aecd]">
          <span>{label}</span>
          <span>{sublabel ?? (showPercent ? `${Math.round(percent)}%` : `${value}/${max}`)}</span>
        </div>
      )}
      <div className={`w-full bg-[#0a0812] border-2 border-[#3b335c] p-[2px] ${height} relative overflow-hidden`}>
        <div
          className={`h-full ${variantBar} transition-all duration-300 relative`}
          style={{ width: `${percent}%` }}
        >
          {/* Pixel block stripes highlight */}
          <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,#fff_6px,#fff_12px)]" />
        </div>
      </div>
    </div>
  );
};
