import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Identity, Goal } from '../types/goal';
import { DEFAULT_IDENTITIES, DEFAULT_GOALS } from '../utils/defaults';
import { getTodayDateString } from '../utils/formatters';
import { soundFx } from '../audio/synthAudio';

interface GoalState {
  identities: Identity[];
  goals: Goal[];
  activeIdentityId: string;
  activeGoalId: string | null;

  setActiveIdentityId: (id: string) => void;
  setActiveGoalId: (id: string | null) => void;
  getActiveGoal: () => Goal | undefined;
  addIdentity: (identity: Omit<Identity, 'id' | 'createdAt'>) => void;
  updateIdentity: (id: string, updates: Partial<Identity>) => void;
  deleteIdentity: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentMinutes' | 'currentSessions' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalComplete: (id: string) => void;

  // Called when a focus session finishes
  recordSessionProgress: (identityId: string, durationMinutes: number, specificGoalId?: string) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      identities: DEFAULT_IDENTITIES,
      goals: DEFAULT_GOALS,
      activeIdentityId: DEFAULT_IDENTITIES[0]?.id || '',
      activeGoalId: DEFAULT_GOALS[0]?.id || null,

      setActiveIdentityId: (id) => {
        soundFx.playClick();
        set({ activeIdentityId: id });
      },

      setActiveGoalId: (id) => {
        soundFx.playClick();
        if (id) {
          const targetGoal = get().goals.find((g) => g.id === id);
          if (targetGoal) {
            set({ activeGoalId: id, activeIdentityId: targetGoal.identityId });
            return;
          }
        }
        set({ activeGoalId: id });
      },

      getActiveGoal: () => {
        const { activeGoalId, goals } = get();
        if (!activeGoalId) return undefined;
        return goals.find((g) => g.id === activeGoalId);
      },

      addIdentity: (newId) => {
        soundFx.playCoin();
        const id = 'id-' + Date.now();
        const created: Identity = {
          ...newId,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          identities: [...state.identities, created],
          activeIdentityId: state.activeIdentityId || id,
        }));
      },

      updateIdentity: (id, updates) => {
        soundFx.playClick();
        set((state) => ({
          identities: state.identities.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        }));
      },

      deleteIdentity: (id) => {
        soundFx.playClick();
        set((state) => {
          const filtered = state.identities.filter((item) => item.id !== id);
          return {
            identities: filtered,
            activeIdentityId: state.activeIdentityId === id ? (filtered[0]?.id || '') : state.activeIdentityId,
            goals: state.goals.filter((g) => g.identityId !== id),
          };
        });
      },

      addGoal: (goalData) => {
        soundFx.playCoin();
        const newGoal: Goal = {
          ...goalData,
          id: 'goal-' + Date.now(),
          currentMinutes: 0,
          currentSessions: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, updates) => {
        soundFx.playClick();
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGoal: (id) => {
        soundFx.playClick();
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          activeGoalId: state.activeGoalId === id ? null : state.activeGoalId,
        }));
      },

      toggleGoalComplete: (id) => {
        soundFx.playCoin();
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === id) {
              const nextVal = !g.completed;
              return { ...g, completed: nextVal };
            }
            return g;
          }),
        }));
      },

      recordSessionProgress: (identityId, durationMinutes, specificGoalId) => {
        const todayStr = getTodayDateString();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        set((state) => ({
          goals: state.goals.map((goal) => {
            let isRelevant = false;

            // If a specific active goal was targeted, advance it directly!
            if (specificGoalId && goal.id === specificGoalId) {
              isRelevant = true;
            } else if (goal.identityId === identityId) {
              if (goal.period === 'daily' && (!goal.date || goal.date === todayStr)) {
                isRelevant = true;
              } else if (goal.period === 'monthly' && (!goal.month || goal.month === currentMonth)) {
                isRelevant = true;
              } else if (goal.period === 'annually' && (!goal.year || goal.year === currentYear)) {
                isRelevant = true;
              }
            }

            if (!isRelevant) return goal;

            const nextMinutes = goal.currentMinutes + durationMinutes;
            const nextSessions = goal.currentSessions + 1;
            const completed = nextMinutes >= goal.targetMinutes || nextSessions >= goal.targetSessions;

            return {
              ...goal,
              currentMinutes: nextMinutes,
              currentSessions: nextSessions,
              completed: completed || goal.completed,
            };
          }),
        }));
      },
    }),
    {
      name: 'pixel-pomodoro-goals',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.activeGoalId && state.goals.length > 0) {
          const firstDaily = state.goals.find((g) => g.period === 'daily' && !g.completed);
          state.activeGoalId = firstDaily?.id || state.goals[0]?.id || null;
        }
      },
    }
  )
);
