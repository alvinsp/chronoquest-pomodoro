import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundFx } from "../audio/synthAudio";
import type { Goal, Identity } from "../types/goal";
import { DEFAULT_GOALS, DEFAULT_IDENTITIES } from "../utils/defaults";
import { getTodayDateString } from "../utils/formatters";

interface GoalState {
  identities: Identity[];
  goals: Goal[];
  activeIdentityId: string;
  activeGoalId: string | null;

  setActiveIdentityId: (id: string) => void;
  setActiveGoalId: (id: string | null) => void;
  getActiveGoal: () => Goal | undefined;
  addIdentity: (identity: Omit<Identity, "id" | "createdAt">) => void;
  updateIdentity: (id: string, updates: Partial<Identity>) => void;
  deleteIdentity: (id: string) => void;

  addGoal: (
    goal: Omit<
      Goal,
      "id" | "createdAt" | "currentMinutes" | "currentSessions" | "completed"
    >,
  ) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalComplete: (id: string) => void;

  // Called when a focus session finishes
  recordSessionProgress: (
    identityId: string,
    durationMinutes: number,
    specificGoalId?: string,
  ) => void;

  // Day-change auto refresh & manual refresh
  checkAndRolloverDailyGoals: () => void;
  resetDailyGoalsToToday: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      identities: DEFAULT_IDENTITIES,
      goals: DEFAULT_GOALS,
      activeIdentityId: DEFAULT_IDENTITIES[0]?.id || "",
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
        const id = "id-" + Date.now();
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
          identities: state.identities.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        }));
      },

      deleteIdentity: (id) => {
        soundFx.playClick();
        set((state) => {
          const filtered = state.identities.filter((item) => item.id !== id);
          return {
            identities: filtered,
            activeIdentityId:
              state.activeIdentityId === id
                ? filtered[0]?.id || ""
                : state.activeIdentityId,
            goals: state.goals.filter((g) => g.identityId !== id),
          };
        });
      },

      addGoal: (goalData) => {
        soundFx.playCoin();
        const newGoal: Goal = {
          ...goalData,
          id: "goal-" + Date.now(),
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
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g,
          ),
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

        set((state) => ({
          goals: state.goals.map((goal) => {
            // ONLY track minutes & sessions on DAILY goals!
            // Monthly and annually goals are high-level milestone visions and don't count time.
            if (goal.period !== "daily") return goal;

            let isRelevant = false;
            if (specificGoalId && goal.id === specificGoalId) {
              isRelevant = true;
            } else if (goal.identityId === identityId) {
              if (!goal.date || goal.date === todayStr) {
                isRelevant = true;
              }
            }

            if (!isRelevant) return goal;

            const nextMinutes = goal.currentMinutes + durationMinutes;
            const nextSessions = goal.currentSessions + 1;
            const targetMins = goal.targetMinutes || 60;
            const targetSess = goal.targetSessions || 2;
            const completed =
              nextMinutes >= targetMins || nextSessions >= targetSess;

            return {
              ...goal,
              date: todayStr,
              currentMinutes: nextMinutes,
              currentSessions: nextSessions,
              completed: completed || goal.completed,
            };
          }),
        }));
      },

      checkAndRolloverDailyGoals: () => {
        const todayStr = getTodayDateString();
        const { goals } = get();

        let changed = false;
        const updatedGoals = goals.map((goal) => {
          if (goal.period === "daily") {
            // If goal date is missing or older than today, refresh it for the new day!
            if (!goal.date || goal.date !== todayStr) {
              changed = true;
              return {
                ...goal,
                currentMinutes: 0,
                currentSessions: 0,
                completed: false,
                date: todayStr,
              };
            }
          }
          return goal;
        });

        if (changed) {
          set({ goals: updatedGoals });
        }
      },

      resetDailyGoalsToToday: () => {
        soundFx.playClick();
        const todayStr = getTodayDateString();
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.period === "daily") {
              return {
                ...g,
                currentMinutes: 0,
                currentSessions: 0,
                completed: false,
                date: todayStr,
              };
            }
            return g;
          }),
        }));
      },
    }),
    {
      name: "pixel-pomodoro-goals",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Auto-refresh daily goals when day changes!
        state.checkAndRolloverDailyGoals();

        if (!state.activeGoalId && state.goals.length > 0) {
          const firstDaily = state.goals.find(
            (g) => g.period === "daily" && !g.completed,
          );
          state.activeGoalId = firstDaily?.id || state.goals[0]?.id || null;
        }
      },
    },
  ),
);
