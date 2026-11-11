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
import { IdentityBreakdown } from './components/stats/IdentityBreakdown';
import { SessionHistory } from './components/stats/SessionHistory';

import { useTimerStore } from './store/useTimerStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useGamifyStore } from './store/useGamifyStore';
import { formatTime } from './utils/formatters';
import { Trophy, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('timer');
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isAddDailyGoalOpen, setIsAddDailyGoalOpen] = useState(false);

  const { status, mode, timeRemaining, tick } = useTimerStore();
  const { theme, crtScanlines } = useSettingsStore();
  const { hero, quests, recentLevelUp, clearLevelUpAlert } = useGamifyStore();

  // Set theme data-attribute on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // High precision timer interval ticker
  useEffect(() => {
    const timerInterval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [tick]);

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

  const unclaimedQuestsCount = quests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col ${crtScanlines ? 'crt-overlay crt-vignette' : ''}`}>
      {/* Top Header */}
      <PixelHeader onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        questBadgeCount={unclaimedQuestsCount}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IdentityBreakdown />
              <SessionHistory />
            </div>
          </div>
        )}

        {/* Tab 4: QUEST BOARD */}
        {activeTab === 'quests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-pixel text-base text-[#ffd700]">GUILD ADVENTURE BOARD</h2>
                <p className="font-silkscreen text-xs text-[#9f97ba] mt-1">
                  Selesaikan misi harian dan kumpulkan lencana kehormatan.
                </p>
              </div>
              <button
                onClick={() => setIsBadgesOpen(true)}
                className="pixel-btn px-3 py-2 bg-[#211c38] text-[#00f0ff] border-2 border-black font-silkscreen text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} /> Lihat Semua Lencana (Badges)
              </button>
            </div>

            {/* Inlined Quests preview */}
            <div className="bg-[#181528] pixel-border border-4 border-black p-5">
              <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] mb-4">
                Daftar Quest Aktif Hari Ini:
              </h3>
              <div className="space-y-3">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 bg-[#130f21] border-2 border-[#2c2447] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-silkscreen text-xs font-bold text-[#f0edf6]">
                        {q.title}
                      </h4>
                      <p className="text-xs text-[#9f97ba] mt-0.5">{q.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[10px] text-[#e0aaff]">+{q.rewardXp} XP</span>
                      <span className="font-pixel text-[10px] text-[#ffd700]">+{q.rewardGold} G</span>
                      <button
                        onClick={() => setIsQuestsOpen(true)}
                        className="pixel-btn px-2.5 py-1 bg-[#ff0055] text-white text-[10px] font-silkscreen border border-black"
                      >
                        Buka Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: PIXEL ARMORY */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-pixel text-base text-[#ff0055]">CHRONO ARMORY & SHOP</h2>
                <p className="font-silkscreen text-xs text-[#9f97ba] mt-1">
                  Tukarkan koin emas dari hasil fokus untuk membuka sprite avatar dan peliharaan baru.
                </p>
              </div>
              <button
                onClick={() => setIsShopOpen(true)}
                className="pixel-btn px-4 py-2 bg-[#ffd700] text-black border-2 border-black font-silkscreen text-xs font-bold cursor-pointer"
              >
                Kunjungi Toko Lengkap
              </button>
            </div>

            <div className="bg-[#181528] pixel-border border-4 border-black p-6 text-center">
              <p className="text-sm font-silkscreen text-[#f0edf6] mb-4">
                Kamu memiliki <strong className="text-[#ffd700] font-pixel">{hero.gold} GOLD</strong> di kantungmu.
              </p>
              <button
                onClick={() => setIsShopOpen(true)}
                className="pixel-btn px-6 py-3 bg-[#ff0055] text-white font-pixel text-xs border-2 border-black cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                BUKA KATALOG ARMORY SEKARANG
              </button>
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
