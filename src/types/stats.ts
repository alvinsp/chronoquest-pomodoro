import type { TimerMode, PresetId } from './timer';

export interface SessionRecord {
  id: string;
  timestamp: number;
  dateStr: string;        // YYYY-MM-DD
  durationMinutes: number;
  mode: TimerMode;
  presetId: PresetId;
  identityId: string;
  taskTitle: string;
  xpEarned: number;
  goldEarned: number;
  completed: boolean;
  notes?: string;
}

export interface DayFocusStat {
  date: string;           // YYYY-MM-DD
  minutes: number;
  sessions: number;
  intensityLevel: 0 | 1 | 2 | 3 | 4; // for github heatmap
}

export interface IdentityStat {
  identityId: string;
  totalMinutes: number;
  totalSessions: number;
  percentage: number;
}
