import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import type { UserHero, Quest, Badge, ShopItem } from '../types/gamify';
import { DEFAULT_BADGES, DEFAULT_SHOP_ITEMS, DEFAULT_QUESTS } from '../utils/defaults';
import { calculateTargetXp, getTitleForLevel } from '../utils/levelCalculator';
import { soundFx } from '../audio/synthAudio';

interface GamifyState {
  hero: UserHero;
  quests: Quest[];
  badges: Badge[];
  shopItems: ShopItem[];
  recentLevelUp: boolean;

  addXpAndGold: (xpEarned: number, goldEarned: number) => { leveledUp: boolean; newLevel: number };
  claimQuest: (questId: string) => void;
  updateQuestsProgress: (sessionsToday: number, minutesToday: number, identityId: string) => void;
  unlockBadge: (badgeId: string) => void;
  buyShopItem: (itemId: string) => boolean;
  equipShopItem: (itemId: string) => void;
  clearLevelUpAlert: () => void;
  restoreDailyVitals: () => void;
}

export const useGamifyStore = create<GamifyState>()(
  persist(
    (set, get) => ({
      hero: {
        name: 'Cyber Wanderer',
        title: 'Apprentice Chronomancer',
        level: 3,
        currentXp: 45,
        targetXp: calculateTargetXp(3),
        gold: 85,
        hp: 100,
        maxHp: 100,
        mana: 60,
        maxMana: 100,
        avatarId: 'avatar-mage',
        petId: 'pet-slime',
      },
      quests: DEFAULT_QUESTS,
      badges: DEFAULT_BADGES,
      shopItems: DEFAULT_SHOP_ITEMS,
      recentLevelUp: false,

      addXpAndGold: (xpEarned, goldEarned) => {
        let { level, currentXp, targetXp, gold, hp, mana, maxHp, maxMana, name } = get().hero;
        let leveledUp = false;

        currentXp += xpEarned;
        gold += goldEarned;
        // Mana increases with focus discipline
        mana = Math.min(maxMana, mana + 15);

        while (currentXp >= targetXp) {
          currentXp -= targetXp;
          level += 1;
          targetXp = calculateTargetXp(level);
          leveledUp = true;
          maxHp += 10;
          maxMana += 10;
          hp = maxHp;
          mana = maxMana;
        }

        const title = getTitleForLevel(level);

        if (leveledUp) {
          soundFx.playLevelUp();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0055', '#00f0ff', '#ffd700', '#ffffff'],
          });
        }

        set({
          hero: {
            name,
            title,
            level,
            currentXp,
            targetXp,
            gold,
            hp,
            maxHp,
            mana,
            maxMana,
            avatarId: get().hero.avatarId,
            petId: get().hero.petId,
          },
          recentLevelUp: leveledUp,
        });

        // Check level-based badge
        if (level >= 10) {
          get().unlockBadge('badge-flow-master');
        }

        return { leveledUp, newLevel: level };
      },

      claimQuest: (questId) => {
        const quest = get().quests.find((q) => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return;

        soundFx.playCoin();
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });

        set((state) => ({
          quests: state.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
        }));

        get().addXpAndGold(quest.rewardXp, quest.rewardGold);
      },

      updateQuestsProgress: (sessionsToday, minutesToday, identityId) => {
        set((state) => ({
          quests: state.quests.map((q) => {
            if (q.claimed) return q;

            let current = q.current;
            if (q.type === 'sessions_today') {
              current = sessionsToday;
            } else if (q.type === 'minutes_today') {
              current = minutesToday;
            } else if (q.type === 'identity_sessions' && q.requiredIdentityId === identityId) {
              current = current + 1;
            }

            const completed = current >= q.target;
            return {
              ...q,
              current,
              completed: completed || q.completed,
            };
          }),
        }));
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          const badge = state.badges.find((b) => b.id === badgeId);
          if (!badge || badge.unlockedAt) return state;

          soundFx.playCoin();
          return {
            badges: state.badges.map((b) =>
              b.id === badgeId ? { ...b, unlockedAt: new Date().toISOString() } : b
            ),
          };
        });
      },

      buyShopItem: (itemId) => {
        const item = get().shopItems.find((i) => i.id === itemId);
        const hero = get().hero;
        if (!item || item.purchased || hero.gold < item.price) return false;

        soundFx.playCoin();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        set((state) => ({
          hero: {
            ...state.hero,
            gold: state.hero.gold - item.price,
          },
          shopItems: state.shopItems.map((i) => (i.id === itemId ? { ...i, purchased: true } : i)),
        }));

        get().equipShopItem(itemId);
        return true;
      },

      equipShopItem: (itemId) => {
        const item = get().shopItems.find((i) => i.id === itemId);
        if (!item || !item.purchased) return;

        soundFx.playClick();
        set((state) => {
          const updatedItems = state.shopItems.map((i) => {
            if (i.category === item.category) {
              return { ...i, equipped: i.id === itemId };
            }
            return i;
          });

          const heroUpdates: Partial<UserHero> = {};
          if (item.category === 'avatar') heroUpdates.avatarId = itemId;
          if (item.category === 'pet') heroUpdates.petId = itemId;

          if (item.category === 'theme') {
            const themeKey = itemId.replace('theme-', '');
            document.documentElement.setAttribute('data-theme', themeKey);
          }

          return {
            shopItems: updatedItems,
            hero: { ...state.hero, ...heroUpdates },
          };
        });
      },

      clearLevelUpAlert: () => set({ recentLevelUp: false }),

      restoreDailyVitals: () => {
        set((state) => ({
          hero: {
            ...state.hero,
            hp: state.hero.maxHp,
            mana: state.hero.maxMana,
          },
        }));
      },
    }),
    {
      name: 'pixel-pomodoro-gamify',
    }
  )
);
