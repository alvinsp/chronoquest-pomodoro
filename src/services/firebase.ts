import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface CloudUserData {
  email: string;
  name?: string;
  lastUpdated: number;
  updatedByDeviceId: string;
  data: {
    hero: string | null;
    goals: string | null;
    stats: string | null;
    notes: string | null;
    timer: string | null;
  };
}

// Unique random device ID for current session to avoid loop-back updates
export const DEVICE_ID =
  typeof window !== 'undefined'
    ? localStorage.getItem('chronoquest_device_id') ||
      (() => {
        const id = 'dev-' + Math.random().toString(36).slice(2, 9);
        localStorage.setItem('chronoquest_device_id', id);
        return id;
      })()
    : 'dev-server';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Gets the active Firebase configuration from localStorage or .env
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  if (typeof window === 'undefined') return null;

  // 1. Check custom user input saved in localStorage
  try {
    const raw = localStorage.getItem('chronoquest_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed as FirebaseConfig;
      }
    }
  } catch {
    // Ignore parse error
  }

  // 2. Check Vite environment variables
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_FIREBASE_API_KEY &&
    import.meta.env?.VITE_FIREBASE_PROJECT_ID
  ) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
        `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

/**
 * Robustly parses any raw Firebase snippet, including JavaScript variable declaration
 * `const firebaseConfig = { ... };` or raw JSON without breaking on complex values like appId.
 */
export function parseFirebaseConfigText(rawInput: string): FirebaseConfig | null {
  if (!rawInput) return null;
  const text = rawInput.trim();

  // Helper to extract a field by key name regardless of quoting or formatting
  const extract = (key: string): string => {
    // Matches key: "value", "key": 'value', key: 'value', etc.
    const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const apiKey = extract('apiKey');
  const projectId = extract('projectId');

  if (apiKey && projectId) {
    const authDomain = extract('authDomain') || `${projectId}.firebaseapp.com`;
    const storageBucket = extract('storageBucket') || `${projectId}.appspot.com`;
    const messagingSenderId = extract('messagingSenderId');
    const appId = extract('appId');

    return {
      apiKey,
      projectId,
      authDomain,
      storageBucket,
      messagingSenderId,
      appId,
    };
  }

  // Also try standard JSON.parse if user pasted pure JSON
  try {
    const parsed = JSON.parse(text);
    if (parsed.apiKey && parsed.projectId) {
      return {
        apiKey: parsed.apiKey,
        projectId: parsed.projectId,
        authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
        storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || '',
      };
    }
  } catch {
    // Ignore JSON error
  }

  return null;
}

/**
 * Saves custom Firebase configuration to localStorage and re-initializes
 */
export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem('chronoquest_firebase_config', JSON.stringify(config));
    appInstance = null;
    dbInstance = null;
    return Boolean(getFirestoreDb());
  } catch {
    return false;
  }
}

/**
 * Clears custom Firebase config
 */
export function clearFirebaseConfig() {
  try {
    localStorage.removeItem('chronoquest_firebase_config');
    appInstance = null;
    dbInstance = null;
  } catch {}
}

/**
 * Gets or initializes Firestore DB instance
 */
export function getFirestoreDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    const apps = getApps();
    appInstance = apps.length > 0 ? apps[0] : initializeApp(config);
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    return null;
  }
}

/**
 * Checks if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(getFirebaseConfig());
}

/**
 * Sanitizes email for use as a Firestore document ID
 */
export function sanitizeEmailKey(email: string): string {
  return email.trim().toLowerCase().replace(/[#$/[\]]/g, '_');
}

/**
 * Pushes current local storage data to Firebase Firestore
 */
export async function pushLocalDataToFirestore(userEmail: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !userEmail) return false;

  try {
    const cleanKey = sanitizeEmailKey(userEmail);
    const userDocRef = doc(db, 'chronoquest_users', cleanKey);
    const now = Date.now();

    const payload: CloudUserData = {
      email: userEmail.trim().toLowerCase(),
      lastUpdated: now,
      updatedByDeviceId: DEVICE_ID,
      data: {
        hero: localStorage.getItem('pixel-pomodoro-gamify') || null,
        goals: localStorage.getItem('pixel-pomodoro-goals') || null,
        stats: localStorage.getItem('pixel-pomodoro-stats') || null,
        notes: localStorage.getItem('pixel-pomodoro-notes') || null,
        timer: localStorage.getItem('pixel-pomodoro-timer') || null,
      },
    };

    await setDoc(userDocRef, payload, { merge: true });
    localStorage.setItem('chronoquest_last_cloud_sync', new Date(now).toISOString());
    localStorage.setItem('chronoquest_last_cloud_sync_timestamp', String(now));
    return true;
  } catch (err) {
    console.error('Failed to push data to Firestore:', err);
    return false;
  }
}

/**
 * Pulls latest data from Firestore and applies to localStorage
 */
export async function pullLatestDataFromFirestore(userEmail: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db || !userEmail) return false;

  try {
    const cleanKey = sanitizeEmailKey(userEmail);
    const userDocRef = doc(db, 'chronoquest_users', cleanKey);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) return false;

    const cloudData = snapshot.data() as CloudUserData;
    if (!cloudData || !cloudData.data) return false;

    return applyCloudDataToLocalStorage(cloudData);
  } catch (err) {
    console.error('Failed to pull data from Firestore:', err);
    return false;
  }
}

/**
 * Applies cloud data to localStorage
 */
export function applyCloudDataToLocalStorage(cloudData: CloudUserData): boolean {
  try {
    const { data } = cloudData;
    if (data.hero) localStorage.setItem('pixel-pomodoro-gamify', data.hero);
    if (data.goals) localStorage.setItem('pixel-pomodoro-goals', data.goals);
    if (data.stats) localStorage.setItem('pixel-pomodoro-stats', data.stats);
    if (data.notes) localStorage.setItem('pixel-pomodoro-notes', data.notes);
    if (data.timer) localStorage.setItem('pixel-pomodoro-timer', data.timer);

    const updateTs = cloudData.lastUpdated || Date.now();
    localStorage.setItem('chronoquest_last_cloud_sync', new Date(updateTs).toISOString());
    localStorage.setItem('chronoquest_last_cloud_sync_timestamp', String(updateTs));
    return true;
  } catch {
    return false;
  }
}

/**
 * Real-time listener for multi-device sync
 * When changes are made on Laptop, Phone receives them instantly via onSnapshot!
 */
export function subscribeToRealtimeSync(
  userEmail: string,
  onRemoteChange: (updatedData: CloudUserData) => void
): Unsubscribe | null {
  const db = getFirestoreDb();
  if (!db || !userEmail) return null;

  try {
    const cleanKey = sanitizeEmailKey(userEmail);
    const userDocRef = doc(db, 'chronoquest_users', cleanKey);

    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const remoteData = docSnap.data() as CloudUserData;

        // 1. Ignore updates originated by this same device to avoid loop
        if (remoteData.updatedByDeviceId && remoteData.updatedByDeviceId === DEVICE_ID) {
          return;
        }

        // 2. Ignore if remote timestamp is not newer than what we already applied
        const lastAppliedTimestamp = Number(
          localStorage.getItem('chronoquest_last_cloud_sync_timestamp') || 0
        );
        if (remoteData.lastUpdated && remoteData.lastUpdated <= lastAppliedTimestamp) {
          return;
        }

        onRemoteChange(remoteData);
      },
      (err) => {
        console.warn('Realtime sync subscription warning:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to Firestore realtime sync:', err);
    return null;
  }
}

