import React, { useState } from 'react';
import { Settings2, Clock, Zap } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';

export const PresetSelector: React.FC = () => {
  const { presets, activePresetId, selectPreset, updateCustomPreset } = useTimerStore();
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const customPreset = presets.find((p) => p.id === 'custom') || {
    focusMinutes: 30,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    roundsBeforeLongBreak: 4,
  };

  const [customForm, setCustomForm] = useState({
    focusMinutes: customPreset.focusMinutes,
    shortBreakMinutes: customPreset.shortBreakMinutes,
    longBreakMinutes: customPreset.longBreakMinutes,
    roundsBeforeLongBreak: customPreset.roundsBeforeLongBreak,
  });

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomPreset(customForm);
    selectPreset('custom');
    setIsCustomOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-silkscreen text-xs uppercase text-[#9f97ba] flex items-center gap-1.5">
          <Clock size={13} className="text-[#00f0ff]" />
          Pilih Metode Ritme Fokus:
        </span>
        {activePresetId === 'custom' && (
          <button
            onClick={() => setIsCustomOpen(true)}
            className="text-xs font-silkscreen text-[#ffd700] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Settings2 size={12} /> Edit Custom
          </button>
        )}
      </div>

      {/* Preset selection grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isSelected = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.id === 'custom' && isSelected) {
                  setIsCustomOpen(true);
                } else {
                  selectPreset(preset.id);
                }
              }}
              className={`p-2.5 text-left border-2 transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-[#251a3d] border-[#00f0ff] shadow-[3px_3px_0px_#000]'
                  : 'bg-[#151224] border-[#2f274a] hover:border-[#4d4076]'
              }`}
            >
              {preset.xpMultiplier > 1.0 && (
                <span className="absolute -top-1.5 -right-1 px-1 bg-[#ff0055] text-white text-[9px] font-pixel border border-black flex items-center">
                  <Zap size={9} />+{Math.round((preset.xpMultiplier - 1) * 100)}%
                </span>
              )}
              <div className="font-silkscreen text-xs font-bold text-[#f0edf6] truncate">
                {preset.name.split(' ')[0]}
              </div>
              <div className="text-[11px] text-[#00f0ff] font-pixel mt-1">
                {preset.focusMinutes}m / {preset.shortBreakMinutes}m
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Preset Editor Modal */}
      <PixelModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        title="⚙️ Kustomisasi Metode Pomodoro"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveCustom} className="space-y-4">
          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Waktu Fokus (Menit):
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={customForm.focusMinutes}
              onChange={(e) =>
                setCustomForm({ ...customForm, focusMinutes: parseInt(e.target.value) || 1 })
              }
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-pixel focus:border-[#00f0ff] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Istirahat Pendek (Menit):
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={customForm.shortBreakMinutes}
              onChange={(e) =>
                setCustomForm({ ...customForm, shortBreakMinutes: parseInt(e.target.value) || 1 })
              }
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-pixel focus:border-[#00f0ff] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Istirahat Panjang (Menit):
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={customForm.longBreakMinutes}
              onChange={(e) =>
                setCustomForm({ ...customForm, longBreakMinutes: parseInt(e.target.value) || 1 })
              }
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-pixel focus:border-[#00f0ff] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Jumlah Ronde Sebelum Istirahat Panjang:
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={customForm.roundsBeforeLongBreak}
              onChange={(e) =>
                setCustomForm({
                  ...customForm,
                  roundsBeforeLongBreak: parseInt(e.target.value) || 1,
                })
              }
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-pixel focus:border-[#00f0ff] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <PixelButton
              type="button"
              variant="retro-dark"
              size="sm"
              onClick={() => setIsCustomOpen(false)}
            >
              Batal
            </PixelButton>
            <PixelButton type="submit" variant="primary" size="sm">
              Simpan & Gunakan
            </PixelButton>
          </div>
        </form>
      </PixelModal>
    </div>
  );
};
