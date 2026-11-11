import React from 'react';
import { Lock, Check } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelModal } from '../ui/PixelModal';
import { formatDatePretty } from '../../utils/formatters';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { badges } = useGamifyStore();

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🏆 Hall of Trophies & Badges" maxWidth="lg">
      <div className="space-y-4">
        <p className="text-xs text-[#a097bd] font-silkscreen mb-3">
          Torehkan prestasimu dalam sejarah chronomancer. Buka lencana dengan konsistensi dan dedikasi!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badge) => {
            const isUnlocked = Boolean(badge.unlockedAt);
            return (
              <div
                key={badge.id}
                className={`p-3.5 border-2 flex items-start gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-[#1e1736] border-[#00f0ff] shadow-[2px_2px_0px_#000]'
                    : 'bg-[#100e1a]/80 border-[#2b2542] opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center text-2xl border-2 shrink-0 ${
                    isUnlocked
                      ? 'bg-[#291f4a] border-[#ffd700]'
                      : 'bg-[#181528] border-[#3b335c] grayscale'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock size={20} className="text-[#6c648a]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`font-silkscreen text-xs font-bold truncate ${
                        isUnlocked ? 'text-[#00f0ff]' : 'text-[#857b9f]'
                      }`}
                    >
                      {badge.name}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[10px] text-[#00ff66] font-pixel shrink-0 flex items-center gap-0.5">
                        <Check size={11} /> TERBUKA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#b8b0cf] mt-1 leading-snug">{badge.description}</p>
                  {isUnlocked && badge.unlockedAt && (
                    <p className="text-[10px] text-[#7d759a] font-silkscreen mt-1.5">
                      Didapat: {formatDatePretty(badge.unlockedAt.split('T')[0])}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PixelModal>
  );
};
