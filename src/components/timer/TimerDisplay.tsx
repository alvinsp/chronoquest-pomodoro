import React from 'react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';
import { formatTime } from '../../utils/formatters';
import { Flame, Coffee, Sparkles } from 'lucide-react';

export const TimerDisplay: React.FC = () => {
  const { mode, status, timeRemaining, totalDuration, currentRound, presets, activePresetId, setMode } = useTimerStore();
  const { identities, activeIdentityId } = useGoalStore();

  const preset = presets.find((p) => p.id === activePresetId) || presets[0];
  const activeIdentity = identities.find((id) => id.id === activeIdentityId) || identities[0];

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  const modeTheme = {
    focus: {
      title: 'FOKUS MENDAWAI',
      icon: <Flame size={18} className="text-[#ff0055] animate-pulse" />,
      color: '#ff0055',
      glow: 'shadow-[0_0_24px_rgba(255,0,85,0.3)]',
    },
    shortBreak: {
      title: 'ISTIRAHAT SEJENAK',
      icon: <Coffee size={18} className="text-[#00f0ff]" />,
      color: '#00f0ff',
      glow: 'shadow-[0_0_24px_rgba(0,240,255,0.25)]',
    },
    longBreak: {
      title: 'ISTIRAHAT PANJANG',
      icon: <Sparkles size={18} className="text-[#ffd700]" />,
      color: '#ffd700',
      glow: 'shadow-[0_0_24px_rgba(255,215,0,0.25)]',
    },
  }[mode];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mode Switcher Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('focus')}
          className={`px-3 py-1.5 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all ${
            mode === 'focus'
              ? 'bg-[#ff0055] text-white border-black shadow-[3px_3px_0px_#000]'
              : 'bg-[#151224] text-[#9f97ba] border-[#2f274a] hover:text-white'
          }`}
        >
          ⚔️ Fokus
        </button>
        <button
          onClick={() => setMode('shortBreak')}
          className={`px-3 py-1.5 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all ${
            mode === 'shortBreak'
              ? 'bg-[#00f0ff] text-black border-black shadow-[3px_3px_0px_#000]'
              : 'bg-[#151224] text-[#9f97ba] border-[#2f274a] hover:text-white'
          }`}
        >
          ☕ Istirahat Pendek
        </button>
        <button
          onClick={() => setMode('longBreak')}
          className={`px-3 py-1.5 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all ${
            mode === 'longBreak'
              ? 'bg-[#ffd700] text-black border-black shadow-[3px_3px_0px_#000]'
              : 'bg-[#151224] text-[#9f97ba] border-[#2f274a] hover:text-white'
          }`}
        >
          🌙 Istirahat Panjang
        </button>
      </div>

      {/* Main Pixel Timer Display Container */}
      <div
        className={`w-full max-w-lg bg-[#0e0c18] pixel-border border-4 border-black p-6 sm:p-8 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${modeTheme.glow}`}
      >
        {/* CRT Scanline grid inside display */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

        {/* Current Round & Status info */}
        <div className="flex items-center justify-between w-full mb-3 z-10">
          <div className="flex items-center gap-1.5">
            {modeTheme.icon}
            <span
              className="font-pixel text-[11px] sm:text-xs tracking-wider"
              style={{ color: modeTheme.color }}
            >
              {modeTheme.title}
            </span>
          </div>

          {/* Round Indicator */}
          <div className="flex items-center gap-1.5 bg-[#181528] px-2.5 py-1 border border-[#3b335c]">
            <span className="font-silkscreen text-[11px] text-[#9f97ba]">
              RONDE {currentRound}/{preset.roundsBeforeLongBreak}
            </span>
            <div className="flex gap-1 ml-1">
              {Array.from({ length: preset.roundsBeforeLongBreak }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 border border-black ${
                    idx < currentRound ? 'bg-[#ff0055]' : 'bg-[#2a2443]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Big Retro Digital Time Text */}
        <div className="my-4 sm:my-6 z-10">
          <div
            className={`font-pixel text-5xl sm:text-7xl lg:text-8xl tracking-tight select-none ${
              status === 'running' ? 'animate-none' : 'opacity-90'
            }`}
            style={{
              color: modeTheme.color,
              textShadow: `3px 3px 0px #000, 0 0 20px ${modeTheme.color}88`,
            }}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Linked Identity Pill */}
        {activeIdentity && (
          <div className="z-10 flex items-center gap-2 px-3 py-1 bg-[#1a152e] border-2 border-[#3b335c] text-xs font-silkscreen text-[#f0edf6] mb-4">
            <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: activeIdentity.color }} />
            <span>Fokus Untuk Identitas:</span>
            <span className="font-bold text-[#00f0ff]">{activeIdentity.name}</span>
          </div>
        )}

        {/* Horizontal Pixel Progress Bar */}
        <div className="w-full bg-[#1b1730] border-2 border-black h-4 p-[2px] z-10 relative">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: modeTheme.color,
            }}
          />
        </div>
      </div>
    </div>
  );
};
