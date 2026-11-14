import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundFx } from "../audio/synthAudio";
import { useGamifyStore } from "./useGamifyStore";
import type { Goal, Identity, SubTask } from "../types/goal";
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
  resetSingleGoalProgress: (goalId: string) => void;
  addSubTask: (goalId: string, title: string) => void;
  toggleSubTask: (goalId: string, subtaskId: string) => void;
  deleteSubTask: (goalId: string, subtaskId: string) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      identities: DEFAULT_IDENTITIES,
      goals: DEFAULT_GOALS,
      activeIdentityId: DEFAULT_IDENTITIES[0]?.id || "",
      activeGoalId: null,

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
        const todayStr = getTodayDateString();
        const newGoal: Goal = {
          ...goalData,
          id: "goal-" + Date.now(),
          currentMinutes: 0,
          currentSessions: 0,
          completed: false,
          date: goalData.date || (goalData.period === "daily" ? todayStr : undefined),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, updates) => {
        soundFx.playClick();
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== id) return g;
            const updated = { ...g, ...updates };
            // If targetMinutes is increased beyond currentMinutes and completed was not explicitly set, un-complete
            if (
              updates.targetMinutes !== undefined &&
              updates.completed === undefined &&
              updated.period === "daily" &&
              updated.targetMinutes > 0 &&
              updated.currentMinutes < updated.targetMinutes
            ) {
              updated.completed = false;
            }
            return updated;
          }),
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
              return {
                ...g,
                completed: nextVal,
                currentMinutes: nextVal && g.targetMinutes > 0 ? Math.max(g.currentMinutes, g.targetMinutes) : g.currentMinutes,
              };
            }
            return g;
          }),
        }));
      },

      recordSessionProgress: (_identityId, durationMinutes, specificGoalId) => {
        const todayStr = getTodayDateString();

        set((state) => ({
          goals: state.goals.map((goal) => {
            // ONLY track minutes & sessions on DAILY goals!
            // Monthly and annually goals are high-level milestone visions and don't count time.
            if (goal.period !== "daily") return goal;

            // CRITICAL FIX: If specificGoalId is provided, ONLY update THAT specific goal!
            // If NO specificGoalId is provided (e.g. user is studying without selecting a goal),
            // NEVER bleed minutes/sessions into unrelated daily goals!
            if (!specificGoalId || goal.id !== specificGoalId) return goal;

            const nextMinutes = goal.currentMinutes + durationMinutes;
            const nextSessions = goal.currentSessions + 1;
            const targetMins = goal.targetMinutes || 60;

            // Completed ONLY when target minutes is reached (or sessions if no targetMinutes)!
            const completed =
              targetMins > 0
                ? nextMinutes >= targetMins
                : goal.targetSessions
                ? nextSessions >= goal.targetSessions
                : false;

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
            // If goal date is missing, do NOT wipe minutes! Just tag it with todayStr
            if (!goal.date) {
              changed = true;
              return {
                ...goal,
                date: todayStr,
              };
            }
            // If goal date is from an earlier day (yesterday or older), rollover to new day!
            if (goal.date !== todayStr) {
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

      resetSingleGoalProgress: (goalId: string) => {
        soundFx.playClick();
        const todayStr = getTodayDateString();
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === goalId) {
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

      addSubTask: (goalId: string, title: string) => {
        if (!title.trim()) return;
        soundFx.playClick();
        const newSubtask: SubTask = {
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          title: title.trim(),
          completed: false,
          createdAt: Date.now(),
        };
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, subtasks: [...(g.subtasks || []), newSubtask] }
              : g
          ),
        }));
      },

      toggleSubTask: (goalId: string, subtaskId: string) => {
        let isNowCompleted = false;
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const updated = (g.subtasks || []).map((s) => {
              if (s.id === subtaskId) {
                isNowCompleted = !s.completed;
                return { ...s, completed: isNowCompleted };
              }
              return s;
            });
            return { ...g, subtasks: updated };
          }),
        }));

        if (isNowCompleted) {
          soundFx.playCoin();
          useGamifyStore.getState().addXpAndGold(5, 1);
        } else {
          soundFx.playClick();
        }
      },

      deleteSubTask: (goalId: string, subtaskId: string) => {
        soundFx.playClick();
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, subtasks: (g.subtasks || []).filter((s) => s.id !== subtaskId) }
              : g
          ),
        }));
      },
    }),
    {
      name: "pixel-pomodoro-goals",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Auto-refresh daily goals when day changes!
        state.checkAndRolloverDailyGoals();

        // Self-heal: If a daily goal has targetMinutes > 0 and currentMinutes < targetMinutes,
        // but was falsely marked completed by the session-count bug, un-complete it!
        state.goals = state.goals.map((g) => {
          if (g.period === "daily" && g.targetMinutes > 0 && g.currentMinutes < g.targetMinutes && g.completed) {
            return { ...g, completed: false };
          }
          return g;
        });
      },
    },
  ),
);
