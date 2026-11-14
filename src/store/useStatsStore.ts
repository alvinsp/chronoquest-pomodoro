import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayFocusStat, IdentityStat, SessionRecord } from "../types/stats";
import {
  getEffectiveDateString,
  getTodayDateString,
  getYesterdayDateString,
} from "../utils/formatters";

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
  cleanupDuplicateSessions: () => number;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentStreak: 2,
      longestStreak: 5,
      lastActiveDate: getYesterdayDateString(),

      recordSession: (sessionData) => {
        const now = Date.now();
        const todayStr = getTodayDateString(now);

        if (!sessionData.durationMinutes || sessionData.durationMinutes <= 0) {
          return {
            ...sessionData,
            id: 'sess-skipped',
            timestamp: now,
            dateStr: todayStr,
          };
        }

        const existingSessions = get().sessions;
        const lastSession = existingSessions[0];

        // DEDUPLICATION SHIELD:
        // Prevent registering a duplicate session if recorded within 30 seconds with identical attributes
        if (
          lastSession &&
          now - lastSession.timestamp < 30000 &&
          lastSession.mode === sessionData.mode &&
          lastSession.durationMinutes === sessionData.durationMinutes &&
          lastSession.taskTitle === sessionData.taskTitle
        ) {
          return lastSession;
        }

        const newRecord: SessionRecord = {
          ...sessionData,
          id: "sess-" + now + "-" + Math.random().toString(36).slice(2, 6),
          timestamp: now,
          dateStr: todayStr,
        };

        const lastDate = get().lastActiveDate;
        let nextStreak = get().currentStreak;
        let longest = get().longestStreak;

        if (lastDate !== todayStr) {
          const yesterdayStr = getYesterdayDateString(now);

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

      cleanupDuplicateSessions: () => {
        let removedCount = 0;
        set((state) => {
          const cleaned: SessionRecord[] = [];
          for (let i = 0; i < state.sessions.length; i++) {
            const current = state.sessions[i];
            const prev = cleaned[cleaned.length - 1];
            // If current was created within 60 seconds of previous and has identical title, duration, and mode:
            if (
              prev &&
              Math.abs(current.timestamp - prev.timestamp) < 60000 &&
              current.mode === prev.mode &&
              current.durationMinutes === prev.durationMinutes &&
              current.taskTitle === prev.taskTitle
            ) {
              removedCount++;
              continue; // skip duplicate
            }
            cleaned.push(current);
          }
          return { sessions: cleaned };
        });
        return removedCount;
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
          .sessions.filter((s) => {
            const dStr = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
            return dStr === todayStr && s.mode === "focus";
          })
          .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      },

      getTodaySessionsCount: () => {
        const todayStr = getTodayDateString();
        return get().sessions.filter((s) => {
          const dStr = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
          return dStr === todayStr && s.mode === "focus";
        }).length;
      },

      getTotalMinutes: () => {
        return get()
          .sessions.filter((s) => s.mode === "focus")
          .reduce((acc, curr) => acc + curr.durationMinutes, 0);
      },

      getHeatmapData: (daysCount = 60) => {
        const sessions = get().sessions.filter((s) => s.mode === "focus");
        const dayMap: Record<string, { minutes: number; sessions: number }> = {};

        // Prepare past N days ending with today's effective work date
        const now = Date.now();
        for (let i = daysCount - 1; i >= 0; i--) {
          const dStr = getEffectiveDateString(now, i);
          dayMap[dStr] = { minutes: 0, sessions: 0 };
        }

        sessions.forEach((s) => {
          const dStr = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
          if (dayMap[dStr]) {
            dayMap[dStr].minutes += s.durationMinutes;
            dayMap[dStr].sessions += 1;
          }
        });

        const result: DayFocusStat[] = [];
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.cleanupDuplicateSessions();
        // Normalize historical sessions to ensure past midnight sessions are mapped to 7:00 AM day cycle
        state.sessions = state.sessions.map((s) => ({
          ...s,
          dateStr: s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr,
        }));
      },
    },
  ),
);
