import React from 'react';
import { PieChart } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { useGoalStore } from '../../store/useGoalStore';
import { formatMinutes } from '../../utils/formatters';

export const IdentityBreakdown: React.FC = () => {
  const { identities } = useGoalStore();
  const { getIdentityStats } = useStatsStore();

  const identityStats = getIdentityStats(identities.map((i) => i.id));

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-1.5">
            <PieChart size={16} className="text-[#ffd700]" />
            Distribusi Alokasi Fokus per Identitas
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            Membuktikan komitmen nyata pada siapa dirimu yang sesungguhnya.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {identities.map((identity) => {
          const stat = identityStats.find((s) => s.identityId === identity.id) || {
            totalMinutes: 0,
            totalSessions: 0,
            percentage: 0,
          };

          return (
            <div key={identity.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-silkscreen">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 border border-black"
                    style={{ backgroundColor: identity.color }}
                  />
                  <span className="font-bold text-[#f0edf6]">{identity.name}</span>
                  <span className="text-[10px] text-[#7d759b]">({identity.role})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#00f0ff] font-pixel text-[11px]">
                    {formatMinutes(stat.totalMinutes)}
                  </span>
                  <span className="text-[#ffd700] font-pixel text-[11px] w-12 text-right">
                    {stat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-[#0d0c15] border-2 border-black h-3 p-[1px]">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: identity.color,
                  }}
                />
              </div>

              <div className="text-[10px] font-silkscreen text-[#786f94]">
                Total: {stat.totalSessions} sesi fokus diselesaikan
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
