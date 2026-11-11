import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { PixelButton } from '../ui/PixelButton';
import type { AmbientSoundType } from '../../audio/ambientNoise';

export const TimerControls: React.FC = () => {
  const { status, startTimer, pauseTimer, resetTimer, skipSession } = useTimerStore();
  const { isMuted, toggleMute, ambientType, setAmbientType } = useSettingsStore();

  const handleAmbientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAmbientType(e.target.value as AmbientSoundType);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md">
        <PixelButton
          variant="retro-dark"
          size="md"
          onClick={resetTimer}
          title="Reset timer ke awal"
        >
          <RotateCcw size={16} />
        </PixelButton>

        {status === 'running' ? (
          <PixelButton
            variant="danger"
            size="lg"
            onClick={pauseTimer}
            className="flex-1 min-w-[160px] py-3 text-base shadow-[4px_4px_0px_#000]"
          >
            <Pause size={20} className="mr-1" />
            <span>JEDA</span>
          </PixelButton>
        ) : (
          <PixelButton
            variant="primary"
            size="lg"
            onClick={startTimer}
            className="flex-1 min-w-[160px] py-3 text-base shadow-[4px_4px_0px_#000]"
          >
            <Play size={20} className="mr-1 fill-white" />
            <span>MULAI FOKUS</span>
          </PixelButton>
        )}

        <PixelButton
          variant="retro-dark"
          size="md"
          onClick={skipSession}
          title="Lewati sesi ini"
        >
          <SkipForward size={16} />
        </PixelButton>
      </div>

      {/* Secondary Audio & Atmosphere Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-silkscreen text-[#9f97ba]">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 transition-all cursor-pointer ${
            isMuted
              ? 'bg-[#151224] border-[#362f54] text-[#ff3b30]'
              : 'bg-[#1e1736] border-[#3b335c] text-[#f0edf6] hover:border-[#00f0ff]'
          }`}
          title={isMuted ? 'Suara 8-bit nonaktif' : 'Suara 8-bit aktif'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#00f0ff]" />}
          <span>{isMuted ? 'Muted' : '8-Bit SFX'}</span>
        </button>

        {/* Ambient Focus Generator selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1736] border-2 border-[#3b335c]">
          <Headphones size={14} className="text-[#ffd700]" />
          <span>Fokus Ambience:</span>
          <select
            value={ambientType}
            onChange={handleAmbientChange}
            className="bg-[#0e0c18] text-[#ffd700] border border-[#3b335c] px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="none">Mati</option>
            <option value="rain">Hujan Pixel Lo-Fi</option>
            <option value="brown">Brown Noise Dalam</option>
            <option value="cosmic">Cosmic Drone 432Hz</option>
          </select>
        </div>
      </div>
    </div>
  );
};
