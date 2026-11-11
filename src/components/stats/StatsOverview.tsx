import React from 'react';
import { Clock, Flame, Zap, Trophy } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { useGamifyStore } from '../../store/useGamifyStore';
import { formatMinutes } from '../../utils/formatters';

export const StatsOverview: React.FC = () => {
  const { currentStreak, longestStreak, getTotalMinutes, getTodayMinutes, sessions } = useStatsStore();
  const { hero } = useGamifyStore();

  const totalMinutes = getTotalMinutes();
  const todayMinutes = getTodayMinutes();
  const focusSessions = sessions.filter((s) => s.mode === 'focus');
  const todaySessions = focusSessions.filter(
    (s) => s.dateStr === new Date().toISOString().split('T')[0]
  );

  const statCards = [
    {
      title: 'Total Waktu Fokus',
      value: formatMinutes(totalMinutes),
      subtitle: `${focusSessions.length} total sesi`,
      icon: <Clock size={20} className="text-[#00f0ff]" />,
      borderColor: '#00f0ff',
    },
    {
      title: 'Fokus Hari Ini',
      value: formatMinutes(todayMinutes),
      subtitle: `${todaySessions.length} sesi hari ini`,
      icon: <Zap size={20} className="text-[#ffd700]" />,
      borderColor: '#ffd700',
    },
    {
      title: 'Current Streak',
      value: `${currentStreak} Hari`,
      subtitle: `Rekor Terbaik: ${longestStreak} hari`,
      icon: <Flame size={20} className="text-[#ff0055] animate-pulse" />,
      borderColor: '#ff0055',
    },
    {
      title: 'Hero Level & Gold',
      value: `Lvl ${hero.level}`,
      subtitle: `${hero.gold} Koin Gold dikantongi`,
      icon: <Trophy size={20} className="text-[#00ff66]" />,
      borderColor: '#00ff66',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#181528] p-4 border-2 shadow-[2px_2px_0px_#000] relative overflow-hidden"
          style={{ borderColor: card.borderColor }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-silkscreen text-[#9f97ba] uppercase truncate">
              {card.title}
            </span>
            <div className="p-1.5 bg-[#0d0c15] border border-black">{card.icon}</div>
          </div>

          <div className="font-pixel text-xl sm:text-2xl text-[#f0edf6] my-1 tracking-tight">
            {card.value}
          </div>

          <div className="text-[11px] font-silkscreen text-[#7d759b] truncate">
            {card.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};
