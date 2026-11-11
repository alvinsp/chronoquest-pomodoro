import React from 'react';
import { Settings, Tv, Sword } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface PixelHeaderProps {
  onOpenSettings: () => void;
}

export const PixelHeader: React.FC<PixelHeaderProps> = ({ onOpenSettings }) => {
  const { crtScanlines, toggleCrtScanlines } = useSettingsStore();

  return (
    <header className="w-full bg-[#141024] border-b-4 border-black px-4 py-3 shadow-[0_4px_0_0_#000]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#ff0055] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-white">
            <Sword size={22} className="rotate-45" />
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-base text-[#f0edf6] tracking-tight flex items-center gap-1.5 m-0">
              <span className="text-[#00f0ff]">CHRONO</span>QUEST
              <span className="text-[10px] text-[#ffd700] px-1.5 py-0.5 bg-[#251f38] border border-black hidden sm:inline-block">
                8-BIT RPG
              </span>
            </h1>
            <p className="font-silkscreen text-[10px] sm:text-[11px] text-[#8e85aa] m-0">
              Gamified Pomodoro & Identity-Driven Goals
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* CRT scanlines toggle */}
          <button
            onClick={toggleCrtScanlines}
            className={`p-2 border-2 cursor-pointer transition-all ${
              crtScanlines
                ? 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_#000]'
                : 'bg-[#1e1736] text-[#8e85aa] border-[#362e54]'
            }`}
            title={crtScanlines ? 'Matikan efek CRT Scanline' : 'Nyalakan efek CRT Scanline'}
          >
            <Tv size={16} />
          </button>

          {/* Settings modal button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-[#211c38] text-[#f0edf6] border-2 border-black hover:bg-[#2c254b] shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
            title="Buka Pengaturan"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
