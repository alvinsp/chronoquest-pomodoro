import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimerMode, PresetId, TimerStatus, PomodoroPreset } from '../types/timer';
import { DEFAULT_PRESETS } from '../utils/presets';
import { calculateXpGain } from '../utils/levelCalculator';
import { soundFx } from '../audio/synthAudio';
import { useStatsStore } from './useStatsStore';
import { useGoalStore } from './useGoalStore';
import { useGamifyStore } from './useGamifyStore';
import { useSettingsStore } from './useSettingsStore';
import { useAuthStore } from './useAuthStore';

interface TimerState {
  presets: PomodoroPreset[];
  activePresetId: PresetId;
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number;        // in seconds
  totalDuration: number;        // in seconds
  targetEndTime: number | null; // epoch ms when current running session ends
  currentRound: number;
  taskTitle: string;
  activeIdentityId: string;
  lastTickTimestamp: number | null;

  // Actions
  selectPreset: (presetId: PresetId) => void;
  updateCustomPreset: (updates: Partial<PomodoroPreset>) => void;
  setMode: (mode: TimerMode) => void;
  setTaskTitle: (title: string) => void;
  setActiveIdentityId: (id: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  tick: () => void;
  finishCurrentSession: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      presets: DEFAULT_PRESETS,
      activePresetId: 'classic',
      mode: 'focus',
      status: 'idle',
      timeRemaining: 25 * 60,
      totalDuration: 25 * 60,
      targetEndTime: null,
      currentRound: 1,
      taskTitle: 'Koding Arsitektur Sistem Baru',
      activeIdentityId: 'id-dev',
      lastTickTimestamp: null,

      selectPreset: (presetId) => {
        soundFx.playClick();
        const preset = get().presets.find((p) => p.id === presetId) || get().presets[0];
        const mode = get().mode;
        let durationMins = preset.focusMinutes;
        if (mode === 'shortBreak') durationMins = preset.shortBreakMinutes;
        if (mode === 'longBreak') durationMins = preset.longBreakMinutes;

        set({
          activePresetId: presetId,
          status: 'idle',
          timeRemaining: durationMins * 60,
          totalDuration: durationMins * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      updateCustomPreset: (updates) => {
        set((state) => {
          const updatedPresets = state.presets.map((p) => (p.id === 'custom' ? { ...p, ...updates } : p));
          const currentCustom = updatedPresets.find((p) => p.id === 'custom')!;

          let nextDuration = currentCustom.focusMinutes * 60;
          if (state.mode === 'shortBreak') nextDuration = currentCustom.shortBreakMinutes * 60;
          if (state.mode === 'longBreak') nextDuration = currentCustom.longBreakMinutes * 60;

          return {
            presets: updatedPresets,
            timeRemaining: state.activePresetId === 'custom' && state.status === 'idle' ? nextDuration : state.timeRemaining,
            totalDuration: state.activePresetId === 'custom' && state.status === 'idle' ? nextDuration : state.totalDuration,
          };
        });
      },

      setMode: (mode) => {
        soundFx.playClick();
        const preset = get().presets.find((p) => p.id === get().activePresetId) || get().presets[0];
        let durationMins = preset.focusMinutes;
        if (mode === 'shortBreak') durationMins = preset.shortBreakMinutes;
        if (mode === 'longBreak') durationMins = preset.longBreakMinutes;

        set({
          mode,
          status: 'idle',
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
        const remaining = get().timeRemaining;
        set({
          status: 'running',
          targetEndTime: now + remaining * 1000,
          lastTickTimestamp: now,
        });
      },

      pauseTimer: () => {
        soundFx.playPause();
        set({
          status: 'paused',
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      resetTimer: () => {
        soundFx.playClick();
        const preset = get().presets.find((p) => p.id === get().activePresetId) || get().presets[0];
        const mode = get().mode;
        let durationMins = preset.focusMinutes;
        if (mode === 'shortBreak') durationMins = preset.shortBreakMinutes;
        if (mode === 'longBreak') durationMins = preset.longBreakMinutes;

        set({
          status: 'idle',
          timeRemaining: durationMins * 60,
          totalDuration: durationMins * 60,
          targetEndTime: null,
          lastTickTimestamp: null,
        });
      },

      skipSession: () => {
        soundFx.playClick();
        const { mode, currentRound, presets, activePresetId } = get();
        const preset = presets.find((p) => p.id === activePresetId) || presets[0];

        if (mode === 'focus') {
          // Switch to break
          const isLongBreak = currentRound >= preset.roundsBeforeLongBreak;
          const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
          const durationMins = isLongBreak ? preset.longBreakMinutes : preset.shortBreakMinutes;

          set({
            mode: nextMode,
            status: 'idle',
            timeRemaining: durationMins * 60,
            totalDuration: durationMins * 60,
            targetEndTime: null,
            lastTickTimestamp: null,
          });
        } else {
          // Break finished -> Next focus round
          const nextRound = mode === 'longBreak' ? 1 : currentRound + 1;
          set({
            mode: 'focus',
            status: 'idle',
            timeRemaining: preset.focusMinutes * 60,
            totalDuration: preset.focusMinutes * 60,
            currentRound: nextRound,
            targetEndTime: null,
            lastTickTimestamp: null,
          });
        }
      },

      tick: () => {
        const { status, targetEndTime, timeRemaining } = get();
        if (status !== 'running') return;

        const now = Date.now();
        let nextRemaining: number;

        if (targetEndTime) {
          nextRemaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
        } else {
          nextRemaining = Math.max(0, timeRemaining - 1);
        }

        if (nextRemaining <= 0) {
          get().finishCurrentSession();
        } else {
          set({
            timeRemaining: nextRemaining,
            lastTickTimestamp: now,
            targetEndTime: targetEndTime || now + nextRemaining * 1000,
          });
        }
      },

      finishCurrentSession: () => {
        const { mode, activePresetId, presets, currentRound, taskTitle, activeIdentityId, totalDuration } = get();
        const preset = presets.find((p) => p.id === activePresetId) || presets[0];
        const durationMinutes = Math.round(totalDuration / 60);

        if (mode === 'focus') {
          // Focus session completed!
          soundFx.playComplete();

          const { xp, gold } = calculateXpGain(durationMinutes, preset.xpMultiplier);

          const { activeGoalId, goals, identities } = useGoalStore.getState();
          const identity = identities.find((i) => i.id === activeIdentityId);
          
          // Resolve the active goal
          const activeGoal = (activeGoalId ? goals.find((g) => g.id === activeGoalId) : null)
            || goals.find((g) => g.period === 'daily' && g.identityId === activeIdentityId && !g.completed)
            || goals.find((g) => g.identityId === activeIdentityId && !g.completed);

          let resolvedTitle = taskTitle?.trim();
          if (!resolvedTitle || resolvedTitle.toLowerCase().includes('tanpa judul')) {
            if (activeGoal) {
              resolvedTitle = activeGoal.title;
            } else if (identity) {
              resolvedTitle = `Sesi Fokus ${identity.name}`;
            } else {
              resolvedTitle = `Sesi Fokus ${preset.name}`;
            }
          }

          // 1. Record in stats with direct active goal connection
          useStatsStore.getState().recordSession({
            durationMinutes,
            mode: 'focus',
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
          useGoalStore.getState().recordSessionProgress(activeIdentityId, durationMinutes, activeGoal?.id);

          // 3. Add XP & Gold to Gamify hero and attack current Boss
          useGamifyStore.getState().addXpAndGold(xp, gold);
          useGamifyStore.getState().damageActiveBoss(durationMinutes);

          // 4. Update quests
          const todayMins = useStatsStore.getState().getTodayMinutes();
          const todaySessions = useStatsStore.getState().getTodaySessionsCount();
          useGamifyStore.getState().updateQuestsProgress(todaySessions, todayMins, activeIdentityId);

          // 5. Unlock First Blood badge
          useGamifyStore.getState().unlockBadge('badge-first-blood');
          if (activePresetId === 'deep50') {
            useGamifyStore.getState().unlockBadge('badge-deep-diver');
          }

          // 6. Auto-sync to Google Account if logged in
          useAuthStore.getState().saveAccountData();

          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('⚔️ Quest Focus Selesai!', {
              body: `Kerja bagus! +${xp} XP & +${gold} Gold didapatkan. Waktunya istirahat!`,
              icon: '/favicon.svg',
            });
          }

          // Next mode: short break or long break
          const isLong = currentRound >= preset.roundsBeforeLongBreak;
          const nextMode: TimerMode = isLong ? 'longBreak' : 'shortBreak';
          const breakMins = isLong ? preset.longBreakMinutes : preset.shortBreakMinutes;
          const autoStartBreaks = useSettingsStore.getState().autoStartBreaks;
          const now = Date.now();

          set({
            mode: nextMode,
            status: autoStartBreaks ? 'running' : 'idle',
            timeRemaining: breakMins * 60,
            totalDuration: breakMins * 60,
            targetEndTime: autoStartBreaks ? now + breakMins * 60 * 1000 : null,
            lastTickTimestamp: autoStartBreaks ? now : null,
          });

          if (autoStartBreaks) {
            soundFx.playBreakStart();
          }
        } else {
          // Break finished
          soundFx.playBreakStart();

          if (Notification.permission === 'granted') {
            new Notification('🔔 Istirahat Selesai!', {
              body: 'Kembali ke medan fokus untuk melanjutkan petualangan produktivitas!',
              icon: '/favicon.svg',
            });
          }

          const nextRound = mode === 'longBreak' ? 1 : currentRound + 1;
          const autoStartPomodoros = useSettingsStore.getState().autoStartPomodoros;
          const now = Date.now();

          set({
            mode: 'focus',
            status: autoStartPomodoros ? 'running' : 'idle',
            timeRemaining: preset.focusMinutes * 60,
            totalDuration: preset.focusMinutes * 60,
            currentRound: nextRound,
            targetEndTime: autoStartPomodoros ? now + preset.focusMinutes * 60 * 1000 : null,
            lastTickTimestamp: autoStartPomodoros ? now : null,
          });

          if (autoStartPomodoros) {
            soundFx.playStart();
          }
        }
      },
    }),
    {
      name: 'pixel-pomodoro-timer',
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
        // If timer was running when page was closed/reloaded, recalculate elapsed time
        if (state.status === 'running' && state.targetEndTime) {
          const now = Date.now();
          const remaining = Math.round((state.targetEndTime - now) / 1000);
          if (remaining <= 0) {
            state.finishCurrentSession();
          } else {
            state.timeRemaining = remaining;
            state.lastTickTimestamp = now;
          }
        }
      },
    }
  )
);
