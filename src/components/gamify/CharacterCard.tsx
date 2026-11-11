import React from 'react';
import { Coins, Award, ShoppingBag, Scroll, Wand2 } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelAvatar } from './PixelAvatar';
import { PixelPet } from './PixelPet';
import { PixelProgress } from '../ui/PixelProgress';
import { PixelButton } from '../ui/PixelButton';
import { soundFx } from '../../audio/synthAudio';

interface CharacterCardProps {
  onOpenQuests: () => void;
  onOpenBadges: () => void;
  onOpenShop: () => void;
  onOpenAvatarPicker?: () => void;
  isFocused?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  onOpenQuests,
  onOpenBadges,
  onOpenShop,
  onOpenAvatarPicker,
  isFocused = false,
}) => {
  const { hero, quests, badges } = useGamifyStore();

  const completedQuestsCount = quests.filter((q) => q.completed && !q.claimed).length;
  const unlockedBadgesCount = badges.filter((b) => b.unlockedAt).length;

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 relative overflow-hidden">
      {/* Background RPG Accent */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#ff0055]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar & Pet Display with Change Avatar shortcut */}
        <div
          className="flex items-end gap-2 shrink-0 cursor-pointer group"
          onClick={onOpenAvatarPicker}
          title="Klik untuk mengganti avatar & kustomisasi hero!"
        >
          <div className="relative">
            <PixelAvatar avatarId={hero.avatarId} isFocused={isFocused} size="md" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-[#00f0ff] text-black border border-black shadow-[1px_1px_0px_#000] group-hover:scale-110 transition-transform">
              <Wand2 size={11} />
            </div>
          </div>
          <PixelPet petId={hero.petId} isFocused={isFocused} />
        </div>

        {/* Hero Info & Stats */}
        <div className="flex-1 w-full text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-pixel text-xs px-2 py-0.5 bg-[#ff0055] text-white border border-black">
                  LVL {hero.level}
                </span>
                <h2 className="font-pixel text-sm text-[#f0edf6] truncate">{hero.name}</h2>
                {onOpenAvatarPicker && (
                  <button
                    onClick={onOpenAvatarPicker}
                    className="text-[10px] font-silkscreen text-[#00f0ff] hover:underline cursor-pointer flex items-center gap-0.5"
                    title="Ganti Avatar"
                  >
                    [Ganti Avatar]
                  </button>
                )}
              </div>
              <p className="text-xs font-silkscreen text-[#00f0ff] mt-0.5">{hero.title}</p>
            </div>

            {/* Gold Currency Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 bg-[#241a05] border-2 border-[#ffd700] shadow-[2px_2px_0px_#000] cursor-pointer hover:brightness-110 transition-all"
              onClick={() => {
                soundFx.playCoin();
                onOpenShop();
              }}
              title="Gold kamu untuk beli gear pixel di shop"
            >
              <Coins size={15} className="text-[#ffd700]" />
              <span className="font-pixel text-xs text-[#ffd700]">{hero.gold}</span>
            </div>
          </div>

          {/* Vitals Meters */}
          <div className="space-y-1.5 mt-2">
            <PixelProgress
              value={hero.currentXp}
              max={hero.targetXp}
              label="XP EXP"
              variant="xp"
              size="sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <PixelProgress
                value={hero.hp}
                max={hero.maxHp}
                label="HP Vigor"
                variant="hp"
                size="sm"
              />
              <PixelProgress
                value={hero.mana}
                max={hero.maxMana}
                label="Mana Focus"
                variant="mana"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action shortcuts: Quests, Badges, Armory */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t-2 border-[#2b2545]">
        <PixelButton
          variant="retro-dark"
          size="sm"
          onClick={onOpenQuests}
          className="relative justify-center py-2"
        >
          <Scroll size={14} className="text-[#ffd700]" />
          <span>Quest</span>
          {completedQuestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0055] text-white text-[9px] font-pixel rounded-full flex items-center justify-center animate-pulse">
              {completedQuestsCount}
            </span>
          )}
        </PixelButton>

        <PixelButton
          variant="retro-dark"
          size="sm"
          onClick={onOpenBadges}
          className="justify-center py-2"
        >
          <Award size={14} className="text-[#00f0ff]" />
          <span>Badge ({unlockedBadgesCount})</span>
        </PixelButton>

        <PixelButton
          variant="retro-dark"
          size="sm"
          onClick={onOpenShop}
          className="justify-center py-2"
        >
          <ShoppingBag size={14} className="text-[#ff0055]" />
          <span>Armory</span>
        </PixelButton>
      </div>
    </div>
  );
};
