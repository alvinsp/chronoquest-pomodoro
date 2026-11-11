import React from 'react';
import { Target, Sparkles, Quote, Zap } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';

export const ActiveTaskCard: React.FC = () => {
  const { taskTitle, setTaskTitle } = useTimerStore();
  const { identities, goals, activeIdentityId, setActiveIdentityId } = useGoalStore();

  const currentIdentity = identities.find((i) => i.id === activeIdentityId) || identities[0];
  const activeDailyGoal = goals.find(
    (g) => g.period === 'daily' && g.identityId === activeIdentityId && !g.completed
  );

  const suggestions = [
    'Deep Coding & Refactoring',
    'Riset & Analisis Algoritma',
    'Menulis Dokumentasi Teknis',
    'Desain Arsitektur Sistem',
  ];

  return (
    <div className="w-full bg-[#181528] pixel-border border-4 border-black p-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Task Objective Input */}
        <div className="flex-1">
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Target size={13} className="text-[#ff0055]" />
              Target / Judul Fokus Sesi Ini:
            </span>
            {!taskTitle.trim() && (
              <span className="text-[10px] text-[#ff0055] font-pixel animate-pulse">
                *Wajib / Disarankan Diisi
              </span>
            )}
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Tuliskan nama tugas (contoh: Koding Fitur Autentikasi)..."
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-2 text-sm text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff] transition-all"
          />

          {/* Quick suggestions if title is empty or short */}
          {!taskTitle.trim() && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-[#71688d] font-silkscreen">Pilih Cepat:</span>
              {activeDailyGoal && (
                <button
                  type="button"
                  onClick={() => setTaskTitle(activeDailyGoal.title)}
                  className="px-2 py-0.5 bg-[#251528] border border-[#ff0055] text-[#ff0055] text-[10px] font-silkscreen hover:brightness-125 cursor-pointer flex items-center gap-1"
                >
                  <Zap size={10} />
                  <span>{activeDailyGoal.title}</span>
                </button>
              )}
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTaskTitle(sug)}
                  className="px-2 py-0.5 bg-[#120f20] border border-[#3b335c] text-[#a097bd] text-[10px] font-silkscreen hover:text-white hover:border-[#00f0ff] cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Identity Selector */}
        <div className="w-full md:w-64">
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#ffd700]" />
            Tautkan ke Identitas Diri:
          </label>
          <select
            value={activeIdentityId}
            onChange={(e) => setActiveIdentityId(e.target.value)}
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
        <div className="mt-3 pt-2.5 border-t border-[#2b2545] flex items-start gap-2 text-xs text-[#b8b0cf] italic">
          <Quote size={13} className="text-[#ffd700] shrink-0 mt-0.5" />
          <span>"{currentIdentity.motto}"</span>
        </div>
      )}
    </div>
  );
};
