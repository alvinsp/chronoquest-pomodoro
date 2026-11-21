export type PlanPriority = 'low' | 'medium' | 'high';

export interface PlannedTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  targetMinutes: number;
  identityId: string;
  timeSlot?: string; // e.g. "09:00"
  priority: PlanPriority;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface DayPlanStats {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  tasksCount: number;
  completedCount: number;
}
