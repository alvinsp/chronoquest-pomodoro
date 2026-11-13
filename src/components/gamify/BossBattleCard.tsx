import React from 'react';
import { Skull, Swords, Trophy, Sparkles, Coins, Zap, Award } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelProgress } from '../ui/PixelProgress';

export const BossBattleCard: React.FC<{ isFocused?: boolean }> = ({ isFocused = false }) => {
  const { bosses, activeBossIndex, recentBossDefeat, clearBossAlert, openBossLootChest } = useGamifyStore();

  const currentBoss = bosses[activeBossIndex] || bosses[0];

  const renderBossSprite = () => {
    switch (currentBoss.avatar) {
      case 'phantom':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Doomscroll Phantom */}
            <rect x="5" y="1" width="6" height="3" fill="#b5179e" />
            <rect x="3" y="4" width="10" height="6" fill="#7209b7" />
            {/* Glowing Smartphone eyes */}
            <rect x="4" y="6" width="3" height="3" fill="#00f0ff" />
            <rect x="9" y="6" width="3" height="3" fill="#00f0ff" />
            <rect x="5" y="7" width="1" height="1" fill="#fff" />
            <rect x="10" y="7" width="1" height="1" fill="#fff" />
            {/* Wispy Ghost Tails */}
            <rect x="3" y="10" width="2" height="4" fill="#560bad" />
            <rect x="7" y="10" width="2" height="5" fill="#560bad" />
            <rect x="11" y="10" width="2" height="4" fill="#560bad" />
          </svg>
        );

      case 'golem':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Sloth Behemoth / Golem */}
            <rect x="4" y="2" width="8" height="3" fill="#4a5568" />
            <rect x="3" y="5" width="10" height="7" fill="#2d3748" />
            {/* Sleepy Red Eyes */}
            <rect x="5" y="6" width="2" height="1" fill="#ff0055" />
            <rect x="9" y="6" width="2" height="1" fill="#ff0055" />
            {/* Moss / Sloth vines */}
            <rect x="3" y="8" width="2" height="3" fill="#38a169" />
            <rect x="11" y="7" width="2" height="4" fill="#38a169" />
            {/* Heavy Stone Fists */}
            <rect x="1" y="7" width="3" height="6" fill="#1a202c" />
            <rect x="12" y="7" width="3" height="6" fill="#1a202c" />
            <rect x="5" y="12" width="6" height="3" fill="#1a202c" />
          </svg>
        );

      case 'hydra':
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Hydra of Multitasking - Multiheaded */}
            {/* Center head */}
            <rect x="6" y="1" width="4" height="4" fill="#e63946" />
            <rect x="7" y="2" width="1" height="1" fill="#ffd700" />
            <rect x="9" y="2" width="1" height="1" fill="#ffd700" />
            {/* Left head */}
            <rect x="2" y="3" width="3" height="4" fill="#d90429" />
            <rect x="3" y="4" width="1" height="1" fill="#ffd700" />
            {/* Right head */}
            <rect x="11" y="3" width="3" height="4" fill="#d90429" />
            <rect x="12" y="4" width="1" height="1" fill="#ffd700" />
            {/* Massive Dragon Body */}
            <rect x="3" y="7" width="10" height="7" fill="#6a040f" />
            <rect x="4" y="14" width="3" height="2" fill="#370617" />
            <rect x="9" y="14" width="3" height="2" fill="#370617" />
          </svg>
        );

      case 'demon':
      default:
        return (
          <svg viewBox="0 0 16 16" className="w-full h-full [image-rendering:pixelated]">
            {/* Lord Procrastinus */}
            {/* Horns */}
            <rect x="3" y="1" width="2" height="3" fill="#ff0055" />
            <rect x="11" y="1" width="2" height="3" fill="#ff0055" />
            {/* Face */}
            <rect x="4" y="3" width="8" height="6" fill="#800f2f" />
            {/* Evil Eyes */}
            <rect x="5" y="5" width="2" height="2" fill="#ffd700" />
            <rect x="9" y="5" width="2" height="2" fill="#ffd700" />
            {/* Smug evil grin */}
            <rect x="6" y="8" width="4" height="1" fill="#fff" />
            {/* Body */}
            <rect x="3" y="9" width="10" height="5" fill="#590d22" />
            <rect x="2" y="10" width="2" height="4" fill="#800f2f" />
            <rect x="12" y="10" width="2" height="4" fill="#800f2f" />
            {/* Legs */}
            <rect x="4" y="14" width="3" height="2" fill="#2b0914" />
            <rect x="9" y="14" width="3" height="2" fill="#2b0914" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 relative overflow-hidden">
      {/* Background Boss Glow */}
      <div className="absolute top-0 left-0 -mt-8 -ml-8 w-36 h-36 bg-[#ff0055]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Interactive Boss Defeated Loot Chest */}
      {recentBossDefeat && !recentBossDefeat.isOpened && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#241704] via-[#452b07] to-[#241704] border-2 border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.35)] text-center space-y-2.5">
          <div className="flex items-center justify-center gap-2 text-[#ffd700] font-pixel text-xs sm:text-sm animate-pulse">
            <Trophy size={18} />
            <span>VICTORY! BOS {recentBossDefeat.bossName.toUpperCase()} DIKALAHKAN!</span>
          </div>
          <p className="font-silkscreen text-xs text-[#f5e6a3]">
            Monster distorsi waktu telah takluk! Bos menjatuhkan peti harta karun legendaris.
          </p>
          <div className="py-1">
            <button
              type="button"
              onClick={openBossLootChest}
              className="px-5 py-2.5 bg-[#ffd700] hover:bg-[#ffe14d] active:bg-[#e6c200] text-black font-pixel text-xs font-bold border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer inline-flex items-center gap-2 transform hover:scale-105 transition-all"
            >
              <span>🎁 BUKA PETI HARTA BOSS!</span>
            </button>
          </div>
        </div>
      )}

      {/* Loot Chest Opened Banner */}
      {recentBossDefeat && recentBossDefeat.isOpened && (
        <div className="mb-4 p-3.5 bg-[#14281c] border-2 border-[#00ff66] shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Award size={22} className="text-[#00ff66] shrink-0 mt-0.5" />
            <div>
              <span className="font-pixel text-[11px] text-[#00ff66] block">
                HADIAH KEMENANGAN KLAIM SUKSES!
              </span>
              <p className="font-silkscreen text-xs text-[#d8fced] mt-0.5">
                👑 Gelar Baru: <strong className="text-[#ffd700] underline">{recentBossDefeat.droppedTitle}</strong> • +{recentBossDefeat.gold} Gold • +{recentBossDefeat.xp} XP
              </p>
              <span className="text-[10px] text-[#7ce0b2] block mt-0.5 font-silkscreen">
                ⚡ Buff Aktif: {recentBossDefeat.buffDescription}
              </span>
            </div>
          </div>
          <button
            onClick={clearBossAlert}
            className="px-3 py-1 bg-black text-[#00ff66] border border-[#00ff66] hover:bg-[#00ff66] hover:text-black font-pixel text-[10px] cursor-pointer transition-all self-end sm:self-center"
          >
            LANJUTKAN
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Animated Boss Sprite Box */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 p-2 bg-[#0d0915] border-3 border-[#ff0055] shadow-[3px_3px_0px_#000] shrink-0 relative ${
            isFocused ? 'animate-pulse scale-105' : 'animate-pixel-float'
          }`}
        >
          {renderBossSprite()}
          <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-[#ff0055] text-white text-[9px] font-pixel border border-black flex items-center gap-0.5">
            <Skull size={10} /> BOS
          </span>
        </div>

        {/* Boss Details & HP Bar */}
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-1 mb-1">
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#ff0055] flex items-center justify-center sm:justify-start gap-1.5">
                <Swords size={14} />
                {currentBoss.name}
              </h3>
              <p className="font-silkscreen text-[11px] text-[#ffd700]">{currentBoss.title}</p>
            </div>

            {/* Boss Bounty */}
            <div className="flex items-center gap-2 bg-[#120f20] px-2.5 py-1 border border-[#3b335c]">
              <span className="text-[10px] font-silkscreen text-[#9f97ba]">Bounty:</span>
              <span className="font-pixel text-[10px] text-[#ffd700] flex items-center gap-0.5">
                <Coins size={11} /> {currentBoss.rewardGold} G
              </span>
              <span className="font-pixel text-[10px] text-[#00f0ff] flex items-center gap-0.5">
                <Zap size={11} /> {currentBoss.rewardXp} XP
              </span>
            </div>
          </div>

          <p className="text-xs text-[#a39bbd] mb-2 leading-snug">{currentBoss.description}</p>

          {/* Boss HP Bar */}
          <PixelProgress
            value={currentBoss.currentHp}
            max={currentBoss.maxHp}
            label="HP MONSTER DISTRAKSI"
            variant="hp"
            size="md"
          />

          <div className="flex items-center justify-between text-[10px] font-silkscreen text-[#7e759b] mt-1.5">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-[#00f0ff]" />
              1 menit fokus = 1 DMG serangan fisik
            </span>
            <span>
              {currentBoss.currentHp === 0 ? 'DITAKLUKKAN! 🏆' : `${currentBoss.currentHp} HP tersisa`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

