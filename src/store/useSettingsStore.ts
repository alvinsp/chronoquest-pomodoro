import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundFx } from '../audio/synthAudio';
import { ambientEngine, type AmbientSoundType } from '../audio/ambientNoise';

interface SettingsState {
  theme: string;
  crtScanlines: boolean;
  soundVolume: number;
  isMuted: boolean;
  ambientType: AmbientSoundType;
  ambientVolume: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationsEnabled: boolean;

  setTheme: (theme: string) => void;
  toggleCrtScanlines: () => void;
  setSoundVolume: (vol: number) => void;
  toggleMute: () => void;
  setAmbientType: (type: AmbientSoundType) => void;
  setAmbientVolume: (vol: number) => void;
  toggleAutoStartBreaks: () => void;
  toggleAutoStartPomodoros: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'default',
      crtScanlines: true,
      soundVolume: 0.5,
      isMuted: false,
      ambientType: 'none',
      ambientVolume: 0.25,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notificationsEnabled: false,

      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      toggleCrtScanlines: () => {
        soundFx.playClick();
        set((state) => ({ crtScanlines: !state.crtScanlines }));
      },

      setSoundVolume: (vol) => {
        soundFx.setVolume(vol);
        set({ soundVolume: vol });
      },

      toggleMute: () => {
        const nextMuted = !get().isMuted;
        soundFx.setMute(nextMuted);
        set({ isMuted: nextMuted });
      },

      setAmbientType: (type) => {
        ambientEngine.play(type);
        set({ ambientType: type });
      },

      setAmbientVolume: (vol) => {
        ambientEngine.setVolume(vol);
        set({ ambientVolume: vol });
      },

      toggleAutoStartBreaks: () => {
        soundFx.playClick();
        set((s) => ({ autoStartBreaks: !s.autoStartBreaks }));
      },

      toggleAutoStartPomodoros: () => {
        soundFx.playClick();
        set((s) => ({ autoStartPomodoros: !s.autoStartPomodoros }));
      },

      requestNotificationPermission: async () => {
        if (!('Notification' in window)) return false;
        const res = await Notification.requestPermission();
        const granted = res === 'granted';
        set({ notificationsEnabled: granted });
        return granted;
      },
    }),
    {
      name: 'pixel-pomodoro-settings',
    }
  )
);
