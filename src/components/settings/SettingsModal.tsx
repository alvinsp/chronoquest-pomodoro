import React from 'react';
import { Volume2, Monitor, Bell, Palette, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    theme,
    setTheme,
    crtScanlines,
    toggleCrtScanlines,
    soundVolume,
    setSoundVolume,
    isMuted,
    toggleMute,
    autoStartBreaks,
    toggleAutoStartBreaks,
    autoStartPomodoros,
    toggleAutoStartPomodoros,
    notificationsEnabled,
    requestNotificationPermission,
  } = useSettingsStore();

  const themes = [
    { id: 'default', name: 'Cyber Dungeon', color: '#ff0055' },
    { id: 'gameboy', name: 'GameBoy 1989', color: '#8bac0f' },
    { id: 'arcade', name: 'Arcade Neon', color: '#ff2a6d' },
    { id: 'amber', name: 'Amber CRT', color: '#ffb000' },
    { id: 'sakura', name: 'Sakura Dream', color: '#ff7ebb' },
  ];

  const handleResetData = () => {
    if (confirm('PERINGATAN: Apakah kamu yakin ingin mereset semua data progres, level, dan sesi?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="⚙️ Pengaturan Sistem (Options)" maxWidth="md">
      <div className="space-y-5 text-xs font-silkscreen">
        {/* Sound FX Settings */}
        <div className="space-y-2 p-3 bg-[#130f21] border-2 border-[#2b2545]">
          <div className="flex items-center justify-between text-[#f0edf6]">
            <span className="flex items-center gap-1.5 text-sm font-bold text-[#00f0ff]">
              <Volume2 size={16} /> Volume Efek Suara 8-Bit
            </span>
            <button
              onClick={toggleMute}
              className={`px-2 py-0.5 border cursor-pointer ${
                isMuted ? 'bg-[#ff3b30] text-white border-black' : 'bg-[#00f0ff] text-black border-black'
              }`}
            >
              {isMuted ? 'MUTED' : 'ON'}
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={soundVolume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="w-full accent-[#ff0055] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#786f94]">
            <span>Senyap</span>
            <span>{Math.round(soundVolume * 100)}%</span>
            <span>Maksimal</span>
          </div>
        </div>

        {/* Display / CRT Scanlines */}
        <div className="flex items-center justify-between p-3 bg-[#130f21] border-2 border-[#2b2545]">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#f0edf6]">
              <Monitor size={16} className="text-[#ffd700]" />
              Efek Layar CRT Retro (Scanlines)
            </div>
            <p className="text-[11px] text-[#786f94] mt-0.5">
              Menampilkan garis pindai tabung monitor retro 80-an di seluruh layar.
            </p>
          </div>

          <button
            onClick={toggleCrtScanlines}
            className={`px-3 py-1 font-pixel text-xs border cursor-pointer ${
              crtScanlines ? 'bg-[#00ff66] text-black border-black' : 'bg-[#2a2444] text-[#8e85aa] border-black'
            }`}
          >
            {crtScanlines ? 'AKTIF' : 'NONAKTIF'}
          </button>
        </div>

        {/* Automation switches */}
        <div className="space-y-2.5 p-3 bg-[#130f21] border-2 border-[#2b2545]">
          <div className="flex items-center justify-between">
            <span className="text-[#f0edf6]">Otomatis Mulai Istirahat:</span>
            <button
              onClick={toggleAutoStartBreaks}
              className={`px-3 py-1 font-pixel text-xs border cursor-pointer ${
                autoStartBreaks ? 'bg-[#00ff66] text-black border-black' : 'bg-[#2a2444] text-[#8e85aa] border-black'
              }`}
            >
              {autoStartBreaks ? 'YA' : 'TIDAK'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#231d37]">
            <span className="text-[#f0edf6]">Otomatis Mulai Sesi Fokus Berikutnya:</span>
            <button
              onClick={toggleAutoStartPomodoros}
              className={`px-3 py-1 font-pixel text-xs border cursor-pointer ${
                autoStartPomodoros ? 'bg-[#00ff66] text-black border-black' : 'bg-[#2a2444] text-[#8e85aa] border-black'
              }`}
            >
              {autoStartPomodoros ? 'YA' : 'TIDAK'}
            </button>
          </div>
        </div>

        {/* Notification permission */}
        <div className="flex items-center justify-between p-3 bg-[#130f21] border-2 border-[#2b2545]">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#f0edf6]">
              <Bell size={16} className="text-[#ff0055]" />
              Notifikasi Desktop Browser
            </div>
            <p className="text-[11px] text-[#786f94] mt-0.5">
              Kirim alarm notifikasi sistem saat timer fokus / istirahat selesai.
            </p>
          </div>

          <button
            onClick={() => requestNotificationPermission()}
            className={`px-3 py-1 font-pixel text-xs border cursor-pointer ${
              notificationsEnabled ? 'bg-[#00ff66] text-black border-black' : 'bg-[#00f0ff] text-black border-black'
            }`}
          >
            {notificationsEnabled ? 'DIIZINKAN' : 'IZINKAN'}
          </button>
        </div>

        {/* Theme Selector */}
        <div className="space-y-2 p-3 bg-[#130f21] border-2 border-[#2b2545]">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#f0edf6] mb-1">
            <Palette size={16} className="text-[#b388ff]" />
            Ganti Tema Tampilan (Color Palette)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  const themeItemId = t.id === 'default' ? 'theme-cyber' : `theme-${t.id}`;
                  useGamifyStore.setState((s) => ({
                    shopItems: s.shopItems.map((item) =>
                      item.category === 'theme'
                        ? { ...item, equipped: item.id === themeItemId }
                        : item
                    ),
                  }));
                }}
                className={`p-2 border text-left cursor-pointer transition-all flex items-center gap-2 ${
                  theme === t.id
                    ? 'border-[#00f0ff] bg-[#241a3d] text-white font-bold'
                    : 'border-[#2f274a] bg-[#171326] text-[#9f97ba]'
                }`}
              >
                <span className="w-3 h-3 border border-black shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] truncate">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Factory Reset */}
        <div className="pt-2 flex justify-between items-center border-t border-[#2b2545]">
          <button
            onClick={handleResetData}
            className="text-[#ff3b30] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <RotateCcw size={12} /> Reset Ulang Semua Data
          </button>

          <PixelButton variant="primary" size="sm" onClick={onClose}>
            Tutup
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};

