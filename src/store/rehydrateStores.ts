import { useGamifyStore } from './useGamifyStore';
import { useGoalStore } from './useGoalStore';
import { useStatsStore } from './useStatsStore';
import { useNotesStore } from './useNotesStore';
import { useTimerStore } from './useTimerStore';
import { useAuthStore } from './useAuthStore';

let isRehydrating = false;

/**
 * Rehydrates all Zustand stores in-memory directly from localStorage.
 * This updates the React UI seamlessly without needing a disruptive full page reload.
 */
export async function rehydrateAllStores(): Promise<void> {
  if (isRehydrating) return;
  isRehydrating = true;

  try {
    await Promise.all([
      useGamifyStore.persist?.rehydrate(),
      useGoalStore.persist?.rehydrate(),
      useStatsStore.persist?.rehydrate(),
      useNotesStore.persist?.rehydrate(),
      useTimerStore.persist?.rehydrate(),
      useAuthStore.persist?.rehydrate(),
    ]);
  } catch (err) {
    console.warn('Store rehydration error:', err);
  } finally {
    isRehydrating = false;
  }
}
