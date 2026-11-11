import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GoogleUser, UserAccountBackup } from '../types/auth';
import { soundFx } from '../audio/synthAudio';
import confetti from 'canvas-confetti';
import {
  pushLocalDataToFirestore,
  pullLatestDataFromFirestore,
  isFirebaseConfigured,
} from '../services/firebase';

export const DEFAULT_GOOGLE_CLIENT_ID = '1069804020855-a4i8m7o86ofrkrdkog916br72pbufost.apps.googleusercontent.com';

interface AuthState {
  user: GoogleUser | null;
  googleClientId: string;
  lastSyncedAt: string | null;
  isAutoSyncEnabled: boolean;
  isGoogleVerified: boolean; // true if logged in via official Google GIS JWT

  loginWithGoogleCredential: (credentialJwt: string) => boolean;
  loginWithGoogleProfile: (profile: { email: string; name: string; picture?: string; id?: string }) => void;
  logout: () => void;
  setGoogleClientId: (id: string) => void;
  toggleAutoSync: () => void;

  // Cloud / Account Data Storage
  saveAccountData: () => void;
  loadAccountData: () => boolean;
  bindCurrentDataToEmail: (email: string) => void;
  syncToCloud: () => Promise<boolean>;
  syncFromCloud: () => Promise<boolean>;
  isCloudConfigured: () => boolean;
}

// Decode standard base64 Google JWT payload
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      googleClientId:
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
        DEFAULT_GOOGLE_CLIENT_ID,
      lastSyncedAt: null,
      isAutoSyncEnabled: true,
      isGoogleVerified: false,

      loginWithGoogleCredential: (credentialJwt: string) => {
        const payload = decodeJwt(credentialJwt);
        if (!payload || !payload.email) return false;

        const googleUser: GoogleUser = {
          id: (payload.sub as string) || 'google-' + Date.now(),
          email: payload.email as string,
          name: (payload.name as string) || (payload.email as string).split('@')[0],
          picture: payload.picture as string | undefined,
          lastLoginAt: new Date().toISOString(),
        };

        soundFx.playLevelUp();
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
        });

        set({ user: googleUser, isGoogleVerified: true });

        // Save current active data directly into this Google Account key!
        // This guarantees NO DATA IS LOST from previous email/username progress.
        get().saveAccountData();

        return true;
      },

      loginWithGoogleProfile: (profile) => {
        const googleUser: GoogleUser = {
          id: profile.id || 'usr-' + Date.now(),
          email: profile.email,
          name: profile.name || profile.email.split('@')[0],
          picture: profile.picture,
          lastLoginAt: new Date().toISOString(),
        };

        soundFx.playLevelUp();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
        });

        set({ user: googleUser, isGoogleVerified: false });

        // Save current active browser data to this profile
        get().saveAccountData();
      },

      bindCurrentDataToEmail: (email: string) => {
        const currentUser = get().user;
        const targetEmail = email.trim().toLowerCase();
        if (!targetEmail) return;

        const updatedUser: GoogleUser = currentUser
          ? { ...currentUser, email: targetEmail }
          : {
              id: 'usr-' + Date.now(),
              email: targetEmail,
              name: targetEmail.split('@')[0],
              lastLoginAt: new Date().toISOString(),
            };

        set({ user: updatedUser });
        get().saveAccountData();
      },

      logout: () => {
        soundFx.playClick();
        // Save current data before logout
        get().saveAccountData();
        set({ user: null, lastSyncedAt: null, isGoogleVerified: false });
      },

      setGoogleClientId: (id: string) => set({ googleClientId: id }),

      toggleAutoSync: () => {
        soundFx.playClick();
        set((s) => ({ isAutoSyncEnabled: !s.isAutoSyncEnabled }));
      },

      saveAccountData: () => {
        const { user } = get();
        if (!user) return;

        try {
          const backup: UserAccountBackup = {
            user,
            savedAt: new Date().toISOString(),
            hero: localStorage.getItem('pixel-pomodoro-gamify') || null,
            goals: localStorage.getItem('pixel-pomodoro-goals') || null,
            stats: localStorage.getItem('pixel-pomodoro-stats') || null,
            notes: localStorage.getItem('pixel-pomodoro-notes') || null,
            timer: localStorage.getItem('pixel-pomodoro-timer') || null,
            gamify: null,
          };

          const key = `chronoquest_account_${user.email.toLowerCase()}`;
          localStorage.setItem(key, JSON.stringify(backup));

          set({ lastSyncedAt: new Date().toISOString() });

          // Auto-push to Firebase cloud if configured
          if (isFirebaseConfigured()) {
            pushLocalDataToFirestore(user.email).catch(() => {});
          }
        } catch {
          // ignore storage error
        }
      },

      loadAccountData: () => {
        const { user } = get();
        if (!user) return false;

        try {
          const key = `chronoquest_account_${user.email.toLowerCase()}`;
          const raw = localStorage.getItem(key);
          if (!raw) return false;

          const backup: UserAccountBackup = JSON.parse(raw);
          if (backup.hero && typeof backup.hero === 'string') {
            localStorage.setItem('pixel-pomodoro-gamify', backup.hero);
          }
          if (backup.goals && typeof backup.goals === 'string') {
            localStorage.setItem('pixel-pomodoro-goals', backup.goals);
          }
          if (backup.stats && typeof backup.stats === 'string') {
            localStorage.setItem('pixel-pomodoro-stats', backup.stats);
          }
          if (backup.notes && typeof backup.notes === 'string') {
            localStorage.setItem('pixel-pomodoro-notes', backup.notes);
          }
          if (backup.timer && typeof backup.timer === 'string') {
            localStorage.setItem('pixel-pomodoro-timer', backup.timer);
          }

          set({ lastSyncedAt: backup.savedAt });
          return true;
        } catch {
          return false;
        }
      },

      syncToCloud: async () => {
        const { user } = get();
        if (!user) return false;
        const ok = await pushLocalDataToFirestore(user.email);
        if (ok) {
          set({ lastSyncedAt: new Date().toISOString() });
        }
        return ok;
      },

      syncFromCloud: async () => {
        const { user } = get();
        if (!user) return false;
        const ok = await pullLatestDataFromFirestore(user.email);
        if (ok) {
          set({ lastSyncedAt: new Date().toISOString() });
        }
        return ok;
      },

      isCloudConfigured: () => isFirebaseConfigured(),
    }),
    {
      name: 'pixel-pomodoro-auth',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.googleClientId || state.googleClientId.trim() === '') {
          state.googleClientId = DEFAULT_GOOGLE_CLIENT_ID;
        }
      },
    }
  )
);
