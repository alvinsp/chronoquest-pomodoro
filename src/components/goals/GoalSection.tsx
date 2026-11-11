import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, Trash2, Award, Target, Zap } from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { useTimerStore } from '../../store/useTimerStore';
import type { GoalPeriod, Goal } from '../../types/goal';
import { PixelButton } from '../ui/PixelButton';
import { PixelProgress } from '../ui/PixelProgress';
import { AddGoalModal } from './AddGoalModal';
import { formatMinutes } from '../../utils/formatters';

export const GoalSection: React.FC = () => {
  const { goals, identities, activeGoalId, setActiveGoalId, toggleGoalComplete, deleteGoal } = useGoalStore();
  const { setTaskTitle, setActiveIdentityId: setTimerIdentityId } = useTimerStore();
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('daily');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredGoals = goals.filter((g) => g.period === selectedPeriod);

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

  const handleActivateGoal = (g: Goal) => {
    setActiveGoalId(g.id);
    setTaskTitle(g.title);
    setTimerIdentityId(g.identityId);
  };

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b-2 border-[#2b2545]">
        <div className="flex items-center gap-2">
          {(['daily', 'monthly', 'annually'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-1.5 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all ${
                selectedPeriod === period
                  ? 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_#000]'
                  : 'bg-[#151224] text-[#9f97ba] border-[#2f274a] hover:text-white'
              }`}
            >
              {period === 'daily' ? '📅 Harian' : period === 'monthly' ? '🌙 Bulanan' : '🌟 Tahunan'}
            </button>
          ))}
        </div>

        <PixelButton variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} />
          <span>Tambah Target</span>
        </PixelButton>
      </div>

      {/* Goal Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-8 text-center bg-[#151224] border-2 border-dashed border-[#362f54]">
          <p className="text-sm font-silkscreen text-[#9f97ba]">
            Belum ada target untuk periode ini.
          </p>
          <p className="text-xs text-[#6e658b] mt-1">
            Klik tombol "+ Tambah Target" untuk menentukan komitmen fokusmu!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredGoals.map((goal) => {
            const identity = getIdentity(goal.identityId);
            const isDaily = goal.period === 'daily';
            const isCompleted = goal.completed || (isDaily && goal.targetMinutes > 0 && goal.currentMinutes >= goal.targetMinutes);
            const isActive = isDaily && goal.id === activeGoalId;
            const percent = isDaily && goal.targetMinutes > 0
              ? Math.min(100, Math.round((goal.currentMinutes / goal.targetMinutes) * 100))
              : 0;

            return (
              <div
                key={goal.id}
                className={`p-4 border-2 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-[#0f2129] border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : isCompleted
                    ? 'bg-[#16241c] border-[#00ff66] shadow-[2px_2px_0px_#000]'
                    : 'bg-[#181528] border-[#362f54] hover:border-[#4f4476]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {identity && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-pixel border border-black"
                            style={{
                              backgroundColor: `${identity.color}22`,
                              color: identity.color,
                              borderColor: identity.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 inline-block"
                              style={{ backgroundColor: identity.color }}
                            />
                            {identity.name}
                          </span>
                        )}

                        {/* Active Goal Badge */}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-pixel bg-[#00f0ff] text-black border border-black font-bold">
                            <Zap size={9} /> GOAL AKTIF TIMER
                          </span>
                        )}
                      </div>

                      <h4
                        className={`font-silkscreen text-xs font-bold leading-snug ${
                          isCompleted ? 'line-through text-[#9f97ba]' : 'text-[#f0edf6]'
                        }`}
                      >
                        {goal.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleGoalComplete(goal.id)}
                        className={`p-1 border cursor-pointer transition-all ${
                          isCompleted
                            ? 'bg-[#00ff66] text-black border-black'
                            : 'bg-[#0f0d1a] text-[#71688d] border-[#3b335c] hover:border-[#00ff66]'
                        }`}
                        title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                      >
                        <CheckCircle size={15} />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-[#6c638a] hover:text-[#ff3b30] cursor-pointer"
                        title="Hapus goal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-[#a097bd] mb-3 leading-snug bg-[#120f20] p-2 border border-[#2b2545]">
                      {goal.notes}
                    </p>
                  )}

                  {/* Progress info for Daily goals vs Milestone info for Monthly/Annual */}
                  {isDaily ? (
                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between items-center text-xs font-silkscreen text-[#b5aecd]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#00f0ff]" />
                          {formatMinutes(goal.currentMinutes)} / {formatMinutes(goal.targetMinutes)}
                        </span>
                        <span className="text-[#ffd700] font-pixel text-[11px]">{percent}%</span>
                      </div>

                      <PixelProgress
                        value={goal.currentMinutes}
                        max={goal.targetMinutes}
                        size="sm"
                        variant={isActive ? 'neon' : isCompleted ? 'success' : 'xp'}
                      />

                      <div className="flex justify-between items-center text-[11px] font-silkscreen text-[#7d759b] pt-1">
                        <span>
                          Sesi: {goal.currentSessions} / {goal.targetSessions} sesi
                        </span>
                        {isCompleted && (
                          <span className="text-[#00ff66] font-pixel text-[10px] flex items-center gap-1">
                            <Award size={11} /> TARGET TERCAPAI!
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 bg-[#120f20] border border-[#2b2545] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-pixel text-[#8d84aa] uppercase block">
                          STATUS MILESTONE {goal.period === 'monthly' ? 'BULANAN' : 'TAHUNAN'}:
                        </span>
                        <span
                          className={`text-xs font-silkscreen font-bold ${
                            isCompleted ? 'text-[#00ff66]' : 'text-[#ffd700]'
                          }`}
                        >
                          {isCompleted ? '✓ TERCAPAI' : 'DALAM PERJALANAN'}
                        </span>
                      </div>
                      <span className="text-[11px] font-silkscreen text-[#786e97] italic">
                        Dipecah di Target Harian
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2">
                  {isDaily ? (
                    isActive ? (
                      <div className="py-1.5 px-2 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] text-[11px] font-silkscreen flex items-center justify-center gap-1.5">
                        <Zap size={12} />
                        <span>⭐ Terhubung Langsung ke Timer & Log Sesi</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivateGoal(goal)}
                        className="w-full py-1.5 px-2 bg-[#1b1730] hover:bg-[#282146] text-[#00f0ff] border border-[#3b335c] hover:border-[#00f0ff] text-[11px] font-silkscreen cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Target size={12} />
                        <span>Jadikan Target Aktif Timer</span>
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleGoalComplete(goal.id)}
                      className={`w-full py-1.5 px-2 text-xs font-silkscreen font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                        isCompleted
                          ? 'bg-[#00ff66] text-black border-black'
                          : 'bg-[#1c1830] hover:bg-[#282245] text-[#ffd700] border-[#3f3562]'
                      }`}
                    >
                      <CheckCircle size={13} />
                      <span>{isCompleted ? '✓ Milestone Tercapai' : 'Tandai Milestone Selesai'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddGoalModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultPeriod={selectedPeriod}
      />
    </div>
  );
};
