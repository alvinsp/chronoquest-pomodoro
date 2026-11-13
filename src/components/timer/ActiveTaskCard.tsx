import React from 'react';
import { Sparkles, Quote, Zap, RefreshCw } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';

export const ActiveTaskCard: React.FC = () => {
  const { taskTitle, setTaskTitle, setActiveIdentityId: setTimerIdentityId } = useTimerStore();
  const { identities, goals, activeIdentityId, setActiveIdentityId, activeGoalId } = useGoalStore();

  const currentIdentity = identities.find((i) => i.id === activeIdentityId) || identities[0];
  const activeGoal = goals.find((g) => g.id === activeGoalId);

  const handleSyncWithGoalTitle = () => {
    if (activeGoal) {
      setTaskTitle(activeGoal.title);
    }
  };

  return (
    <div className="w-full bg-[#181528] pixel-border border-4 border-black p-4 space-y-3">
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
                <span>Samakan dgn Goal Aktif</span>
              </button>
            )}
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={
              activeGoal
                ? `Sedang fokus ke target: ${activeGoal.title}`
                : 'Tuliskan nama tugas spesifik (contoh: Coding, Membaca Bab 3)...'
            }
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
