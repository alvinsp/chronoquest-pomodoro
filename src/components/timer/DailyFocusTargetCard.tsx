import React, { useEffect } from 'react';
import { Target, CheckCircle, Clock, Flame, Plus, Award, Zap, Star, RotateCcw } from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { useStatsStore } from '../../store/useStatsStore';
import { useTimerStore } from '../../store/useTimerStore';
import { PixelProgress } from '../ui/PixelProgress';
import { formatMinutes } from '../../utils/formatters';
import type { Goal } from '../../types/goal';

interface DailyFocusTargetCardProps {
  onOpenAddGoal?: () => void;
}

export const DailyFocusTargetCard: React.FC<DailyFocusTargetCardProps> = ({ onOpenAddGoal }) => {
  const {
    goals,
    identities,
    activeGoalId,
    setActiveGoalId,
    toggleGoalComplete,
    checkAndRolloverDailyGoals,
    resetDailyGoalsToToday,
  } = useGoalStore();
  const { getTodayMinutes, getTodaySessionsCount, currentStreak } = useStatsStore();
  const { setTaskTitle, setActiveIdentityId: setTimerIdentityId } = useTimerStore();

  // Auto-refresh daily goals when day changes
  useEffect(() => {
    checkAndRolloverDailyGoals();
  }, [checkAndRolloverDailyGoals]);

  const todayMinutes = getTodayMinutes();
  const todaySessions = getTodaySessionsCount();

  const dailyGoals = goals.filter((g) => g.period === 'daily');
  const activeGoal = goals.find((g) => g.id === activeGoalId);

  // Overall aggregate daily target
  const aggregateTargetMinutes = dailyGoals.reduce((acc, g) => acc + (g.targetMinutes || 0), 0) || 100;
  const aggregateTargetSessions = dailyGoals.reduce((acc, g) => acc + (g.targetSessions || 0), 0) || 4;

  const overallPercent = Math.min(100, Math.round((todayMinutes / aggregateTargetMinutes) * 100));
  const isGoalReached = todayMinutes >= aggregateTargetMinutes && aggregateTargetMinutes > 0;

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

  const handleSelectActiveGoal = (g: Goal) => {
    setActiveGoalId(g.id);
    setTaskTitle(g.title);
    setTimerIdentityId(g.identityId);
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5 relative overflow-hidden">
      {/* Target Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b-2 border-[#2b2545]">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-[#00f0ff]" />
          <div>
            <h3 className="font-silkscreen text-xs sm:text-sm font-bold text-[#f0edf6] uppercase">
              Target Fokus Harian (Daily Quests)
            </h3>
            <p className="text-[11px] text-[#9f97ba]">
              Progres fokusmu hari ini langsung dihitung ke target identitas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#261520] border border-[#ff0055] text-xs font-silkscreen text-[#ff0055]">
            <Flame size={13} className="animate-pulse" />
            <span>Streak {currentStreak} Hari</span>
          </div>

          <button
            type="button"
            onClick={resetDailyGoalsToToday}
            className="text-xs font-silkscreen px-2 py-1 bg-[#1c1830] text-[#9bb0cf] border border-[#3b325c] hover:border-[#00f0ff] hover:text-[#00f0ff] cursor-pointer flex items-center gap-1 transition-all"
            title="Segarkan target fokus untuk hari baru (reset jam harian ke 0)"
          >
            <RotateCcw size={11} /> Refresh Hari Baru
          </button>

          {onOpenAddGoal && (
            <button
              onClick={onOpenAddGoal}
              className="text-xs font-silkscreen px-2.5 py-1 bg-[#211c38] text-[#ffd700] border border-[#3b335c] hover:border-[#ffd700] cursor-pointer flex items-center gap-1"
              title="Tambah target harian baru"
            >
              <Plus size={12} /> Target Baru
            </button>
          )}
        </div>
      </div>

      {/* Active Goal Highlight Banner */}
      {activeGoal && (
        <div className="mb-3 p-2.5 bg-[#0a1e27] border-2 border-[#00f0ff] flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 bg-[#00f0ff] text-black shrink-0">
              <Star size={13} className="fill-black" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] text-[#00f0ff] font-pixel block leading-tight">
                GOAL AKTIF SAAT INI (LANGSUNG TERSINKRON KE TIMER & LOG):
              </span>
              <p className="font-silkscreen text-xs font-bold text-[#f0edf6] truncate mt-0.5">
                {activeGoal.title}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-pixel px-2 py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] shrink-0 whitespace-nowrap">
            {Math.min(100, Math.round((activeGoal.currentMinutes / activeGoal.targetMinutes) * 100))}% Selesai
          </span>
        </div>
      )}

      {/* Aggregate Overview Bar */}
      <div className="bg-[#120f20] p-3 border-2 border-[#2b2545] mb-3 space-y-2">
        <div className="flex justify-between items-center text-xs font-silkscreen">
          <span className="text-[#f0edf6] font-bold flex items-center gap-1.5">
            <Clock size={13} className="text-[#00f0ff]" />
            Total Fokus Hari Ini: {formatMinutes(todayMinutes)} / {formatMinutes(aggregateTargetMinutes)}
          </span>
          <span className="font-pixel text-[11px] text-[#ffd700]">{overallPercent}% TERCAPAI</span>
        </div>

        <PixelProgress
          value={todayMinutes}
          max={aggregateTargetMinutes}
          size="md"
          variant={isGoalReached ? 'success' : 'xp'}
        />

        <div className="flex justify-between items-center text-[10px] font-silkscreen text-[#7e769d]">
          <span>Sesi: {todaySessions} / {aggregateTargetSessions} sesi diselesaikan</span>
          {isGoalReached && (
            <span className="text-[#00ff66] font-pixel flex items-center gap-1">
              <Award size={12} /> TARGET HARIAN LENGKAP!
            </span>
          )}
        </div>
      </div>

      {/* Daily goals items checklist */}
      {dailyGoals.length === 0 ? (
        <p className="text-xs text-[#7e759b] font-silkscreen italic text-center py-2">
          Belum ada target harian yang spesifik. Klik "+ Target Baru" untuk menetapkan target hari ini!
        </p>
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {dailyGoals.map((g) => {
            const identity = getIdentity(g.identityId);
            const isCompleted = g.completed || g.currentMinutes >= g.targetMinutes;
            const isActive = g.id === activeGoalId;
            const progress = Math.min(100, Math.round((g.currentMinutes / g.targetMinutes) * 100));

            return (
              <div
                key={g.id}
                className={`p-2.5 border-2 flex items-center justify-between gap-3 text-xs transition-all ${
                  isActive
                    ? 'bg-[#0f2129] border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                    : isCompleted
                    ? 'bg-[#15241b] border-[#00ff66]/70'
                    : 'bg-[#151224] border-[#2e2649] hover:border-[#3f3562]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleGoalComplete(g.id)}
                    className={`w-5 h-5 flex items-center justify-center border cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-[#00ff66] text-black border-black'
                        : 'bg-[#0f0d1a] text-transparent border-[#3b335c] hover:border-[#00ff66]'
                    }`}
                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    <CheckCircle size={14} className={isCompleted ? 'text-black' : 'opacity-0'} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {identity && (
                        <span
                          className="w-2 h-2 inline-block shrink-0"
                          style={{ backgroundColor: identity.color }}
                        />
                      )}
                      <span
                        className={`font-silkscreen text-xs font-bold truncate ${
                          isCompleted ? 'line-through text-[#7e759b]' : 'text-[#f0edf6]'
                        }`}
                      >
                        {g.title}
                      </span>

                      {/* Active Goal Pill */}
                      {isActive && (
                        <span className="text-[9px] font-pixel px-1.5 py-0.2 bg-[#00f0ff] text-black border border-black flex items-center gap-0.5 font-bold">
                          <Zap size={9} /> AKTIF
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-silkscreen text-[#9f97ba] mt-0.5 flex items-center gap-2">
                      <span>{formatMinutes(g.currentMinutes)} / {formatMinutes(g.targetMinutes)} ({progress}%)</span>
                      <span>•</span>
                      <span>{g.currentSessions} / {g.targetSessions} sesi</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Quick Select as Active Goal Button */}
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => handleSelectActiveGoal(g)}
                      className="px-2 py-1 bg-[#1c1830] hover:bg-[#2b2447] text-[#00f0ff] border border-[#3b335c] hover:border-[#00f0ff] text-[10px] font-silkscreen cursor-pointer flex items-center gap-1 transition-all"
                      title="Jadikan target fokus aktif sesi timer ini"
                    >
                      <Target size={10} />
                      <span className="hidden sm:inline">Set</span> Aktif
                    </button>
                  )}

                  <div className="w-16 sm:w-20">
                    <div className="w-full bg-[#0d0c15] border border-black h-2">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isActive ? '#00f0ff' : isCompleted ? '#00ff66' : identity?.color || '#ffd700',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

