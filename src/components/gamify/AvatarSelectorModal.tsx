import React, { useState } from 'react';
import { User, Sparkles, Check } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { PixelAvatar } from './PixelAvatar';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AVATAR_OPTIONS = [
  {
    id: 'avatar-mage',
    name: 'Chrono Mage',
    role: 'Penyihir Manipulasi Waktu',
    desc: 'Menguasai mantra waktu untuk memperlambat jam kerja dan melipatgandakan output fokus.',
  },
  {
    id: 'avatar-hacker',
    name: 'Cyber Netrunner',
    role: 'Peretas Algoritma Digital',
    desc: 'Menembus firewall prokrastinasi dengan kacamata neon dan konsentrasi sibernetik.',
  },
  {
    id: 'avatar-knight',
    name: 'Iron Paladin',
    role: 'Ksatria Disiplin Baja',
    desc: 'Membawa perisai keteguhan hati yang kebal terhadap segala godaan notifikasi media sosial.',
  },
  {
    id: 'avatar-ninja',
    name: 'Shadow Shinobi',
    role: 'Ninja Bayangan Senyap',
    desc: 'Menyelesaikan tugas kompleks dalam keheningan total tanpa meninggalkan jejak distraksi.',
  },
  {
    id: 'avatar-alchemist',
    name: 'Time Alchemist',
    role: 'Ahli Ramuan Produktivitas',
    desc: 'Mentransmutasikan setiap menit usaha menjadi emas pencapaian dan kebijaksanaan tinggi.',
  },
  {
    id: 'avatar-valkyrie',
    name: 'Pixel Valkyrie',
    role: 'Ksatria Fajar Keberanian',
    desc: 'Membimbing pikiran menembus badai kemalasan menuju kemenangan target harian.',
  },
  {
    id: 'avatar-mecha',
    name: 'Android 01',
    role: 'Sintetis Presisi Tinggi',
    desc: 'Beroperasi pada efisiensi 99.9% tanpa kelelahan kognitif selama sesi deep work.',
  },
];

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({ isOpen, onClose }) => {
  const { hero, updateHeroProfile } = useGamifyStore();

  const [selectedAvatarId, setSelectedAvatarId] = useState(hero.avatarId);
  const [heroName, setHeroName] = useState(hero.name);
  const [heroTitle, setHeroTitle] = useState(hero.title);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroProfile({
      avatarId: selectedAvatarId,
      name: heroName.trim() || 'Hero Petualang',
      title: heroTitle.trim() || 'Chronomancer',
    });
    onClose();
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🧙 Kustomisasi Hero & Ganti Avatar" maxWidth="lg">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile preview & text inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#120f20] border-2 border-[#3b335c]">
          <div className="flex flex-col items-center shrink-0">
            <PixelAvatar avatarId={selectedAvatarId} size="lg" />
            <span className="text-[10px] font-pixel text-[#00f0ff] mt-2">PREVIEW HERO</span>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div>
              <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center gap-1.5">
                <User size={13} className="text-[#00f0ff]" />
                Nama Hero / Karakter Pribadi:
              </label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Masukkan nama panggilanmu..."
                className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-1.5 text-sm text-[#f0edf6] font-pixel outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#ffd700]" />
                Gelar / Julukan Hero:
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Contoh: Grandmaster Code, Focused Scholar..."
                className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-1.5 text-sm text-[#ffd700] font-silkscreen outline-none focus:border-[#ffd700]"
              />
            </div>
          </div>
        </div>

        {/* Avatar choices grid */}
        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-2 uppercase">
            Pilih Tampilan Karakter Avatar:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {AVATAR_OPTIONS.map((opt) => {
              const isSelected = selectedAvatarId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedAvatarId(opt.id)}
                  className={`p-3 border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1e1738] border-[#00f0ff] shadow-[2px_2px_0px_#000]'
                      : 'bg-[#151224] border-[#2b2545] hover:border-[#433866]'
                  }`}
                >
                  <div className="shrink-0">
                    <PixelAvatar avatarId={opt.id} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-silkscreen text-xs font-bold text-[#f0edf6] truncate">
                        {opt.name}
                      </h4>
                      {isSelected && <Check size={14} className="text-[#00ff66] shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#00f0ff] font-pixel mt-0.5">{opt.role}</p>
                    <p className="text-[11px] text-[#9f97ba] mt-0.5 leading-snug line-clamp-2">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal footer buttons */}
        <div className="pt-2 flex justify-end gap-2 border-t border-[#2b2545]">
          <PixelButton type="button" variant="retro-dark" size="sm" onClick={onClose}>
            Batal
          </PixelButton>
          <PixelButton type="submit" variant="primary" size="sm">
            Simpan & Gunakan Avatar
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};

