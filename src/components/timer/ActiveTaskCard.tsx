import React from 'react';
import { Target, Sparkles, Quote, Zap, RefreshCw } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';

export const ActiveTaskCard: React.FC = () => {
  const { taskTitle, setTaskTitle, setActiveIdentityId: setTimerIdentityId } = useTimerStore();
  const { identities, goals, activeIdentityId, setActiveIdentityId, activeGoalId, setActiveGoalId } = useGoalStore();

  const currentIdentity = identities.find((i) => i.id === activeIdentityId) || identities[0];
  const activeGoal = goals.find((g) => g.id === activeGoalId);

  const handleSelectGoal = (goalId: string) => {
    if (!goalId) {
      setActiveGoalId(null);
      return;
    }
    const found = goals.find((g) => g.id === goalId);
    if (found) {
      setActiveGoalId(found.id);
      setTaskTitle(found.title);
      setActiveIdentityId(found.identityId);
      setTimerIdentityId(found.identityId);
    }
  };

  const handleSyncWithGoalTitle = () => {
    if (activeGoal) {
      setTaskTitle(activeGoal.title);
    }
  };

  const dailyGoals = goals.filter((g) => g.period === 'daily');
  const otherGoals = goals.filter((g) => g.period !== 'daily');

  return (
    <div className="w-full bg-[#181528] pixel-border border-4 border-black p-4 space-y-3">
      {/* Active Goal Selector & Status Bar */}
      <div className="p-2.5 bg-[#120f20] border-2 border-[#2b2545] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 border border-black ${activeGoal ? 'bg-[#00f0ff] text-black' : 'bg-[#2b2545] text-[#71688d]'}`}>
            <Target size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-pixel text-[#00f0ff] uppercase tracking-wider">
                GOAL / TARGET AKTIF SAAT INI:
              </span>
              {activeGoal && (
                <span className="text-[9px] font-pixel px-1.5 py-0.2 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]">
                  TERHUBUNG KE LOG
                </span>
              )}
            </div>
            <p className="text-xs font-silkscreen font-bold text-[#f0edf6] truncate mt-0.5">
              {activeGoal ? activeGoal.title : 'Belum memilih goal aktif (opsional)'}
            </p>
          </div>
        </div>

        {/* Goal Selector Dropdown */}
        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
          <select
            value={activeGoalId || ''}
            onChange={(e) => handleSelectGoal(e.target.value)}
            className="w-full sm:w-56 bg-[#0a0814] border border-[#3b335c] hover:border-[#00f0ff] px-2.5 py-1.5 text-xs text-[#00f0ff] font-silkscreen outline-none cursor-pointer"
          >
            <option value="">-- Pilih Goal Aktif --</option>
            {dailyGoals.length > 0 && (
              <optgroup label="📅 Target Harian">
                {dailyGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.completed ? '✓ ' : '⚔️ '} {g.title}
                  </option>
                ))}
              </optgroup>
            )}
            {otherGoals.length > 0 && (
              <optgroup label="🌙 Bulanan & Tahunan">
                {otherGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.completed ? '✓ ' : '🎯 '} {g.title}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Task Objective Input & Identity Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Task Objective Input */}
        <div className="flex-1">
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-[#00f0ff]" />
              Judul Sesi Fokus (Dicatat di Riwayat Sesi):
            </span>
            {activeGoal && taskTitle !== activeGoal.title && (
              <button
                type="button"
                onClick={handleSyncWithGoalTitle}
                className="text-[10px] text-[#00f0ff] font-silkscreen hover:underline cursor-pointer flex items-center gap-1"
                title="Gunakan nama goal sebagai judul sesi"
              >
                <RefreshCw size={10} />
                <span>Samakan dgn Goal</span>
              </button>
            )}
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Tuliskan nama tugas spesifik atau sesuaikan dengan goal..."
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-2 text-sm text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff] transition-all"
          />
        </div>

        {/* Identity Selector */}
        <div className="w-full md:w-64">
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#ffd700]" />
            Tautkan ke Identitas Diri:
          </label>
          <select
            value={activeIdentityId}
            onChange={(e) => {
              setActiveIdentityId(e.target.value);
              setTimerIdentityId(e.target.value);
            }}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-2 text-sm text-[#00f0ff] font-silkscreen outline-none focus:border-[#00f0ff] cursor-pointer"
          >
            {identities.map((id) => (
              <option key={id.id} value={id.id}>
                {id.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Identity Motto / Affirmation Banner */}
      {currentIdentity && (
        <div className="pt-2 border-t border-[#2b2545] flex items-start gap-2 text-xs text-[#b8b0cf] italic">
          <Quote size={13} className="text-[#ffd700] shrink-0 mt-0.5" />
          <span>"{currentIdentity.motto}"</span>
        </div>
      )}
    </div>
  );
};
