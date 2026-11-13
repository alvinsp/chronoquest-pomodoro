export type GoalPeriod = 'daily' | 'monthly' | 'annually';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Identity {
  id: string;
  name: string;           // e.g. "Software Architect"
  role: string;           // e.g. "Master Systems Engineer"
  motto: string;          // e.g. "I am someone who builds reliable, high-impact software every day."
  color: string;          // Hex / CSS color class
  icon: string;           // Icon identifier
  createdAt: string;
}

export interface Goal {
  id: string;
  identityId: string;
  title: string;
  period: GoalPeriod;
  targetMinutes: number;   // 0 for monthly/annually milestone goals
  currentMinutes: number;
  targetSessions: number;  // 0 for monthly/annually milestone goals
  currentSessions: number;
  year?: number;          // For annually goals, e.g. 2026
  month?: number;         // For monthly goals, e.g. 11
  date?: string;          // For daily goals, YYYY-MM-DD
  completed: boolean;
  notes?: string;
  subtasks?: SubTask[];
  createdAt: string;
}

