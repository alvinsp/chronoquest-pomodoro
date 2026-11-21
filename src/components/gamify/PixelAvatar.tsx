import React from 'react';

interface PixelAvatarProps {
  avatarId: string;
  isFocused?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  avatarId,
  isFocused = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  }[size];

  // Render SVG 8-bit high-craft Chibi Kawaii sprite representations (20x20 pixel grid)
  const renderSprite = () => {
    switch (avatarId) {
      case 'avatar-hacker':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Cyber Kitty Headset: Outer ears & glowing neon pink sensors */}
            <rect x="4" y="1" width="3" height="3" fill="#111222" />
            <rect x="5" y="2" width="1" height="2" fill="#ff007f" />
            <rect x="13" y="1" width="3" height="3" fill="#111222" />
            <rect x="14" y="2" width="1" height="2" fill="#ff007f" />
            {/* Headset Arc & Ear Cushions */}
            <rect x="6" y="2" width="8" height="1" fill="#00f0ff" />
            <rect x="3" y="4" width="2" height="3" fill="#111222" />
            <rect x="15" y="4" width="2" height="3" fill="#111222" />
            <rect x="3" y="5" width="1" height="1" fill="#00f0ff" />
            <rect x="16" y="5" width="1" height="1" fill="#00f0ff" />

            {/* Hair: Turquoise / Mint Anime Bangs */}
            <rect x="5" y="3" width="10" height="2" fill="#48cae4" />
            <rect x="4" y="4" width="3" height="4" fill="#00b4d8" />
            <rect x="13" y="4" width="3" height="4" fill="#00b4d8" />
            <rect x="6" y="4" width="3" height="2" fill="#90e0ef" />
            <rect x="8" y="5" width="2" height="2" fill="#caf0f8" />
            <rect x="11" y="4" width="2" height="2" fill="#90e0ef" />

            {/* Face & Fair Skin Tone */}
            <rect x="5" y="5" width="10" height="6" fill="#ffe0bd" />
            <rect x="5" y="10" width="10" height="1" fill="#f8c291" />

            {/* Cyber Visor on brow (Lifted HUD with holographic glint) */}
            <rect x="5" y="4" width="10" height="1" fill="#ff0055" />
            <rect x="7" y="4" width="3" height="1" fill="#ffffff" />

            {/* Kawaii Anime Sparkling Eyes */}
            {/* Left Eye: Neon Cyan with Sparkle */}
            <rect x="6" y="7" width="2" height="2" fill="#03045e" />
            <rect x="6" y="8" width="2" height="1" fill="#00f0ff" />
            <rect x="6" y="7" width="1" height="1" fill="#ffffff" />
            {/* Right Eye: Neon Magenta with Sparkle */}
            <rect x="12" y="7" width="2" height="2" fill="#03045e" />
            <rect x="12" y="8" width="2" height="1" fill="#ff007f" />
            <rect x="12" y="7" width="1" height="1" fill="#ffffff" />

            {/* Pixel Cyber Blush Cheeks */}
            <rect x="5" y="9" width="1" height="1" fill="#ff007f" />
            <rect x="14" y="9" width="1" height="1" fill="#ff007f" />
            {/* Tiny Smile */}
            <rect x="9" y="9" width="2" height="1" fill="#e56b6f" />

            {/* Netrunner Cyber Jacket (Black with Cyan & Magenta neon pipes) */}
            <rect x="4" y="11" width="12" height="6" fill="#111222" />
            {/* Neon Collars */}
            <rect x="6" y="11" width="2" height="2" fill="#ff007f" />
            <rect x="12" y="11" width="2" height="2" fill="#ff007f" />
            {/* Center Neon Cyan Zipper */}
            <rect x="9" y="12" width="2" height="5" fill="#00f0ff" />

            {/* Sleeves / Arms holding mini cyber datapad */}
            <rect x="3" y="12" width="2" height="4" fill="#1b1b2f" />
            <rect x="15" y="12" width="2" height="4" fill="#1b1b2f" />
            {/* Glowing Datapad in hands */}
            <rect x="8" y="13" width="4" height="3" fill="#00f0ff" />
            <rect x="9" y="14" width="2" height="1" fill="#ffffff" />

            {/* Chunky Cyber Sneakers */}
            <rect x="5" y="17" width="3" height="2" fill="#00f0ff" />
            <rect x="5" y="18" width="3" height="1" fill="#111222" />
            <rect x="12" y="17" width="3" height="2" fill="#00f0ff" />
            <rect x="12" y="18" width="3" height="1" fill="#111222" />
          </svg>
        );

      case 'avatar-knight':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Bouncy Scarlet Plume Feather on Helmet */}
            <rect x="10" y="0" width="3" height="2" fill="#ff4d6d" />
            <rect x="12" y="1" width="3" height="2" fill="#d90429" />
            <rect x="9" y="2" width="2" height="2" fill="#ffd700" />

            {/* Polished Steel Helmet */}
            <rect x="6" y="3" width="8" height="3" fill="#8d99ae" />
            <rect x="7" y="3" width="2" height="1" fill="#ffffff" />
            <rect x="5" y="4" width="10" height="1" fill="#4a5568" />
            {/* Side Helmet Guards */}
            <rect x="4" y="5" width="2" height="5" fill="#8d99ae" />
            <rect x="14" y="5" width="2" height="5" fill="#8d99ae" />

            {/* Visor Open - Cute Anime Warrior Face */}
            <rect x="6" y="5" width="8" height="5" fill="#ffe0bd" />
            <rect x="6" y="9" width="8" height="1" fill="#f8c291" />

            {/* Sparkling Anime Eyes */}
            <rect x="7" y="6" width="2" height="2" fill="#1e293b" />
            <rect x="7" y="7" width="2" height="1" fill="#3a86ff" />
            <rect x="7" y="6" width="1" height="1" fill="#ffffff" />
            <rect x="11" y="6" width="2" height="2" fill="#1e293b" />
            <rect x="11" y="7" width="2" height="1" fill="#3a86ff" />
            <rect x="11" y="6" width="1" height="1" fill="#ffffff" />

            {/* Rosy Blush & Brave Smile */}
            <rect x="6" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="13" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="9" y="8" width="2" height="1" fill="#e56b6f" />

            {/* Steel Chin-guard & Gold Rivet */}
            <rect x="5" y="10" width="10" height="1" fill="#4a5568" />
            <rect x="9" y="10" width="2" height="1" fill="#ffd700" />

            {/* Steel Plate Armor with Gold Cross Insignia */}
            <rect x="5" y="11" width="10" height="5" fill="#8d99ae" />
            <rect x="9" y="11" width="2" height="5" fill="#ffd700" />
            <rect x="6" y="13" width="8" height="1" fill="#ffd700" />
            {/* Royal Navy Under-Tunic */}
            <rect x="4" y="12" width="1" height="4" fill="#1d3557" />
            <rect x="15" y="12" width="1" height="4" fill="#1d3557" />

            {/* Adorable Heater Shield (Left) with Lion/Cross Emblem */}
            <rect x="2" y="10" width="3" height="6" fill="#ffd700" />
            <rect x="3" y="11" width="1" height="4" fill="#e63946" />
            <rect x="3" y="12" width="1" height="2" fill="#ffffff" />

            {/* Glowing Sapphire Runic Sword (Right) */}
            <rect x="16" y="9" width="3" height="1" fill="#ffd700" />
            <rect x="17" y="3" width="1" height="6" fill="#00f0ff" />
            <rect x="17" y="3" width="1" height="1" fill="#ffffff" />

            {/* Steel Greaves & Golden Trim */}
            <rect x="6" y="16" width="3" height="3" fill="#4a5568" />
            <rect x="6" y="16" width="3" height="1" fill="#ffd700" />
            <rect x="11" y="16" width="3" height="3" fill="#4a5568" />
            <rect x="11" y="16" width="3" height="1" fill="#ffd700" />
          </svg>
        );

      case 'avatar-ninja':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Stealth Cat-Ear Hood */}
            <rect x="4" y="1" width="2" height="2" fill="#212529" />
            <rect x="14" y="1" width="2" height="2" fill="#212529" />
            <rect x="5" y="2" width="10" height="3" fill="#161a1d" />
            <rect x="7" y="2" width="3" height="1" fill="#343a40" />

            {/* Crimson Shinobi Headband with Steel Insignia Plate */}
            <rect x="4" y="4" width="12" height="1" fill="#ba181b" />
            <rect x="7" y="4" width="6" height="1" fill="#e0e1dd" />
            <rect x="9" y="4" width="2" height="1" fill="#161a1d" />

            {/* Face Opening & Shinobi Mask */}
            <rect x="5" y="5" width="10" height="3" fill="#ffe0bd" />
            <rect x="5" y="8" width="10" height="3" fill="#212529" />

            {/* Glowing Ruby Cat Anime Eyes */}
            <rect x="6" y="6" width="2" height="2" fill="#590d22" />
            <rect x="6" y="7" width="2" height="1" fill="#ff0055" />
            <rect x="6" y="6" width="1" height="1" fill="#ffffff" />
            <rect x="12" y="6" width="2" height="2" fill="#590d22" />
            <rect x="12" y="7" width="2" height="1" fill="#ff0055" />
            <rect x="12" y="6" width="1" height="1" fill="#ffffff" />

            {/* Cute Rosy Blush peeking over mask */}
            <rect x="5" y="8" width="1" height="1" fill="#ff758f" />
            <rect x="14" y="8" width="1" height="1" fill="#ff758f" />

            {/* Flowing Crimson Ninja Scarf (billowing dynamically to side) */}
            <rect x="5" y="10" width="10" height="2" fill="#e63946" />
            <rect x="2" y="11" width="3" height="2" fill="#d90429" />
            <rect x="0" y="12" width="3" height="2" fill="#e63946" />
            <rect x="1" y="14" width="2" height="2" fill="#ff4d6d" />

            {/* Midnight Shinobi Shozoku Body */}
            <rect x="5" y="12" width="10" height="5" fill="#161a1d" />
            <rect x="7" y="12" width="6" height="3" fill="#343a40" />
            <rect x="6" y="15" width="8" height="1" fill="#e63946" />

            {/* Four-Point Silver Shuriken in Hand */}
            <rect x="16" y="13" width="2" height="2" fill="#ffd700" />
            <rect x="16" y="12" width="2" height="1" fill="#ffffff" />
            <rect x="16" y="15" width="2" height="1" fill="#ffffff" />
            <rect x="15" y="13" width="1" height="2" fill="#ffffff" />
            <rect x="18" y="13" width="1" height="2" fill="#ffffff" />

            {/* Tabi Boots & Ankle Wraps */}
            <rect x="6" y="16" width="3" height="1" fill="#e0e1dd" />
            <rect x="6" y="17" width="3" height="2" fill="#0b090a" />
            <rect x="11" y="16" width="3" height="1" fill="#e0e1dd" />
            <rect x="11" y="17" width="3" height="2" fill="#0b090a" />
          </svg>
        );

      case 'avatar-alchemist':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Jauntily Tilted Emerald Scholar Beret */}
            <rect x="5" y="1" width="7" height="2" fill="#40916c" />
            <rect x="3" y="2" width="12" height="3" fill="#2d6a4f" />
            <rect x="4" y="4" width="11" height="1" fill="#1b4332" />
            {/* Brass Clockwork Gear Brooch */}
            <rect x="13" y="2" width="3" height="3" fill="#ffd166" />
            <rect x="14" y="3" width="1" height="1" fill="#7f4f24" />

            {/* Fluffy Chestnut Anime Bangs */}
            <rect x="4" y="5" width="3" height="2" fill="#8c5a3c" />
            <rect x="8" y="5" width="3" height="2" fill="#b07d62" />
            <rect x="12" y="5" width="3" height="2" fill="#8c5a3c" />
            <rect x="3" y="6" width="1" height="4" fill="#6f452a" />
            <rect x="16" y="6" width="1" height="4" fill="#6f452a" />

            {/* Face & Fair Skin */}
            <rect x="4" y="5" width="12" height="6" fill="#ffe0bd" />
            <rect x="4" y="10" width="12" height="1" fill="#f8c291" />

            {/* Golden Rim Round Spectacles */}
            <rect x="5" y="6" width="3" height="3" fill="#ffd166" />
            <rect x="8" y="7" width="2" height="1" fill="#ffd166" />
            <rect x="10" y="6" width="3" height="3" fill="#ffd166" />

            {/* Sparkling Emerald Eyes behind Glasses */}
            <rect x="6" y="7" width="1" height="1" fill="#2ec4b6" />
            <rect x="6" y="6" width="1" height="1" fill="#ffffff" />
            <rect x="11" y="7" width="1" height="1" fill="#2ec4b6" />
            <rect x="11" y="6" width="1" height="1" fill="#ffffff" />

            {/* Sweet Rosy Cheeks & Smile */}
            <rect x="5" y="9" width="2" height="1" fill="#ff758f" />
            <rect x="11" y="9" width="2" height="1" fill="#ff758f" />
            <rect x="9" y="9" width="2" height="1" fill="#e56b6f" />

            {/* Scholar Frock Coat & Ruffled Cravat */}
            <rect x="4" y="11" width="12" height="5" fill="#1b4332" />
            <rect x="8" y="11" width="4" height="3" fill="#ffffff" />
            <rect x="9" y="14" width="2" height="2" fill="#ffd166" />

            {/* Bubbling Potion Flask (Erlenmeyer flask with glowing elixir) */}
            <rect x="15" y="9" width="1" height="1" fill="#8a5a36" />
            <rect x="15" y="10" width="1" height="2" fill="#caf0f8" />
            <rect x="14" y="12" width="4" height="4" fill="#caf0f8" />
            <rect x="15" y="13" width="2" height="2" fill="#ff007f" />
            <rect x="15" y="13" width="1" height="1" fill="#ffffff" />

            {/* Leather Boots with Brass Buckles */}
            <rect x="5" y="16" width="3" height="3" fill="#382923" />
            <rect x="6" y="17" width="1" height="1" fill="#ffd166" />
            <rect x="11" y="16" width="3" height="3" fill="#382923" />
            <rect x="12" y="17" width="1" height="1" fill="#ffd166" />
          </svg>
        );

      case 'avatar-valkyrie':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Radiant Feather Wings on Tiara */}
            <rect x="1" y="1" width="2" height="2" fill="#ffffff" />
            <rect x="2" y="2" width="3" height="3" fill="#ffffff" />
            <rect x="3" y="4" width="2" height="1" fill="#caf0f8" />
            <rect x="17" y="1" width="2" height="2" fill="#ffffff" />
            <rect x="15" y="2" width="3" height="3" fill="#ffffff" />
            <rect x="15" y="4" width="2" height="1" fill="#caf0f8" />

            {/* Golden Winged Tiara & Sapphire Gem */}
            <rect x="5" y="3" width="10" height="1" fill="#ffd700" />
            <rect x="9" y="2" width="2" height="2" fill="#00f0ff" />
            <rect x="9" y="2" width="1" height="1" fill="#ffffff" />

            {/* Lush Flowing Golden-Blonde Locks */}
            <rect x="5" y="4" width="10" height="2" fill="#ffd166" />
            <rect x="4" y="5" width="2" height="2" fill="#ffe57f" />
            <rect x="8" y="5" width="2" height="2" fill="#ffe57f" />
            <rect x="12" y="5" width="2" height="2" fill="#ffd166" />
            {/* Flowing side locks */}
            <rect x="3" y="6" width="2" height="8" fill="#ffd166" />
            <rect x="3" y="7" width="1" height="4" fill="#ffe57f" />
            <rect x="15" y="6" width="2" height="8" fill="#ffd166" />
            <rect x="16" y="7" width="1" height="4" fill="#ffe57f" />

            {/* Face & Celestial Eyes */}
            <rect x="5" y="5" width="10" height="6" fill="#ffe0bd" />
            <rect x="5" y="10" width="10" height="1" fill="#f8c291" />

            {/* Sparkling Celestial Sapphire Eyes */}
            <rect x="6" y="7" width="2" height="2" fill="#0077b6" />
            <rect x="6" y="8" width="2" height="1" fill="#00b4d8" />
            <rect x="6" y="7" width="1" height="1" fill="#ffffff" />
            <rect x="12" y="7" width="2" height="2" fill="#0077b6" />
            <rect x="12" y="8" width="2" height="1" fill="#00b4d8" />
            <rect x="12" y="7" width="1" height="1" fill="#ffffff" />

            {/* Rosy Blush & Sweet Smile */}
            <rect x="5" y="9" width="2" height="1" fill="#ff758f" />
            <rect x="13" y="9" width="2" height="1" fill="#ff758f" />
            <rect x="9" y="9" width="2" height="1" fill="#e56b6f" />

            {/* Radiant Holy White & Gold Armor Dress */}
            <rect x="5" y="11" width="10" height="5" fill="#ffffff" />
            <rect x="6" y="11" width="8" height="3" fill="#ffd700" />
            <rect x="7" y="14" width="6" height="2" fill="#90e0ef" />

            {/* Celestial Sun Prism Lance (Right side) */}
            <rect x="18" y="5" width="1" height="13" fill="#ffd700" />
            <rect x="17" y="2" width="3" height="3" fill="#ffffff" />
            <rect x="18" y="1" width="1" height="1" fill="#ffd700" />
            <rect x="18" y="3" width="1" height="1" fill="#00f0ff" />

            {/* Gilded Valkyrie Boots */}
            <rect x="6" y="16" width="3" height="3" fill="#ffd700" />
            <rect x="6" y="18" width="3" height="1" fill="#b08968" />
            <rect x="11" y="16" width="3" height="3" fill="#ffd700" />
            <rect x="11" y="18" width="3" height="1" fill="#b08968" />
          </svg>
        );

      case 'avatar-mecha':
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Cyber Bunny Antennae with Pulsing Neon Pink Tips */}
            <rect x="5" y="0" width="2" height="1" fill="#ff007f" />
            <rect x="5" y="1" width="2" height="3" fill="#48cae4" />
            <rect x="13" y="0" width="2" height="1" fill="#ff007f" />
            <rect x="13" y="1" width="2" height="3" fill="#48cae4" />

            {/* Rounded Pearlescent White Chibi Chassis Head */}
            <rect x="5" y="3" width="10" height="2" fill="#ffffff" />
            <rect x="4" y="4" width="12" height="7" fill="#ffffff" />
            {/* Pastel Cyan Side Pods */}
            <rect x="3" y="5" width="1" height="4" fill="#00b4d8" />
            <rect x="16" y="5" width="1" height="4" fill="#00b4d8" />

            {/* Glossy Dark Glass Emoticon Screen */}
            <rect x="5" y="5" width="10" height="5" fill="#0a1128" />

            {/* Glowing Neon Cyan Smiling Digital Emoticon Eyes (^ ‿ ^) */}
            <rect x="6" y="6" width="2" height="1" fill="#00f0ff" />
            <rect x="6" y="7" width="1" height="1" fill="#00f0ff" />
            <rect x="12" y="6" width="2" height="1" fill="#00f0ff" />
            <rect x="13" y="7" width="1" height="1" fill="#00f0ff" />

            {/* Glowing Digital Pink Heart Blush */}
            <rect x="5" y="8" width="2" height="1" fill="#ff007f" />
            <rect x="13" y="8" width="2" height="1" fill="#ff007f" />
            {/* Digital Cyan Smile */}
            <rect x="9" y="8" width="2" height="1" fill="#00f0ff" />

            {/* Chassis Body & Shoulder Joints */}
            <rect x="5" y="11" width="10" height="5" fill="#e2eafc" />
            <rect x="3" y="11" width="2" height="3" fill="#48cae4" />
            <rect x="15" y="11" width="2" height="3" fill="#48cae4" />

            {/* Glowing Heart Reactor Core on Chest */}
            <rect x="8" y="12" width="4" height="3" fill="#1b1b2f" />
            <rect x="8" y="12" width="1" height="1" fill="#ff007f" />
            <rect x="11" y="12" width="1" height="1" fill="#ff007f" />
            <rect x="8" y="13" width="4" height="1" fill="#ff007f" />
            <rect x="9" y="14" width="2" height="1" fill="#ff007f" />
            <rect x="9" y="13" width="1" height="1" fill="#ffffff" />

            {/* Anti-Gravity Hover Thrusters & Neon Exhaust */}
            <rect x="6" y="16" width="3" height="1" fill="#0077b6" />
            <rect x="11" y="16" width="3" height="1" fill="#0077b6" />
            {/* Plasma Hover Flames */}
            <rect x="6" y="17" width="3" height="2" fill="#00f0ff" />
            <rect x="7" y="17" width="1" height="2" fill="#ffffff" />
            <rect x="11" y="17" width="3" height="2" fill="#00f0ff" />
            <rect x="12" y="17" width="1" height="2" fill="#ffffff" />
          </svg>
        );

      case 'avatar-mage':
      default:
        return (
          <svg viewBox="0 0 20 20" className="w-full h-full [image-rendering:pixelated]" shapeRendering="crispEdges">
            {/* Tilted Floppy Pointy Wizard Hat with Curled Tip */}
            <rect x="11" y="0" width="2" height="1" fill="#7209b7" />
            <rect x="10" y="1" width="3" height="1" fill="#7209b7" />
            <rect x="8" y="2" width="5" height="2" fill="#560bad" />
            <rect x="7" y="3" width="6" height="1" fill="#7209b7" />
            <rect x="5" y="4" width="10" height="2" fill="#7209b7" />
            {/* Gold Star Buckle & Ribbon */}
            <rect x="5" y="5" width="10" height="1" fill="#ffd700" />
            <rect x="9" y="5" width="2" height="1" fill="#ffffff" />
            {/* Wide Hat Brim */}
            <rect x="3" y="6" width="14" height="1" fill="#3a0ca3" />

            {/* Soft Lilac / Lavender Bangs */}
            <rect x="5" y="7" width="2" height="3" fill="#b5179e" />
            <rect x="7" y="7" width="1" height="2" fill="#c77dff" />
            <rect x="12" y="7" width="1" height="2" fill="#c77dff" />
            <rect x="13" y="7" width="2" height="3" fill="#b5179e" />
            <rect x="4" y="7" width="1" height="4" fill="#7209b7" />
            <rect x="15" y="7" width="1" height="4" fill="#7209b7" />

            {/* Fair Skin Face */}
            <rect x="6" y="7" width="8" height="5" fill="#ffe0bd" />
            <rect x="6" y="11" width="8" height="1" fill="#f8c291" />

            {/* Sparkling Anime Eyes (Cosmic Violet & Cyan with white catchlight) */}
            <rect x="7" y="8" width="2" height="2" fill="#240046" />
            <rect x="7" y="9" width="2" height="1" fill="#00f0ff" />
            <rect x="7" y="8" width="1" height="1" fill="#ffffff" />
            <rect x="11" y="8" width="2" height="2" fill="#240046" />
            <rect x="11" y="9" width="2" height="1" fill="#00f0ff" />
            <rect x="11" y="8" width="1" height="1" fill="#ffffff" />

            {/* Rosy Cheek Blush & Sweet Smile */}
            <rect x="6" y="10" width="1" height="1" fill="#ff758f" />
            <rect x="13" y="10" width="1" height="1" fill="#ff758f" />
            <rect x="9" y="10" width="2" height="1" fill="#e56b6f" />

            {/* White Fur/Lace Collar & Cyan Gem Brooch */}
            <rect x="6" y="12" width="8" height="1" fill="#ffffff" />
            <rect x="9" y="12" width="2" height="1" fill="#00f0ff" />

            {/* Royal Indigo Wizard Robe with Gold Front Ribbon */}
            <rect x="5" y="13" width="10" height="4" fill="#3a0ca3" />
            <rect x="5" y="13" width="1" height="4" fill="#240046" />
            <rect x="9" y="13" width="2" height="4" fill="#ffd700" />
            {/* Sleeves */}
            <rect x="4" y="13" width="1" height="3" fill="#3a0ca3" />
            <rect x="15" y="13" width="1" height="3" fill="#3a0ca3" />

            {/* Chrono Star Magic Staff (Held on right side with celestial sparkles) */}
            <rect x="17" y="7" width="1" height="11" fill="#8a5a36" />
            {/* Star Crystal Head */}
            <rect x="16" y="4" width="3" height="3" fill="#00f0ff" />
            <rect x="17" y="5" width="1" height="1" fill="#ffffff" />
            {/* Magic Glints */}
            <rect x="15" y="5" width="1" height="1" fill="#ffd700" />
            <rect x="19" y="5" width="1" height="1" fill="#ffd700" />
            <rect x="17" y="3" width="1" height="1" fill="#ffd700" />

            {/* Little Wizard Boots */}
            <rect x="6" y="17" width="3" height="2" fill="#10002b" />
            <rect x="11" y="17" width="3" height="2" fill="#10002b" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center p-2 bg-[#09080e] border-2 border-[#3b335c] pixel-corners ${sizeMap} ${
        isFocused ? 'animate-bounce drop-shadow-[0_0_14px_rgba(0,240,255,0.7)]' : 'animate-pixel-float'
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
