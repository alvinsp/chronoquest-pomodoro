import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundFx } from "../audio/synthAudio";
import type {
    PomodoroPreset,
    PresetId,
    TimerMode,
    TimerStatus,
} from "../types/timer";
import { calculateXpGain } from "../utils/levelCalculator";
import { DEFAULT_PRESETS } from "../utils/presets";
import { useAuthStore } from "./useAuthStore";
import { useGamifyStore } from "./useGamifyStore";
import { useGoalStore } from "./useGoalStore";
import { useStatsStore } from "./useStatsStore";

export interface CompletedSessionSummary {
  mode: TimerMode;
  durationMinutes: number;
  xp: number;
  gold: number;
  taskTitle: string;
  round: number;
}

interface TimerState {
  presets: PomodoroPreset[];
  activePresetId: PresetId;
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  targetEndTime: number | null; // epoch ms when current running session ends
  currentRound: number;
  taskTitle: string;
  activeIdentityId: string;
  lastTickTimestamp: number | null;
  isFinishingSession: boolean;
  completedSummary: CompletedSessionSummary | null;

  // Actions
  selectPreset: (presetId: PresetId) => void;
  updateCustomPreset: (updates: Partial<PomodoroPreset>) => void;
  setMode: (mode: TimerMode) => void;
  setTaskTitle: (title: string) => void;
  setActiveIdentityId: (id: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  resetRoundCycle: () => void;
  skipSession: () => void;
  tick: () => void;
  finishCurrentSession: () => void;
  clearCompletedModal: () => void;
  startBreakFromModal: () => void;
  startNextFocusFromModal: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      presets: DEFAULT_PRESETS,
      activePresetId: "classic",
      mode: "focus",
      status: "idle",
      timeRemaining: 25 * 60,
      totalDuration: 25 * 60,
      targetEndTime: null,
      currentRound: 1,
      taskTitle: "Koding Arsitektur Sistem Baru",
      activeIdentityId: "id-dev",
      lastTickTimestamp: null,
      isFinishingSession: false,
      completedSummary: null,

      selectPreset: (presetId) => {
        soundFx.playClick();
        const preset =
          get().presets.find((p) => p.id === presetId) || get().presets[0];
        const mode = get().mode;
        const maxRounds = preset.roundsBeforeLongBreak || 4;
        let durationMins = preset.focusMinutes;
        if (mode === "shortBreak") durationMins = preset.shortBreakMinutes;
        if (mode === "longBreak") durationMins = preset.longBreakMinutes;

        set({
          activePresetId: presetId,
          currentRound: Math.min(
            maxRounds,
            Math.max(1, get().currentRound || 1),
          ),
          status: "idle",
          timeRemaining: durationMins * 60,
          totalDuration: durationMins * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      updateCustomPreset: (updates) => {
        set((state) => {
          const updatedPresets = state.presets.map((p) =>
            p.id === "custom" ? { ...p, ...updates } : p,
          );
          const currentCustom = updatedPresets.find((p) => p.id === "custom")!;

          let nextDuration = currentCustom.focusMinutes * 60;
          if (state.mode === "shortBreak")
            nextDuration = currentCustom.shortBreakMinutes * 60;
          if (state.mode === "longBreak")
            nextDuration = currentCustom.longBreakMinutes * 60;

          return {
            presets: updatedPresets,
            timeRemaining:
              state.activePresetId === "custom" && state.status === "idle"
                ? nextDuration
                : state.timeRemaining,
            totalDuration:
              state.activePresetId === "custom" && state.status === "idle"
                ? nextDuration
                : state.totalDuration,
          };
        });
      },

      setMode: (mode) => {
        soundFx.playClick();
        const preset =
          get().presets.find((p) => p.id === get().activePresetId) ||
          get().presets[0];
        const maxRounds = preset.roundsBeforeLongBreak || 4;
        let durationMins = preset.focusMinutes;
        if (mode === "shortBreak") durationMins = preset.shortBreakMinutes;
        if (mode === "longBreak") durationMins = preset.longBreakMinutes;

        const currentRound = get().currentRound || 1;
        const currentMode = get().mode;
        let nextRound = currentRound;
        // If coming from long break or round exceeded, reset to 1
        if (
          mode === "focus" &&
          (currentMode === "longBreak" || currentRound > maxRounds)
        ) {
          nextRound = 1;
        }

        set({
          mode,
          currentRound: Math.min(maxRounds, Math.max(1, nextRound)),
          status: "idle",
          timeRemaining: durationMins * 60,
          totalDuration: durationMins * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      setTaskTitle: (title) => set({ taskTitle: title }),
      setActiveIdentityId: (id) => set({ activeIdentityId: id }),

      startTimer: () => {
        soundFx.playStart();
        const now = Date.now();
        const { presets, activePresetId, mode, totalDuration } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];

        let durationMins = preset.focusMinutes;
        if (mode === "shortBreak") durationMins = preset.shortBreakMinutes;
        if (mode === "longBreak") durationMins = preset.longBreakMinutes;

        let remaining = get().timeRemaining;

        // CRITICAL GUARD: If timer was 0 or negative, ALWAYS reset to full preset duration!
        if (!remaining || remaining <= 0) {
          remaining = durationMins * 60;
        }

        set({
          status: "running",
          timeRemaining: remaining,
          totalDuration: Math.max(totalDuration, durationMins * 60),
          targetEndTime: now + remaining * 1000,
          lastTickTimestamp: now,
          completedSummary: null,
        });
      },

      pauseTimer: () => {
        soundFx.playPause();
        set({
          status: "paused",
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      resetTimer: () => {
        soundFx.playClick();
        const preset =
          get().presets.find((p) => p.id === get().activePresetId) ||
          get().presets[0];
        const mode = get().mode;
        const maxRounds = preset.roundsBeforeLongBreak || 4;
        let durationMins = preset.focusMinutes;
        if (mode === "shortBreak") durationMins = preset.shortBreakMinutes;
        if (mode === "longBreak") durationMins = preset.longBreakMinutes;

        const currentRound = get().currentRound || 1;
        const nextRound =
          mode === "longBreak" || currentRound > maxRounds ? 1 : currentRound;

        set({
          status: "idle",
          currentRound: nextRound,
          timeRemaining: durationMins * 60,
          totalDuration: durationMins * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
          completedSummary: null,
          isFinishingSession: false,
        });
      },

      resetRoundCycle: () => {
        soundFx.playClick();
        const preset =
          get().presets.find((p) => p.id === get().activePresetId) ||
          get().presets[0];
        set({
          currentRound: 1,
          mode: "focus",
          status: "idle",
          timeRemaining: preset.focusMinutes * 60,
          totalDuration: preset.focusMinutes * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
          completedSummary: null,
          isFinishingSession: false,
        });
      },

      skipSession: () => {
        soundFx.playClick();
        const { mode, currentRound, presets, activePresetId } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];
        const maxRounds = preset.roundsBeforeLongBreak || 4;

        if (mode === "focus") {
          // Switch to break
          const isLongBreak = currentRound >= maxRounds;
          const nextMode = isLongBreak ? "longBreak" : "shortBreak";
          const durationMins = isLongBreak
            ? preset.longBreakMinutes
            : preset.shortBreakMinutes;

          set({
            mode: nextMode,
            status: "idle",
            timeRemaining: durationMins * 60,
            totalDuration: durationMins * 60,
            targetEndTime: null,
            lastTickTimestamp: null,
            completedSummary: null,
            isFinishingSession: false,
          });
        } else {
          // Break finished -> Next focus round
          // If previous break was longBreak OR round was 4, start fresh at Round 1!
          const nextRound =
            mode === "longBreak" || currentRound >= maxRounds
              ? 1
              : currentRound + 1;
          set({
            mode: "focus",
            status: "idle",
            timeRemaining: preset.focusMinutes * 60,
            totalDuration: preset.focusMinutes * 60,
            currentRound: nextRound,
            targetEndTime: null,
            lastTickTimestamp: null,
            completedSummary: null,
            isFinishingSession: false,
          });
        }
      },

      tick: () => {
        const { status, targetEndTime, timeRemaining, isFinishingSession } =
          get();
        if (status !== "running" || isFinishingSession) return;

        const now = Date.now();
        let nextRemaining: number;

        if (targetEndTime) {
          nextRemaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
        } else {
          nextRemaining = Math.max(0, timeRemaining - 1);
        }

        if (nextRemaining <= 0) {
          // 1. Visually freeze at 00:00 and lock against loops!
          set({
            timeRemaining: 0,
            status: "idle",
            targetEndTime: null,
            isFinishingSession: true,
          });

          // 2. Trigger completion logic
          get().finishCurrentSession();

          // 3. Release lock after delay
          setTimeout(() => {
            set({ isFinishingSession: false });
          }, 1500);
        } else {
          set({
            timeRemaining: nextRemaining,
            lastTickTimestamp: now,
            targetEndTime: targetEndTime || now + nextRemaining * 1000,
          });
        }
      },

      finishCurrentSession: () => {
        const {
          mode,
          activePresetId,
          presets,
          currentRound,
          taskTitle,
          activeIdentityId,
          totalDuration,
        } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];
        const durationMinutes = Math.max(1, Math.round(totalDuration / 60));

        if (mode === "focus") {
          // Focus session completed!
          soundFx.playComplete();

          const { xp, gold } = calculateXpGain(
            durationMinutes,
            preset.xpMultiplier,
          );

          const { activeGoalId, goals, identities } = useGoalStore.getState();
          const identity = identities.find((i) => i.id === activeIdentityId);

          // Resolve the active goal (ONLY if explicitly selected by the user!)
          const activeGoal = activeGoalId
            ? goals.find((g) => g.id === activeGoalId) || null
            : null;

          let resolvedTitle = taskTitle?.trim();
          if (
            !resolvedTitle ||
            resolvedTitle.toLowerCase().includes("tanpa judul")
          ) {
            if (activeGoal) {
              resolvedTitle = activeGoal.title;
            } else if (identity) {
              resolvedTitle = `Sesi Fokus ${identity.name}`;
            } else {
              resolvedTitle = `Sesi Fokus ${preset.name}`;
            }
          }

          // 1. Record in stats with deduplication shield
          useStatsStore.getState().recordSession({
            durationMinutes,
            mode: "focus",
            presetId: activePresetId,
            identityId: activeIdentityId,
            goalId: activeGoal?.id,
            goalTitle: activeGoal?.title,
            taskTitle: resolvedTitle,
            xpEarned: xp,
            goldEarned: gold,
            completed: true,
          });

          // 2. Record in goals with specific active goal progression
          useGoalStore
            .getState()
            .recordSessionProgress(
              activeIdentityId,
              durationMinutes,
              activeGoal?.id,
            );

          // 3. Add XP & Gold to Gamify hero and attack current Boss
          useGamifyStore.getState().addXpAndGold(xp, gold);
          useGamifyStore.getState().damageActiveBoss(durationMinutes);

          // 4. Update quests
          const todayMins = useStatsStore.getState().getTodayMinutes();
          const todaySessions = useStatsStore
            .getState()
            .getTodaySessionsCount();
          useGamifyStore
            .getState()
            .updateQuestsProgress(todaySessions, todayMins, activeIdentityId);

          // 5. Unlock First Blood badge
          useGamifyStore.getState().unlockBadge("badge-first-blood");
          if (activePresetId === "deep50") {
            useGamifyStore.getState().unlockBadge("badge-deep-diver");
          }

          // 6. Auto-sync to Google Account if logged in
          useAuthStore.getState().saveAccountData();

          // 6.5 Send system browser notification if enabled
          try {
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("⚔️ Quest Fokus Selesai!", {
                body: `Hebat! Sesi fokus "${resolvedTitle}" telah selesai. Waktunya istirahat sejenak!`,
                icon: "/favicon.svg",
              });
            }
          } catch {
            // Notification denied or not supported
          }

          // 7. Pop up celebratory summary modal and keep display at 00:00!
          set({
            timeRemaining: 0,
            status: "idle",
            targetEndTime: null,
            completedSummary: {
              mode: "focus",
              durationMinutes,
              xp,
              gold,
              taskTitle: resolvedTitle,
              round: currentRound,
            },
          });
        } else {
          // Break finished!
          soundFx.playBreakStart();

          try {
            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("☕ Istirahat Selesai!", {
                body: "Waktu istirahat telah usai! Siap untuk sesi fokus berikutnya?",
                icon: "/favicon.svg",
              });
            }
          } catch {
            // Notification denied or not supported
          }

          set({
            timeRemaining: 0,
            status: "idle",
            targetEndTime: null,
            completedSummary: {
              mode: mode,
              durationMinutes,
              xp: 0,
              gold: 0,
              taskTitle: "Istirahat Selesai",
              round: currentRound,
            },
          });
        }
      },

      clearCompletedModal: () => {
        const { mode, presets, activePresetId, currentRound } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];
        const maxRounds = preset.roundsBeforeLongBreak || 4;

        if (mode === "focus") {
          // Prepare next break mode
          const isLong = currentRound >= maxRounds;
          const nextMode: TimerMode = isLong ? "longBreak" : "shortBreak";
          const breakMins = isLong
            ? preset.longBreakMinutes
            : preset.shortBreakMinutes;

          set({
            completedSummary: null,
            mode: nextMode,
            status: "idle",
            timeRemaining: breakMins * 60,
            totalDuration: breakMins * 60,
            targetEndTime: null,
          });
        } else {
          // Prepare next focus mode
          // If previous break was longBreak OR round was at max, cycle back to Round 1!
          const nextRound =
            mode === "longBreak" || currentRound >= maxRounds
              ? 1
              : currentRound + 1;
          set({
            completedSummary: null,
            mode: "focus",
            status: "idle",
            currentRound: nextRound,
            timeRemaining: preset.focusMinutes * 60,
            totalDuration: preset.focusMinutes * 60,
            targetEndTime: null,
          });
        }
      },

      startBreakFromModal: () => {
        soundFx.playBreakStart();
        const now = Date.now();
        const { currentRound, presets, activePresetId } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];
        const maxRounds = preset.roundsBeforeLongBreak || 4;
        const isLong = currentRound >= maxRounds;
        const nextMode: TimerMode = isLong ? "longBreak" : "shortBreak";
        const breakMins = isLong
          ? preset.longBreakMinutes
          : preset.shortBreakMinutes;
        const durationSec = breakMins * 60;

        set({
          completedSummary: null,
          mode: nextMode,
          status: "running",
          timeRemaining: durationSec,
          totalDuration: durationSec,
          targetEndTime: now + durationSec * 1000,
          lastTickTimestamp: now,
        });
      },

      startNextFocusFromModal: () => {
        soundFx.playStart();
        const now = Date.now();
        const { currentRound, presets, activePresetId, mode } = get();
        const preset =
          presets.find((p) => p.id === activePresetId) || presets[0];
        const maxRounds = preset.roundsBeforeLongBreak || 4;

        // CRITICAL FIX: If coming from long break OR if focus round completed was round 4, wrap to 1!
        const nextRound =
          mode === "longBreak" || currentRound >= maxRounds
            ? 1
            : currentRound + 1;
        const durationSec = preset.focusMinutes * 60;

        set({
          completedSummary: null,
          mode: "focus",
          status: "running",
          currentRound: nextRound,
          timeRemaining: durationSec,
          totalDuration: durationSec,
          targetEndTime: now + durationSec * 1000,
          lastTickTimestamp: now,
        });
      },
    }),
    {
      name: "pixel-pomodoro-timer",
      partialize: (state) => ({
        presets: state.presets,
        activePresetId: state.activePresetId,
        mode: state.mode,
        status: state.status,
        timeRemaining: state.timeRemaining,
        totalDuration: state.totalDuration,
        targetEndTime: state.targetEndTime,
        currentRound: state.currentRound,
        taskTitle: state.taskTitle,
        activeIdentityId: state.activeIdentityId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Clamp stored round to valid range [1, 4] so no user remains stuck at 4 or 5
        if (
          !state.currentRound ||
          state.currentRound < 1 ||
          state.currentRound > 4
        ) {
          state.currentRound = 1;
        }

        // If timer was running when page was closed/reloaded, recalculate elapsed time
        if (state.status === "running" && state.targetEndTime) {
          const now = Date.now();
          const remaining = Math.round((state.targetEndTime - now) / 1000);
          if (remaining <= 0) {
            state.status = "idle";
            state.timeRemaining = 0;
            state.targetEndTime = null;
          } else {
            state.timeRemaining = remaining;
            state.lastTickTimestamp = now;
          }
        }
      },
    },
  ),
);
