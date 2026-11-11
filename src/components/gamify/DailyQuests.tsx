import React from 'react';
import { CheckCircle2, Gift, Sparkles, Coins } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { PixelProgress } from '../ui/PixelProgress';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({ isOpen, onClose }) => {
  const { quests, claimQuest } = useGamifyStore();

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="📜 Guild Quest Board (Harian)">
      <div className="space-y-4">
        <p className="text-xs text-[#a097bd] font-silkscreen mb-3">
          Selesaikan quest produktivitas harian untuk mendapatkan bonus XP dan Gold untuk leveling heromu!
        </p>

        {quests.map((quest) => {
          const isDone = quest.completed || quest.current >= quest.target;
          return (
            <div
              key={quest.id}
              className={`p-3.5 border-2 transition-all ${
                quest.claimed
                  ? 'bg-[#120f20]/60 border-[#272140] opacity-60'
                  : isDone
                  ? 'bg-[#1f1738] border-[#ffd700] shadow-[2px_2px_0px_#000]'
                  : 'bg-[#151224] border-[#362f54]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-silkscreen text-sm font-bold text-[#f0edf6] flex items-center gap-1.5">
                    {quest.claimed ? (
                      <CheckCircle2 size={16} className="text-[#00ff66]" />
                    ) : (
                      <Sparkles size={16} className="text-[#ffd700]" />
                    )}
                    {quest.title}
                  </h4>
                  <p className="text-xs text-[#9f97ba] mt-0.5">{quest.description}</p>
                </div>

                {/* Rewards display */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-pixel px-2 py-0.5 bg-[#8a2be2]/30 text-[#e0aaff] border border-[#8a2be2]">
                    +{quest.rewardXp} XP
                  </span>
                  <span className="text-[11px] font-pixel px-2 py-0.5 bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700] flex items-center gap-1">
                    <Coins size={11} /> {quest.rewardGold}
                  </span>
                </div>
              </div>

              {/* Progress and Claim Button */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <PixelProgress
                    value={quest.current}
                    max={quest.target}
                    size="sm"
                    variant={isDone ? 'success' : 'xp'}
                    showPercent
                  />
                </div>

                {quest.claimed ? (
                  <span className="font-pixel text-[10px] text-[#00ff66] uppercase px-3 py-1 bg-[#052e16] border border-[#00ff66]">
                    Diklaim ✓
                  </span>
                ) : (
                  <PixelButton
                    variant={isDone ? 'accent' : 'retro-dark'}
                    size="sm"
                    disabled={!isDone}
                    onClick={() => claimQuest(quest.id)}
                    className="shrink-0"
                  >
                    <Gift size={13} />
                    <span>Klaim Reward</span>
                  </PixelButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PixelModal>
  );
};

