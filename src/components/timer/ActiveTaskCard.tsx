import React from 'react';
import { Target, Sparkles, Quote } from 'lucide-react';
import { useTimerStore } from '../../store/useTimerStore';
import { useGoalStore } from '../../store/useGoalStore';

export const ActiveTaskCard: React.FC = () => {
  const { taskTitle, setTaskTitle } = useTimerStore();
  const { identities, activeIdentityId, setActiveIdentityId } = useGoalStore();

  const currentIdentity = identities.find((i) => i.id === activeIdentityId) || identities[0];

  return (
    <div className="w-full bg-[#181528] pixel-border border-4 border-black p-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Task Objective Input */}
        <div className="flex-1">
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1 flex items-center gap-1.5">
            <Target size={13} className="text-[#ff0055]" />
            Target Fokus Saat Ini:
          </label>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Tuliskan apa yang sedang kamu selesaikan..."
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

