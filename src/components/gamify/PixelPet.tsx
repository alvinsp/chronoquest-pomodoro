import React from 'react';

interface PixelPetProps {
  petId: string;
  isFocused?: boolean;
}

export const PixelPet: React.FC<PixelPetProps> = ({ petId, isFocused = false }) => {
  const renderPet = () => {
    switch (petId) {
      case 'pet-cat':
        return (
          <svg viewBox="0 0 12 12" className="w-full h-full [image-rendering:pixelated]">
            {/* Cybercat Ears */}
            <rect x="2" y="1" width="2" height="2" fill="#00f0ff" />
            <rect x="8" y="1" width="2" height="2" fill="#00f0ff" />
            {/* Head */}
            <rect x="3" y="3" width="6" height="4" fill="#3b335c" />
            {/* Neon Eyes */}
            <rect x="4" y="4" width="1" height="1" fill="#ff0055" />
            <rect x="7" y="4" width="1" height="1" fill="#ff0055" />
            {/* Body */}
            <rect x="3" y="7" width="6" height="4" fill="#221c38" />
            {/* Tail */}
            <rect x="9" y="8" width="2" height="1" fill="#00f0ff" />
            <rect x="10" y="7" width="1" height="1" fill="#00f0ff" />
          </svg>
        );

      case 'pet-dragon':
        return (
          <svg viewBox="0 0 12 12" className="w-full h-full [image-rendering:pixelated]">
            {/* Baby Fire Wyrm */}
            <rect x="4" y="2" width="2" height="2" fill="#ffd700" />
            <rect x="3" y="3" width="6" height="4" fill="#d90429" />
            <rect x="4" y="4" width="1" height="1" fill="#ffd700" />
            <rect x="7" y="4" width="1" height="1" fill="#ffd700" />
            {/* Tiny Wings */}
            <rect x="1" y="4" width="2" height="2" fill="#ff758f" />
            <rect x="9" y="4" width="2" height="2" fill="#ff758f" />
            <rect x="4" y="7" width="4" height="4" fill="#ef233c" />
            {/* Fire Breath particle if focused */}
            {isFocused && <rect x="9" y="5" width="2" height="2" fill="#ffb703" />}
          </svg>
        );

      case 'pet-drone':
        return (
          <svg viewBox="0 0 12 12" className="w-full h-full [image-rendering:pixelated]">
            {/* Omni Observer Bot */}
            <rect x="3" y="2" width="6" height="1" fill="#8d99ae" />
            <rect x="2" y="3" width="8" height="5" fill="#2b2d42" />
            {/* Scanner Eye */}
            <rect x="4" y="4" width="4" height="3" fill="#00f0ff" />
            <rect x="5" y="5" width="2" height="1" fill="#fff" />
            {/* Hover thruster */}
            <rect x="5" y="8" width="2" height="1" fill="#ff0055" />
            <rect x="5" y="9" width="2" height="2" fill="#ffd700" />
          </svg>
        );

      case 'pet-slime':
      default:
        return (
          <svg viewBox="0 0 12 12" className="w-full h-full [image-rendering:pixelated]">
            {/* Cute Slime Blob */}
            <rect x="4" y="3" width="4" height="1" fill="#52b788" />
            <rect x="3" y="4" width="6" height="2" fill="#74c69d" />
            <rect x="2" y="6" width="8" height="4" fill="#40916c" />
            {/* Cute Eyes */}
            <rect x="4" y="6" width="1" height="2" fill="#081c15" />
            <rect x="7" y="6" width="1" height="2" fill="#081c15" />
            {/* Blush */}
            <rect x="3" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="8" y="8" width="1" height="1" fill="#ff758f" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`w-9 h-9 inline-flex items-center justify-center p-1 bg-[#09080e]/60 border border-[#3b335c] pixel-corners ${
        isFocused ? 'animate-bounce' : 'animate-pixel-float'
      }`}
      style={{ animationDuration: '1.8s' }}
      title="Companion Pet"
    >
      {renderPet()}
    </div>
  );
};

