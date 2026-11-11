import React from 'react';

interface PixelAvatarProps {
  avatarId: string;
  isFocused?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  avatarId,
  isFocused = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  // Render SVG 8-bit sprite representations
  const renderSprite = () => {
    switch (avatarId) {
      case 'avatar-hacker':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Cyber Netrunner */}
            <rect x="5" y="1" width="6" height="2" fill="#00f0ff" />
            <rect x="4" y="3" width="8" height="5" fill="#ffd166" />
            {/* Cyber Visor */}
            <rect x="4" y="4" width="8" height="2" fill="#ff0055" />
            <rect x="6" y="4" width="4" height="1" fill="#fff" />
            {/* Body / Jacket */}
            <rect x="3" y="8" width="10" height="5" fill="#1b1b2f" />
            <rect x="5" y="8" width="6" height="5" fill="#00f0ff" />
            {/* Arms */}
            <rect x="2" y="9" width="2" height="4" fill="#1b1b2f" />
            <rect x="12" y="9" width="2" height="4" fill="#1b1b2f" />
            {/* Legs */}
            <rect x="4" y="13" width="3" height="3" fill="#111" />
            <rect x="9" y="13" width="3" height="3" fill="#111" />
          </svg>
        );

      case 'avatar-knight':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Iron Paladin */}
            <rect x="5" y="1" width="6" height="2" fill="#8d99ae" />
            <rect x="4" y="3" width="8" height="5" fill="#4a5568" />
            {/* Helmet Visor Cross */}
            <rect x="7" y="4" width="2" height="4" fill="#ffd700" />
            <rect x="5" y="5" width="6" height="2" fill="#ffd700" />
            {/* Armor Body */}
            <rect x="3" y="8" width="10" height="5" fill="#2b2d42" />
            <rect x="6" y="9" width="4" height="4" fill="#8d99ae" />
            {/* Sword & Shield */}
            <rect x="1" y="7" width="2" height="6" fill="#00f0ff" />
            <rect x="13" y="6" width="2" height="7" fill="#ffd700" />
            {/* Boots */}
            <rect x="4" y="13" width="3" height="3" fill="#1f2421" />
            <rect x="9" y="13" width="3" height="3" fill="#1f2421" />
          </svg>
        );

      case 'avatar-ninja':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Shadow Shinobi */}
            <rect x="5" y="1" width="6" height="2" fill="#222" />
            <rect x="4" y="3" width="8" height="5" fill="#111" />
            {/* Mask & Glowing Eyes */}
            <rect x="5" y="4" width="2" height="1" fill="#ff0055" />
            <rect x="9" y="4" width="2" height="1" fill="#ff0055" />
            <rect x="4" y="5" width="8" height="3" fill="#222" />
            {/* Scarf */}
            <rect x="3" y="7" width="10" height="2" fill="#ff0055" />
            {/* Dark Robes */}
            <rect x="4" y="9" width="8" height="4" fill="#1a1a1a" />
            <rect x="4" y="13" width="3" height="3" fill="#000" />
            <rect x="9" y="13" width="3" height="3" fill="#000" />
          </svg>
        );

      case 'avatar-mage':
      default:
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Chrono Mage Pointy Hat */}
            <rect x="7" y="0" width="2" height="2" fill="#7209b7" />
            <rect x="6" y="2" width="4" height="2" fill="#7209b7" />
            <rect x="4" y="4" width="8" height="2" fill="#7209b7" />
            <rect x="3" y="5" width="10" height="1" fill="#ffd700" />
            {/* Face */}
            <rect x="5" y="6" width="6" height="3" fill="#ffd166" />
            <rect x="6" y="7" width="1" height="1" fill="#00f0ff" />
            <rect x="9" y="7" width="1" height="1" fill="#00f0ff" />
            {/* Robe Body */}
            <rect x="4" y="9" width="8" height="5" fill="#3a0ca3" />
            {/* Magic Staff */}
            <rect x="13" y="6" width="1" height="8" fill="#a0522d" />
            <rect x="12" y="5" width="3" height="2" fill="#00f0ff" />
            <rect x="13" y="4" width="1" height="1" fill="#fff" />
            {/* Feet */}
            <rect x="5" y="14" width="2" height="2" fill="#111" />
            <rect x="9" y="14" width="2" height="2" fill="#111" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 bg-[#09080e] border-2 border-[#3b335c] pixel-corners ${sizeMap} ${
        isFocused ? 'animate-bounce drop-shadow-[0_0_12px_#00f0ff]' : 'animate-pixel-float'
      }`}
    >
      {renderSprite()}
      {isFocused && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00f0ff]"></span>
        </span>
      )}
    </div>
  );
};
