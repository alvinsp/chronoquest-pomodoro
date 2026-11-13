import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import type { UserHero, Quest, Badge, ShopItem } from '../types/gamify';
import type { Boss } from '../types/boss';
import { DEFAULT_BADGES, DEFAULT_SHOP_ITEMS, DEFAULT_QUESTS } from '../utils/defaults';
import { DEFAULT_BOSSES } from '../utils/bosses';
import { calculateTargetXp, getTitleForLevel } from '../utils/levelCalculator';
import { soundFx } from '../audio/synthAudio';
import { useSettingsStore } from './useSettingsStore';

export interface BossDefeatLoot {
  bossName: string;
  bossTitle: string;
  gold: number;
  xp: number;
  droppedTitle: string;
  buffDescription: string;
  isOpened: boolean;
}

interface GamifyState {
  hero: UserHero;
  quests: Quest[];
  badges: Badge[];
  shopItems: ShopItem[];
  bosses: Boss[];
  activeBossIndex: number;
  recentLevelUp: boolean;
  recentBossDefeat: BossDefeatLoot | null;

  addXpAndGold: (xpEarned: number, goldEarned: number) => { leveledUp: boolean; newLevel: number };
  takeDamage: (amount: number, reason?: string) => { damageDealt: number; newHp: number };
  claimQuest: (questId: string) => void;
  updateQuestsProgress: (sessionsToday: number, minutesToday: number, identityId: string) => void;
  unlockBadge: (badgeId: string) => void;
  buyShopItem: (itemId: string) => boolean;
  equipShopItem: (itemId: string) => void;
  damageActiveBoss: (damage: number) => { bossDefeated: boolean; bossName: string; lootGold: number; lootXp: number };
  openBossLootChest: () => void;
  updateHeroProfile: (updates: Partial<UserHero>) => void;
  setAvatarId: (avatarId: string) => void;
  clearLevelUpAlert: () => void;
  clearBossAlert: () => void;
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
      bosses: DEFAULT_BOSSES,
      activeBossIndex: 0,
      recentLevelUp: false,
      recentBossDefeat: null,

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

      takeDamage: (amount: number, _reason?: string) => {
        soundFx.playPause();
        const currentHero = get().hero;
        const newHp = Math.max(1, currentHero.hp - amount);
        set((state) => ({
          hero: {
            ...state.hero,
            hp: newHp,
          },
        }));
        return { damageDealt: amount, newHp };
      },

      damageActiveBoss: (damage) => {
        const { bosses, activeBossIndex } = get();
        const currentBoss = bosses[activeBossIndex];
        if (!currentBoss || currentBoss.defeated) {
          return { bossDefeated: false, bossName: '', lootGold: 0, lootXp: 0 };
        }

        const nextHp = Math.max(0, currentBoss.currentHp - damage);
        const defeated = nextHp === 0;

        let lootGold = 0;
        let lootXp = 0;
        let nextIndex = activeBossIndex;

        if (defeated) {
          lootGold = currentBoss.rewardGold;
          lootXp = currentBoss.rewardXp;
          soundFx.playLevelUp();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#ff0055', '#00f0ff'],
          });

          // Next boss index (or cycle back)
          if (activeBossIndex < bosses.length - 1) {
            nextIndex = activeBossIndex + 1;
          }

          const bossRewardMap: Record<string, { title: string; buff: string }> = {
            'boss-procrastinus': {
              title: 'Slayer of Procrastination',
              buff: '+15% Deep Focus Surge',
            },
            'boss-doomscroll': {
              title: 'Phantom Netrunner',
              buff: 'Anti-Distraction Aegis',
            },
            'boss-sloth': {
              title: 'Vigor Ironclad',
              buff: '+20% Vitality Flow',
            },
            'boss-multitask': {
              title: 'Singular Focus Archon',
              buff: '+30% Mythic Flow State',
            },
          };

          const rewardInfo = bossRewardMap[currentBoss.id] || {
            title: `Conqueror of ${currentBoss.name}`,
            buff: '+15% Victory Aura',
          };

          set({
            recentBossDefeat: {
              bossName: currentBoss.name,
              bossTitle: currentBoss.title,
              gold: lootGold,
              xp: lootXp,
              droppedTitle: rewardInfo.title,
              buffDescription: rewardInfo.buff,
              isOpened: false,
            },
          });
        }

        set((state) => ({
          bosses: state.bosses.map((b, idx) =>
            idx === activeBossIndex
              ? { ...b, currentHp: nextHp, defeated }
              : b
          ),
          activeBossIndex: nextIndex,
        }));

        return {
          bossDefeated: defeated,
          bossName: currentBoss.name,
          lootGold,
          lootXp,
        };
      },

      openBossLootChest: () => {
        const { recentBossDefeat } = get();
        if (!recentBossDefeat || recentBossDefeat.isOpened) return;

        soundFx.playLevelUp();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ff0055', '#00f0ff', '#ffffff'],
        });

        get().addXpAndGold(recentBossDefeat.xp, recentBossDefeat.gold);

        set((state) => ({
          hero: {
            ...state.hero,
            title: recentBossDefeat.droppedTitle,
          },
          recentBossDefeat: {
            ...recentBossDefeat,
            isOpened: true,
          },
        }));
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
            const themeKey = itemId === 'theme-cyber' ? 'default' : itemId.replace('theme-', '');
            try {
              useSettingsStore.getState().setTheme(themeKey);
            } catch (err) {
              console.warn('Could not sync theme to settings', err);
            }
            if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', themeKey);
            }
          }

          return {
            shopItems: updatedItems,
            hero: { ...state.hero, ...heroUpdates },
          };
        });
      },

      clearLevelUpAlert: () => set({ recentLevelUp: false }),
      clearBossAlert: () => set({ recentBossDefeat: null }),

      updateHeroProfile: (updates) => {
        soundFx.playCoin();
        set((state) => ({
          hero: { ...state.hero, ...updates },
        }));
      },

      setAvatarId: (avatarId) => {
        soundFx.playCoin();
        set((state) => ({
          hero: { ...state.hero, avatarId },
        }));
      },

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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const equippedTheme = state.shopItems?.find(
          (i) => i.category === 'theme' && i.equipped
        );
        if (equippedTheme) {
          const themeKey =
            equippedTheme.id === 'theme-cyber'
              ? 'default'
              : equippedTheme.id.replace('theme-', '');
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', themeKey);
          }
        }
      },
    }
  )
);
