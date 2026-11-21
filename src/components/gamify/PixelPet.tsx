import React, { useState } from 'react';
import { soundFx } from '../../audio/synthAudio';

interface PixelPetProps {
  petId: string;
  isFocused?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface FloatingHeart {
  id: number;
  icon: string;
  leftOffset: number;
}

export const PixelPet: React.FC<PixelPetProps> = ({
  petId,
  isFocused = false,
  size = 'sm',
}) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isPetted, setIsPetted] = useState(false);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-10 h-10 p-1',
    md: 'w-14 h-14 p-1.5',
    lg: 'w-20 h-20 p-2',
  }[size];

  const getPetPerkInfo = () => {
    switch (petId) {
      case 'pet-cat':
        return {
          name: 'Mecha Cybercat',
          perk: '+10 Mana Tiap Sesi',
          idleEmote: isFocused ? '⚡' : '💤',
          quotes: ['Nyaaan~! 💖', '*purrrr* ⚡', '(=^･ω･^=)', '*headbonk* 💕', 'Fokus bareng! 🐾'],
        };
      case 'pet-dragon':
        return {
          name: 'Fireling Wyrm',
          perk: '+15 XP Tiap Sesi',
          idleEmote: isFocused ? '🔥' : '💤',
          quotes: ['Kyuuu~! 🔥', '*rawr* 💖', '(੭ˊᵕˋ)੭', 'Api fokus menyala! 🌟', '*snuggle* ⭐'],
        };
      case 'pet-drone':
        return {
          name: 'Omni Observer Bot',
          perk: '+10% DMG Boss',
          idleEmote: isFocused ? '📡' : '💤',
          quotes: ['Beep boop! 💖', '*happy whirr* 📡', '( ^‿^ )', 'Distraksi 0%! 🎯', '100% Love! 💕'],
        };
      case 'pet-slime':
      default:
        return {
          name: 'Pixel Slime',
          perk: '+2 Gold Tiap Sesi',
          idleEmote: isFocused ? '💚' : '💤',
          quotes: ['Poyo~! 💖', '*boing boing* ✨', '(◕ᴗ◕✿)', '*squish* 💚', 'Semangat fokus! ⭐'],
        };
    }
  };

  const petInfo = getPetPerkInfo();

  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playPetChirp();

    // Trigger cute bouncy squish
    setIsPetted(true);
    setTimeout(() => setIsPetted(false), 350);

    // Pick random cute quote
    const randomQuote = petInfo.quotes[Math.floor(Math.random() * petInfo.quotes.length)];
    setActiveQuote(randomQuote);
    setTimeout(() => setActiveQuote(null), 1800);

    // Spawn floating delightful particles
    const icons = ['💖', '✨', '⭐', '💕', '🌸'];
    const newHearts: FloatingHeart[] = [
      { id: Date.now() + 1, icon: icons[Math.floor(Math.random() * icons.length)], leftOffset: -12 + Math.random() * 24 },
      { id: Date.now() + 2, icon: icons[Math.floor(Math.random() * icons.length)], leftOffset: -16 + Math.random() * 32 },
    ];
    setHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1200);
  };

  // High-craft 16x16 Pixel Chibi Pets
  const renderPet = () => {
    switch (petId) {
      case 'pet-cat':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Cybercat Pointy Ears with Glowing Pink Sensors */}
            <rect x="2" y="1" width="2" height="1" fill="#3d348b" />
            <rect x="2" y="2" width="3" height="1" fill="#3d348b" />
            <rect x="1" y="3" width="4" height="1" fill="#3d348b" />
            <rect x="3" y="2" width="1" height="2" fill="#ff007f" />

            <rect x="12" y="1" width="2" height="1" fill="#3d348b" />
            <rect x="11" y="2" width="3" height="1" fill="#3d348b" />
            <rect x="11" y="3" width="4" height="1" fill="#3d348b" />
            <rect x="12" y="2" width="1" height="2" fill="#ff007f" />

            {/* Round Kitty Head */}
            <rect x="2" y="4" width="12" height="6" fill="#5a5099" />
            <rect x="2" y="9" width="12" height="1" fill="#3d348b" />
            {/* Forehead Cyan Circuit */}
            <rect x="7" y="4" width="2" height="1" fill="#00f0ff" />

            {/* Big Starry Neon Cyan Anime Eyes */}
            <rect x="3" y="6" width="3" height="2" fill="#00f0ff" />
            <rect x="4" y="6" width="1" height="1" fill="#03045e" />
            <rect x="3" y="6" width="1" height="1" fill="#ffffff" />

            <rect x="10" y="6" width="3" height="2" fill="#00f0ff" />
            <rect x="11" y="6" width="1" height="1" fill="#03045e" />
            <rect x="12" y="6" width="1" height="1" fill="#ffffff" />

            {/* Cute Pink Cheeks Blush & Nose */}
            <rect x="2" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="13" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="7" y="7" width="2" height="1" fill="#ff758f" />
            {/* Kitten Mouth (:3) */}
            <rect x="6" y="8" width="1" height="1" fill="#221c38" />
            <rect x="9" y="8" width="1" height="1" fill="#221c38" />

            {/* Golden Collar & Glowing Bell */}
            <rect x="3" y="10" width="10" height="1" fill="#ffd700" />
            <rect x="7" y="10" width="2" height="2" fill="#00f0ff" />

            {/* Body & Cute White Tummy Bib */}
            <rect x="3" y="11" width="10" height="3" fill="#3d348b" />
            <rect x="6" y="11" width="4" height="2" fill="#ffffff" />

            {/* Little White Paws with Pink Pads */}
            <rect x="4" y="14" width="2" height="1" fill="#ffffff" />
            <rect x="4" y="14" width="1" height="1" fill="#ff758f" />
            <rect x="10" y="14" width="2" height="1" fill="#ffffff" />
            <rect x="11" y="14" width="1" height="1" fill="#ff758f" />

            {/* Curled Wagging Tail with Neon Cyan Cyber-Tip */}
            <rect x="13" y="12" width="2" height="2" fill="#3d348b" />
            <rect x="14" y="10" width="2" height="2" fill="#3d348b" />
            <rect x="14" y="8" width="2" height="2" fill="#00f0ff" />
            <rect x="15" y="8" width="1" height="1" fill="#ffffff" />
          </svg>
        );

      case 'pet-dragon':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Golden Curled Baby Horns */}
            <rect x="2" y="1" width="2" height="1" fill="#ffe57f" />
            <rect x="3" y="2" width="2" height="2" fill="#ffd700" />
            <rect x="12" y="1" width="2" height="1" fill="#ffe57f" />
            <rect x="11" y="2" width="2" height="2" fill="#ffd700" />

            {/* Chubby Dragon Head */}
            <rect x="3" y="3" width="10" height="6" fill="#d90429" />
            <rect x="3" y="8" width="10" height="1" fill="#9b2226" />
            {/* Golden Head Crest Spike */}
            <rect x="7" y="2" width="2" height="1" fill="#ffd700" />

            {/* Big Warm Amber Anime Eyes */}
            <rect x="4" y="5" width="2" height="2" fill="#ffd166" />
            <rect x="4" y="6" width="2" height="1" fill="#6a040f" />
            <rect x="4" y="5" width="1" height="1" fill="#ffffff" />

            <rect x="10" y="5" width="2" height="2" fill="#ffd166" />
            <rect x="10" y="6" width="2" height="1" fill="#6a040f" />
            <rect x="11" y="5" width="1" height="1" fill="#ffffff" />

            {/* Chubby Blushing Cheeks & Cute Snout */}
            <rect x="3" y="7" width="1" height="1" fill="#ff758f" />
            <rect x="12" y="7" width="1" height="1" fill="#ff758f" />
            <rect x="6" y="6" width="4" height="2" fill="#ef233c" />
            <rect x="7" y="7" width="2" height="1" fill="#6a040f" />

            {/* Tiny Flappy Bat Wings */}
            <rect x="0" y="7" width="3" height="3" fill="#ff758f" />
            <rect x="1" y="8" width="2" height="2" fill="#d90429" />
            <rect x="13" y="7" width="3" height="3" fill="#ff758f" />
            <rect x="13" y="8" width="2" height="2" fill="#d90429" />

            {/* Chubby Red Body & Soft Peach Belly */}
            <rect x="3" y="9" width="10" height="4" fill="#d90429" />
            <rect x="5" y="9" width="6" height="4" fill="#ffe5d9" />
            <rect x="6" y="10" width="4" height="1" fill="#ffd7ba" />
            <rect x="6" y="12" width="4" height="1" fill="#ffd7ba" />

            {/* Cute Little Claws */}
            <rect x="4" y="13" width="2" height="1" fill="#ef233c" />
            <rect x="10" y="13" width="2" height="1" fill="#ef233c" />

            {/* Dragon Tail with Flame Tip Puff */}
            <rect x="12" y="12" width="2" height="2" fill="#d90429" />
            <rect x="13" y="10" width="3" height="3" fill="#ffb703" />
            <rect x="14" y="11" width="1" height="1" fill="#ffffff" />
            {(isFocused || isPetted) && (
              <rect x="15" y="9" width="1" height="1" fill="#ff0055" />
            )}
          </svg>
        );

      case 'pet-drone':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Top Antenna & Blinking Beacon LED */}
            <rect x="6" y="0" width="4" height="2" fill="#ff007f" />
            <rect x="7" y="0" width="2" height="1" fill="#ffffff" />
            <rect x="7" y="2" width="2" height="2" fill="#6c757d" />

            {/* Spherical Metallic White Chassis */}
            <rect x="4" y="3" width="8" height="2" fill="#f8f9fa" />
            <rect x="3" y="4" width="10" height="7" fill="#f8f9fa" />
            <rect x="4" y="11" width="8" height="1" fill="#ced4da" />

            {/* Neon Stabilizer Winglets */}
            <rect x="1" y="6" width="2" height="3" fill="#00f0ff" />
            <rect x="13" y="6" width="2" height="3" fill="#00f0ff" />

            {/* Glossy Dark Oval Visor Screen */}
            <rect x="4" y="5" width="8" height="5" fill="#0b090a" />

            {/* Glowing Cyan Smiling Emoticon Eyes (^ ‿ ^) */}
            <rect x="5" y="6" width="2" height="1" fill="#00f0ff" />
            <rect x="5" y="7" width="1" height="1" fill="#00f0ff" />
            <rect x="9" y="6" width="2" height="1" fill="#00f0ff" />
            <rect x="10" y="7" width="1" height="1" fill="#00f0ff" />

            {/* Digital Pink LED Blush & Smile */}
            <rect x="4" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="11" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="7" y="8" width="2" height="1" fill="#00f0ff" />

            {/* Hover Jet Thruster & Cyan Plume */}
            <rect x="5" y="12" width="6" height="1" fill="#495057" />
            <rect x="6" y="13" width="4" height="2" fill="#00f0ff" />
            <rect x="7" y="13" width="2" height="1" fill="#ffffff" />
            <rect x="7" y="15" width="2" height="1" fill="#ff007f" />
          </svg>
        );

      case 'pet-slime':
      default:
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Translucent Kawaii Bouncy Jelly Slime */}
            {/* Top Teardrop Tip */}
            <rect x="7" y="2" width="2" height="1" fill="#52b788" />
            <rect x="6" y="3" width="4" height="1" fill="#52b788" />

            {/* Slime Main Body Curves */}
            <rect x="5" y="4" width="6" height="1" fill="#74c69d" />
            <rect x="4" y="5" width="8" height="1" fill="#74c69d" />
            <rect x="3" y="6" width="10" height="1" fill="#40916c" />
            <rect x="2" y="7" width="12" height="5" fill="#40916c" />
            <rect x="3" y="12" width="10" height="1" fill="#2d6a4f" />
            <rect x="4" y="13" width="8" height="1" fill="#1b4332" />

            {/* 3D Glossy Light Reflection (Top-Left Highlight) */}
            <rect x="4" y="4" width="2" height="1" fill="#ffffff" />
            <rect x="3" y="5" width="2" height="1" fill="#ffffff" />
            <rect x="3" y="6" width="1" height="2" fill="#d8f3dc" />
            <rect x="4" y="7" width="1" height="1" fill="#b7efc5" />

            {/* Big Kawaii Anime Eyes */}
            <rect x="4" y="7" width="2" height="2" fill="#081c15" />
            <rect x="5" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="10" y="7" width="2" height="2" fill="#081c15" />
            <rect x="11" y="7" width="1" height="1" fill="#ffffff" />

            {/* Rosy Cheek Blush */}
            <rect x="3" y="9" width="2" height="1" fill="#ff758f" />
            <rect x="11" y="9" width="2" height="1" fill="#ff758f" />

            {/* Cute Smile Mouth (v) */}
            <rect x="7" y="9" width="2" height="1" fill="#081c15" />

            {/* Sparkly Dewdrop Bubbles */}
            <rect x="12" y="2" width="1" height="1" fill="#b7efc5" />
            <rect x="13" y="3" width="1" height="1" fill="#ffffff" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={handlePetClick}
      className={`${sizeClasses} inline-flex items-center justify-center bg-[#09080e]/75 border-2 border-[#3b335c] hover:border-[#00f0ff] pixel-corners relative cursor-pointer select-none transition-transform duration-150 ${
        isPetted ? 'scale-125 -rotate-6' : isFocused ? 'animate-bounce' : 'animate-pixel-float hover:scale-110'
      }`}
      style={{ animationDuration: isFocused ? '0.7s' : '2.4s' }}
      title={`${petInfo.name} — Perk Pasif: ${petInfo.perk}. Klik untuk elus & dengarkan suaranya!`}
    >
      {/* Floating Particles on Petting */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute -top-3 text-xs pointer-events-none animate-ping select-none drop-shadow-[0_0_6px_#ff007f]"
          style={{ transform: `translateX(${h.leftOffset}px)` }}
        >
          {h.icon}
        </span>
      ))}

      {/* Dynamic Cute Speech / Emote Bubble */}
      {activeQuote ? (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 bg-[#120f20] border border-[#00f0ff] text-[9px] font-pixel text-[#f0edf6] shadow-[2px_2px_0px_#000] z-20 pointer-events-none animate-bounce">
          {activeQuote}
        </div>
      ) : (
        <span className="absolute -top-3.5 -right-2 text-[11px] select-none pointer-events-none drop-shadow">
          {petInfo.idleEmote}
        </span>
      )}

      {renderPet()}
    </div>
  );
};
