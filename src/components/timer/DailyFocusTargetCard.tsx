import React from 'react';
import { Target, CheckCircle, Clock, Flame, Plus, Award } from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { useStatsStore } from '../../store/useStatsStore';
import { PixelProgress } from '../ui/PixelProgress';
import { formatMinutes } from '../../utils/formatters';

interface DailyFocusTargetCardProps {
  onOpenAddGoal?: () => void;
}

export const DailyFocusTargetCard: React.FC<DailyFocusTargetCardProps> = ({ onOpenAddGoal }) => {
  const { goals, identities, toggleGoalComplete } = useGoalStore();
  const { getTodayMinutes, getTodaySessionsCount, currentStreak } = useStatsStore();

  const todayMinutes = getTodayMinutes();
  const todaySessions = getTodaySessionsCount();

  const dailyGoals = goals.filter((g) => g.period === 'daily');

  // Overall aggregate daily target
  const aggregateTargetMinutes = dailyGoals.reduce((acc, g) => acc + g.targetMinutes, 0) || 100;
  const aggregateTargetSessions = dailyGoals.reduce((acc, g) => acc + g.targetSessions, 0) || 4;

  const overallPercent = Math.min(100, Math.round((todayMinutes / aggregateTargetMinutes) * 100));
  const isGoalReached = todayMinutes >= aggregateTargetMinutes && aggregateTargetMinutes > 0;

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#261520] border border-[#ff0055] text-xs font-silkscreen text-[#ff0055]">
            <Flame size={13} className="animate-pulse" />
            <span>Streak {currentStreak} Hari</span>
          </div>

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
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {dailyGoals.map((g) => {
            const identity = getIdentity(g.identityId);
            const isCompleted = g.completed || g.currentMinutes >= g.targetMinutes;
            const progress = Math.min(100, Math.round((g.currentMinutes / g.targetMinutes) * 100));

            return (
              <div
                key={g.id}
                className={`p-2.5 border-2 flex items-center justify-between gap-3 text-xs transition-all ${
                  isCompleted
                    ? 'bg-[#15241b] border-[#00ff66]/70'
                    : 'bg-[#151224] border-[#2e2649]'
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
                  >
                    <CheckCircle size={14} className={isCompleted ? 'text-black' : 'opacity-0'} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
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
                    </div>
                    <div className="text-[10px] font-silkscreen text-[#9f97ba] mt-0.5">
                      {formatMinutes(g.currentMinutes)} / {formatMinutes(g.targetMinutes)} ({progress}%)
                    </div>
                  </div>
                </div>

                <div className="w-20 shrink-0">
                  <div className="w-full bg-[#0d0c15] border border-black h-2">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isCompleted ? '#00ff66' : identity?.color || '#00f0ff',
                      }}
                    />
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

