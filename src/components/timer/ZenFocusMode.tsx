import React, { useEffect } from 'react';
import { X, Play, Pause, RotateCcw, SkipForward, Headphones, Flame, Coffee, Sparkles } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelAvatar } from '../gamify/PixelAvatar';
import { PixelPet } from '../gamify/PixelPet';
import { formatTime } from '../../utils/formatters';
import type { AmbientSoundType } from '../../audio/ambientNoise';

interface ZenFocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZenFocusMode: React.FC<ZenFocusModeProps> = ({ isOpen, onClose }) => {
  const { status, mode, timeRemaining, totalDuration, startTimer, pauseTimer, resetTimer, skipSession, taskTitle } = useTimerStore();
  const { hero } = useGamifyStore();
  const { identities, activeIdentityId } = useGoalStore();
  const { ambientType, setAmbientType } = useSettingsStore();

  const activeIdentity = identities.find((i) => i.id === activeIdentityId) || identities[0];
  const percent = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'f') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') pauseTimer();
        else startTimer();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, status, startTimer, pauseTimer]);

  if (!isOpen) return null;

  const modeColor = mode === 'focus' ? '#ff0055' : mode === 'shortBreak' ? '#00f0ff' : '#ffd700';

  return (
    <div className="fixed inset-0 z-50 bg-[#090710] flex flex-col justify-between p-6 sm:p-10 text-white select-none overflow-hidden">
      {/* Background CRT scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

      {/* Top Bar: Identity & Close */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span
            className="w-3.5 h-3.5 border border-black shadow-[1px_1px_0px_#000]"
            style={{ backgroundColor: activeIdentity?.color }}
          />
          <span className="font-silkscreen text-xs sm:text-sm text-[#00f0ff]">
            {activeIdentity?.name} ({activeIdentity?.role})
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 bg-[#181528] text-white border-2 border-black hover:bg-[#ff0055] transition-all cursor-pointer flex items-center gap-2 font-silkscreen text-xs"
        >
          <X size={16} />
          <span className="hidden sm:inline">Keluar Zen Mode (ESC)</span>
        </button>
      </div>

      {/* Center Main Stage */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center space-y-6">
        {/* Animated Avatar & Pet */}
        <div className="flex items-end gap-3 justify-center">
          <PixelAvatar avatarId={hero.avatarId} isFocused={status === 'running'} size="lg" />
          <PixelPet petId={hero.petId} isFocused={status === 'running'} />
        </div>

        {/* Task Objective Badge */}
        <div className="max-w-md px-4 py-1.5 bg-[#171329] border-2 border-[#3b335c] text-xs font-silkscreen text-[#f0edf6] truncate">
          Target: <strong className="text-[#00f0ff]">{taskTitle || 'Deep Work Session'}</strong>
        </div>

        {/* Big Giant Timer */}
        <div
          className="font-pixel text-7xl sm:text-9xl tracking-tight"
          style={{
            color: modeColor,
            textShadow: `4px 4px 0px #000, 0 0 35px ${modeColor}99`,
          }}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Mode Tag */}
        <div className="flex items-center gap-2 font-pixel text-xs uppercase" style={{ color: modeColor }}>
          {mode === 'focus' ? (
            <>
              <Flame size={16} className="animate-pulse" />
              <span>MEDAN TEMPUR FOKUS</span>
            </>
          ) : mode === 'shortBreak' ? (
            <>
              <Coffee size={16} />
              <span>ISTIRAHAT SEJENAK</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>ISTIRAHAT PANJANG</span>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-[#181528] border-2 border-black h-4 p-[2px]">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${percent}%`, backgroundColor: modeColor }}
          />
        </div>

        {/* Motto Quote */}
        {activeIdentity && (
          <p className="max-w-xl text-xs sm:text-sm text-[#9f97ba] italic font-medium px-4">
            "{activeIdentity.motto}"
          </p>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 z-10 pt-4 border-t border-[#231d37]">
        {/* Ambience selector */}
        <div className="flex items-center gap-2 text-xs font-silkscreen text-[#a39bbd]">
          <Headphones size={15} className="text-[#ffd700]" />
          <span>Fokus Ambience:</span>
          <select
            value={ambientType}
            onChange={(e) => setAmbientType(e.target.value as AmbientSoundType)}
            className="bg-[#171329] border border-[#3b335c] text-[#ffd700] px-2 py-1 outline-none cursor-pointer"
          >
            <option value="none">Mati</option>
            <option value="rain">Hujan Pixel Lo-Fi</option>
            <option value="brown">Brown Noise Dalam</option>
            <option value="cosmic">Cosmic Drone 432Hz</option>
          </select>
        </div>

        {/* Mini Player Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetTimer}
            className="p-2.5 bg-[#181528] border-2 border-black text-[#f0edf6] hover:bg-[#251f3d] cursor-pointer"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>

          {status === 'running' ? (
            <button
              onClick={pauseTimer}
              className="px-6 py-2.5 bg-[#ff3b30] border-2 border-black text-white font-pixel text-xs hover:bg-[#ff5147] cursor-pointer flex items-center gap-2"
            >
              <Pause size={18} /> JEDA (SPACE)
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="px-6 py-2.5 bg-[#ff0055] border-2 border-black text-white font-pixel text-xs hover:bg-[#ff1a6b] cursor-pointer flex items-center gap-2"
            >
              <Play size={18} className="fill-white" /> MULAI (SPACE)
            </button>
          )}

          <button
            onClick={skipSession}
            className="p-2.5 bg-[#181528] border-2 border-black text-[#f0edf6] hover:bg-[#251f3d] cursor-pointer"
            title="Lewati Sesi"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
