export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export type PresetId = 'classic' | 'deep50' | 'flow40' | 'sprint20' | 'ultra90' | 'custom';

export interface PomodoroPreset {
  id: PresetId;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsBeforeLongBreak: number;
  tagline: string;
  xpMultiplier: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';
