import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayFocusStat, IdentityStat, SessionRecord } from "../types/stats";
import { getTodayDateString } from "../utils/formatters";

interface StatsState {
  sessions: SessionRecord[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;

  recordSession: (
    session: Omit<SessionRecord, "id" | "timestamp" | "dateStr">,
  ) => SessionRecord;
  updateSessionTitle: (id: string, newTitle: string) => void;
  deleteSession: (id: string) => void;
  renameUntitledSessions: (fallbackPrefix?: string) => void;
  getTodayMinutes: () => number;
  getTodaySessionsCount: () => number;
  getTotalMinutes: () => number;
  getHeatmapData: (daysCount?: number) => DayFocusStat[];
  getIdentityStats: (identityIds: string[]) => IdentityStat[];
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentStreak: 2,
      longestStreak: 5,
      lastActiveDate: new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0],

      recordSession: (sessionData) => {
        const todayStr = getTodayDateString();
        const now = Date.now();
        const newRecord: SessionRecord = {
          ...sessionData,
          id: "sess-" + now,
          timestamp: now,
          dateStr: todayStr,
        };

        const lastDate = get().lastActiveDate;
        let nextStreak = get().currentStreak;
        let longest = get().longestStreak;

        if (lastDate !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastDate === yesterdayStr) {
            nextStreak += 1;
          } else if (lastDate === "") {
            nextStreak = 1;
          } else {
            nextStreak = 1; // broken streak
          }

          if (nextStreak > longest) {
            longest = nextStreak;
          }
        }

        set((state) => ({
          sessions: [newRecord, ...state.sessions],
          currentStreak: nextStreak,
          longestStreak: longest,
          lastActiveDate: todayStr,
        }));

        return newRecord;
      },

      updateSessionTitle: (id: string, newTitle: string) => {
        const cleanTitle = newTitle.trim();
        if (!cleanTitle) return;

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, taskTitle: cleanTitle } : s
          ),
        }));
      },

      deleteSession: (id: string) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      renameUntitledSessions: (fallbackPrefix = "Sesi Deep Focus") => {
        set((state) => ({
          sessions: state.sessions.map((s, idx) => {
            if (
              !s.taskTitle ||
              s.taskTitle.toLowerCase().includes("tanpa judul") ||
              s.taskTitle.trim() === ""
            ) {
              const newTitle = s.goalTitle || `${fallbackPrefix} #${state.sessions.length - idx} (${s.durationMinutes}m)`;
              return {
                ...s,
                taskTitle: newTitle,
              };
            }
            return s;
          }),
        }));
      },

      getTodayMinutes: () => {
        const todayStr = getTodayDateString();
        return get()
          .sessions.filter((s) => s.dateStr === todayStr && s.mode === "focus")
          .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      },

      getTodaySessionsCount: () => {
        const todayStr = getTodayDateString();
        return get().sessions.filter(
          (s) => s.dateStr === todayStr && s.mode === "focus",
        ).length;
      },

      getTotalMinutes: () => {
        return get()
          .sessions.filter((s) => s.mode === "focus")
          .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      },

      getHeatmapData: (daysCount = 60) => {
        const sessions = get().sessions.filter((s) => s.mode === "focus");
        const dayMap: Record<string, { minutes: number; sessions: number }> = {};

        // Prepare past N days
        const result: DayFocusStat[] = [];
        for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split("T")[0];
          dayMap[dStr] = { minutes: 0, sessions: 0 };
        }

        sessions.forEach((s) => {
          if (dayMap[s.dateStr]) {
            dayMap[s.dateStr].minutes += s.durationMinutes;
            dayMap[s.dateStr].sessions += 1;
          }
        });

        Object.keys(dayMap)
          .sort()
          .forEach((date) => {
            const min = dayMap[date].minutes;
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (min >= 120) level = 4;
            else if (min >= 75) level = 3;
            else if (min >= 40) level = 2;
            else if (min > 0) level = 1;

            result.push({
              date,
              minutes: min,
              sessions: dayMap[date].sessions,
              intensityLevel: level,
            });
          });

        return result;
      },

      getIdentityStats: (identityIds) => {
        const focusSessions = get().sessions.filter((s) => s.mode === "focus");
        const totalMinutes =
          focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) ||
          1;

        return identityIds.map((id) => {
          const matching = focusSessions.filter((s) => s.identityId === id);
          const mins = matching.reduce(
            (acc, curr) => acc + curr.durationMinutes,
            0,
          );
          return {
            identityId: id,
            totalMinutes: mins,
            totalSessions: matching.length,
            percentage: Math.round((mins / totalMinutes) * 100),
          };
        });
      },

      exportDataJson: () => {
        const dump = {
          sessions: get().sessions,
          currentStreak: get().currentStreak,
          longestStreak: get().longestStreak,
          lastActiveDate: get().lastActiveDate,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(dump, null, 2);
      },

      importDataJson: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed.sessions)) {
            set({
              sessions: parsed.sessions,
              currentStreak: parsed.currentStreak ?? 1,
              longestStreak: parsed.longestStreak ?? 1,
              lastActiveDate: parsed.lastActiveDate ?? getTodayDateString(),
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "pixel-pomodoro-stats",
    },
  ),
);
