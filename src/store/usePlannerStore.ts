import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundFx } from '../audio/synthAudio';
import { useGamifyStore } from './useGamifyStore';
import type { PlannedTask } from '../types/planner';
import { getTodayDateString } from '../utils/formatters';

interface PlannerState {
  tasks: PlannedTask[];
  selectedDate: string; // YYYY-MM-DD
  currentMonth: string; // YYYY-MM

  addTask: (task: Omit<PlannedTask, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<PlannedTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  setSelectedDate: (dateStr: string) => void;
  setCurrentMonth: (monthStr: string) => void;
  getTasksForDate: (dateStr: string) => PlannedTask[];
  getTasksCountForDate: (dateStr: string) => { total: number; completed: number; plannedMinutes: number };
}

const getInitialTasks = (): PlannedTask[] => {
  const today = getTodayDateString();
  return [
    {
      id: 'plan-1',
      date: today,
      title: 'Sesi Fokus Coding Fitur Utama',
      targetMinutes: 50,
      identityId: 'id-dev',
      timeSlot: '09:00',
      priority: 'high',
      completed: false,
      notes: 'Selesaikan modul inti dan unit test.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'plan-2',
      date: today,
      title: 'Review Literatur & Baca Dokumentasi',
      targetMinutes: 30,
      identityId: 'id-polymath',
      timeSlot: '14:30',
      priority: 'medium',
      completed: false,
      notes: 'Pahami arsitektur sistem baru.',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => {
      const today = getTodayDateString();
      const currentYearMonth = today.slice(0, 7);

      return {
        tasks: getInitialTasks(),
        selectedDate: today,
        currentMonth: currentYearMonth,

        addTask: (taskData) => {
          soundFx.playCoin();
          const newTask: PlannedTask = {
            ...taskData,
            id: 'plan-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            completed: false,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));
        },

        updateTask: (id, updates) => {
          soundFx.playClick();
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          }));
        },

        deleteTask: (id) => {
          soundFx.playClick();
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          }));
        },

        toggleTaskComplete: (id) => {
          const target = get().tasks.find((t) => t.id === id);
          if (!target) return;

          const nextStatus = !target.completed;
          if (nextStatus) {
            soundFx.playCoin();
            useGamifyStore.getState().addXpAndGold(15, 3);
          } else {
            soundFx.playClick();
          }

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, completed: nextStatus } : t
            ),
          }));
        },

        setSelectedDate: (dateStr) => {
          soundFx.playClick();
          set({
            selectedDate: dateStr,
            currentMonth: dateStr.slice(0, 7),
          });
        },

        setCurrentMonth: (monthStr) => {
          set({ currentMonth: monthStr });
        },

        getTasksForDate: (dateStr) => {
          return get().tasks.filter((t) => t.date === dateStr);
        },

        getTasksCountForDate: (dateStr) => {
          const tasks = get().tasks.filter((t) => t.date === dateStr);
          const total = tasks.length;
          const completed = tasks.filter((t) => t.completed).length;
          const plannedMinutes = tasks.reduce((acc, t) => acc + (t.targetMinutes || 0), 0);
          return { total, completed, plannedMinutes };
        },
      };
    },
    {
      name: 'pixel-pomodoro-planner',
    }
  )
);
