import { useEffect, useState } from 'react';
import { PixelHeader } from './components/layout/PixelHeader';
import { NavigationBar, type MainTabType } from './components/layout/NavigationBar';
import { CharacterCard } from './components/gamify/CharacterCard';
import { DailyQuestsModal } from './components/gamify/DailyQuests';
import { AchievementsModal } from './components/gamify/AchievementsModal';
import { PixelShopModal } from './components/gamify/PixelShop';
import { AvatarSelectorModal } from './components/gamify/AvatarSelectorModal';
import { BossBattleCard } from './components/gamify/BossBattleCard';
import { SettingsModal } from './components/settings/SettingsModal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { SessionCompletedModal } from './components/timer/SessionCompletedModal';

import { PresetSelector } from './components/timer/PresetSelector';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { ActiveTaskCard } from './components/timer/ActiveTaskCard';
import { DailyFocusTargetCard } from './components/timer/DailyFocusTargetCard';
import { ZenFocusMode } from './components/timer/ZenFocusMode';

import { FocusNotesCard } from './components/notes/FocusNotesCard';

import { IdentityManager } from './components/goals/IdentityManager';
import { GoalSection } from './components/goals/GoalSection';
import { AddGoalModal } from './components/goals/AddGoalModal';

import { StatsOverview } from './components/stats/StatsOverview';
import { HeatmapGrid } from './components/stats/HeatmapGrid';
import { ProductivityHourChart } from './components/stats/ProductivityHourChart';
import { IdentityBreakdown } from './components/stats/IdentityBreakdown';
import { SessionHistory } from './components/stats/SessionHistory';

import { useTimerStore } from './store/useTimerStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useGamifyStore } from './store/useGamifyStore';
import { useAuthStore } from './store/useAuthStore';
import { useGoalStore } from './store/useGoalStore';
import { formatTime } from './utils/formatters';
import { decodeSyncPayloadString, applySyncPayloadToLocalStorage } from './utils/syncManager';
import { rehydrateAllStores } from './store/rehydrateStores';
import {
  subscribeToRealtimeSync,
  applyCloudDataToLocalStorage,
  isFirebaseConfigured,
} from './services/firebase';
import { Trophy } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('timer');
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isAddDailyGoalOpen, setIsAddDailyGoalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { status, mode, timeRemaining, tick } = useTimerStore();
  const { theme, crtScanlines } = useSettingsStore();
  const { hero, recentLevelUp, clearLevelUpAlert } = useGamifyStore();

  // Set theme data-attribute on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Google OAuth Access Token Listener (Handles direct redirects / popups)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((profile) => {
            if (profile.email) {
              useAuthStore.getState().loginWithGoogleProfile({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                picture: profile.picture,
                id: profile.sub,
              });
              useAuthStore.setState({ isGoogleVerified: true });
              window.history.replaceState(null, '', window.location.pathname);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Cross-device sync listener (Receives payload from QR code or sync URL link)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && hash.includes('sync=')) {
      // 1. Immediately wipe the hash from the browser address bar & history to prevent ANY reload loop
      try {
        window.history.replaceState(null, '', window.location.origin + window.location.pathname);
      } catch {}

      const match = hash.match(/sync=([^&]+)/);
      if (match && match[1]) {
        const rawCode = decodeURIComponent(match[1]);
        decodeSyncPayloadString(rawCode).then(async (payload) => {
          if (payload) {
            const success = applySyncPayloadToLocalStorage(payload);
            if (success) {
              await rehydrateAllStores();
              // Replace history with clean URL without hash so no browser reload can loop back
              window.location.replace(window.location.origin + window.location.pathname);
            }
          }
        });
      }
    }
  }, []);

  // Realtime Firebase Cloud Sync Listener across Laptop & Mobile
  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user?.email || !isFirebaseConfigured()) return;

    const unsubscribe = subscribeToRealtimeSync(user.email, async (remoteData) => {
      const ok = applyCloudDataToLocalStorage(remoteData);
      if (ok) {
        // In-memory smooth rehydration! NO window.location.reload() to eliminate loops!
        await rehydrateAllStores();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // High precision timer interval ticker
  useEffect(() => {
    const timerInterval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [tick]);

  // Mobile Phone Wake-up & Tab Focus Listener:
  // When mobile phone screen unlocks or user returns to tab, immediately sync timer and check day rollover
  useEffect(() => {
    // Check rollover on mount
    useGoalStore.getState().checkAndRolloverDailyGoals();

    const handleWakeUp = () => {
      if (document.visibilityState === 'visible') {
        tick();
        useGoalStore.getState().checkAndRolloverDailyGoals();
      }
    };

    document.addEventListener('visibilitychange', handleWakeUp);
    window.addEventListener('focus', handleWakeUp);
    return () => {
      document.removeEventListener('visibilitychange', handleWakeUp);
      window.removeEventListener('focus', handleWakeUp);
    };
  }, [tick]);

  // Screen Wake Lock API: Keeps mobile screen alive during focus sessions
  useEffect(() => {
    let wakeLockSentinel: { release: () => Promise<void> } | null = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && status === 'running' && document.visibilityState === 'visible') {
        try {
          const nav = navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void> }> } };
          wakeLockSentinel = await nav.wakeLock.request('screen');
        } catch {
          // Wake lock might be denied by system battery saver
        }
      }
    };

    if (status === 'running') {
      requestWakeLock();
    }

    const handleReacquire = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleReacquire);

    return () => {
      document.removeEventListener('visibilitychange', handleReacquire);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [status]);

  // Update document title with remaining time
  useEffect(() => {
    const timeFormatted = formatTime(timeRemaining);
    const modeLabel = mode === 'focus' ? '⚔️ Fokus' : '☕ Istirahat';
    if (status === 'running') {
      document.title = `(${timeFormatted}) ${modeLabel} — ChronoQuest`;
    } else {
      document.title = 'ChronoQuest — 8-Bit Gamified Pomodoro';
    }
  }, [timeRemaining, status, mode]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsZenOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col ${crtScanlines ? 'crt-overlay crt-vignette' : ''}`}>
      {/* Top Header */}
      <PixelHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Level Up Banner Alert */}
        {recentLevelUp && (
          <div className="p-4 bg-[#ffd700] text-black border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <Trophy size={28} className="text-black" />
              <div>
                <h3 className="font-pixel text-sm sm:text-base">LEVEL UP! KAMU MENCAPAI LEVEL {hero.level}!</h3>
                <p className="font-silkscreen text-xs mt-0.5">
                  Gelar barumu: <strong className="underline">{hero.title}</strong>. Vigor HP dan Mana telah dipulihkan!
                </p>
              </div>
            </div>
            <button
              onClick={clearLevelUpAlert}
              className="px-3 py-1 font-pixel text-xs bg-black text-white border-2 border-black hover:bg-neutral-800 cursor-pointer"
            >
              HORE!
            </button>
          </div>
        )}

        {/* Hero Character Status Card */}
        <CharacterCard
          onOpenQuests={() => setIsQuestsOpen(true)}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenAvatarPicker={() => setIsAvatarModalOpen(true)}
          isFocused={status === 'running' && mode === 'focus'}
        />

        {/* Tab 1: FOCUS TIMER */}
        {activeTab === 'timer' && (
          <div className="space-y-6">
            <PresetSelector />

            <TimerDisplay />

            <TimerControls onOpenZenMode={() => setIsZenOpen(true)} />

            <ActiveTaskCard />

            {/* Target Harian langsung di halaman Fokus Timer */}
            <DailyFocusTargetCard onOpenAddGoal={() => setIsAddDailyGoalOpen(true)} />

            {/* RPG Boss Dungeon Battle encounter */}
            <BossBattleCard isFocused={status === 'running' && mode === 'focus'} />

            {/* Catatan Bebas / Focus Scratchpad langsung di halaman Timer */}
            <FocusNotesCard />
          </div>
        )}

        {/* Tab 2: IDENTITIES & GOALS */}
        {activeTab === 'goals' && (
          <div className="space-y-8">
            <IdentityManager />
            <GoalSection />
          </div>
        )}

        {/* Tab 3: STATISTICS & HEATMAP */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <StatsOverview />
            <HeatmapGrid />
            <ProductivityHourChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IdentityBreakdown />
              <SessionHistory />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0d0c15] border-t-2 border-black py-4 px-4 text-center text-xs font-silkscreen text-[#6b6288] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ChronoQuest — Gamified Pomodoro with Identity Alignment</span>
          <span className="font-pixel text-[10px] text-[#00f0ff]">LEVEL UP YOUR LIFE 1 FOCUS SESSION AT A TIME</span>
        </div>
      </footer>

      {/* Modals */}
      <DailyQuestsModal isOpen={isQuestsOpen} onClose={() => setIsQuestsOpen(false)} />
      <AchievementsModal isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} />
      <PixelShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <AvatarSelectorModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GoogleAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SessionCompletedModal />
      <ZenFocusMode isOpen={isZenOpen} onClose={() => setIsZenOpen(false)} />
      <AddGoalModal
        isOpen={isAddDailyGoalOpen}
        onClose={() => setIsAddDailyGoalOpen(false)}
        defaultPeriod="daily"
      />
    </div>
  );
}

export default App;
