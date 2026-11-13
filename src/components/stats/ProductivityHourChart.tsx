import React, { useState } from 'react';
import { Clock, Sun, Moon, Sparkles, TrendingUp } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { formatMinutes } from '../../utils/formatters';

export const ProductivityHourChart: React.FC = () => {
  const { sessions } = useStatsStore();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Group focus sessions into 24-hour slots
  const focusSessions = sessions.filter((s) => s.mode === 'focus');
  const hourMinutes = new Array<number>(24).fill(0);
  const hourSessions = new Array<number>(24).fill(0);

  focusSessions.forEach((s) => {
    try {
      const hour = new Date(s.timestamp).getHours();
      if (hour >= 0 && hour < 24) {
        hourMinutes[hour] += s.durationMinutes;
        hourSessions[hour] += 1;
      }
    } catch {}
  });

  const maxMinutes = Math.max(...hourMinutes, 30);

  // Find Peak Hour
  let peakHour = 9;
  let peakMins = 0;
  hourMinutes.forEach((mins, h) => {
    if (mins > peakMins) {
      peakMins = mins;
      peakHour = h;
    }
  });

  // Flow window classification
  const getWindowLabel = (h: number) => {
    if (h >= 5 && h < 12) return { label: 'Pagi Hari', icon: <Sun size={14} className="text-[#ffd700]" /> };
    if (h >= 12 && h < 17) return { label: 'Siang Hari', icon: <Sun size={14} className="text-[#ff9900]" /> };
    if (h >= 17 && h < 22) return { label: 'Sore/Malam', icon: <Moon size={14} className="text-[#00f0ff]" /> };
    return { label: 'Larut Malam (Night Owl)', icon: <Moon size={14} className="text-[#b388ff]" /> };
  };

  const peakWindow = getWindowLabel(peakHour);

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-[#2b2545]">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-2">
            <Clock size={16} className="text-[#ffd700]" />
            Analisis Jam Produktivitas Emas (Peak Flow Hours)
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            Pola waktu 24-jam di mana energimu paling konsisten untuk belajar & bekerja.
          </p>
        </div>

        {/* Peak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#241a05] border border-[#ffd700] text-xs font-silkscreen text-[#ffd700]">
          {peakWindow.icon}
          <span>
            Jam Puncak: {String(peakHour).padStart(2, '0')}:00 ({formatMinutes(peakMins)})
          </span>
        </div>
      </div>

      {/* 24-Hour Bar Chart */}
      <div className="bg-[#120f20] border-2 border-[#2b2545] p-3 sm:p-4 mb-3">
        <div className="flex justify-between items-center text-[10px] font-silkscreen text-[#675f85] border-b border-[#221c3b] pb-1 mb-2">
          <span>00:00 (Tengah Malam)</span>
          <span>12:00 (Tengah Hari)</span>
          <span>23:00 (Malam)</span>
        </div>

        {/* Vertical Bars */}
        <div className="h-36 sm:h-44 flex items-end gap-1 sm:gap-1.5 pt-2 relative">
          {/* Guide Line at 50% */}
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#221c3b] pointer-events-none" />

          {hourMinutes.map((mins, h) => {
            const isPeak = h === peakHour && mins > 0;
            const isHovered = hoveredHour === h;
            const heightPct = mins > 0 ? Math.max(12, Math.round((mins / maxMinutes) * 100)) : 5;

            return (
              <div
                key={h}
                onMouseEnter={() => setHoveredHour(h)}
                onMouseLeave={() => setHoveredHour(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip on hover */}
                {isHovered && mins > 0 && (
                  <div className="absolute -top-6 px-1.5 py-0.5 bg-black border border-[#ffd700] font-pixel text-[8px] sm:text-[9px] text-[#ffd700] whitespace-nowrap z-20 pointer-events-none">
                    {String(h).padStart(2, '0')}:00 • {formatMinutes(mins)} ({hourSessions[h]} sesi)
                  </div>
                )}

                {/* Crown on Peak Hour */}
                {isPeak && (
                  <span className="text-[10px] sm:text-xs select-none -mb-1 z-10 animate-bounce">
                    👑
                  </span>
                )}

                {/* The Bar */}
                <div
                  className={`w-full transition-all duration-200 border ${
                    isPeak
                      ? 'bg-[#ff0055] border-[#ff4d79] shadow-[0_0_8px_rgba(255,0,85,0.7)]'
                      : isHovered
                      ? 'bg-[#00f0ff] border-white shadow-[0_0_6px_rgba(0,240,255,0.6)]'
                      : mins > 0
                      ? 'bg-[#00f0ff]/80 border-[#00f0ff]'
                      : 'bg-[#1a162b] border-[#292242]'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    minHeight: mins > 0 ? '14px' : '4px',
                  }}
                />

                {/* Hour label below */}
                <span
                  className={`text-[7px] sm:text-[8px] font-pixel mt-1 select-none leading-none ${
                    isPeak
                      ? 'text-[#ff0055] font-bold'
                      : isHovered
                      ? 'text-white'
                      : h % 3 === 0
                      ? 'text-[#8e85aa]'
                      : 'text-transparent'
                  }`}
                >
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights & Recommendations Banner */}
      <div className="bg-[#120f20] border border-[#2b2545] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-silkscreen">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#ffd700] shrink-0" />
          <p className="text-[#d8d2ea]">
            {peakMins > 0 ? (
              <>
                Ritme terbaikmu ada pada <strong className="text-[#ffd700]">{peakWindow.label} (sekitar pukul {String(peakHour).padStart(2, '0')}:00)</strong>. Gunakan waktu ini untuk tugas berat yang butuh konsentrasi tertinggi!
              </>
            ) : (
              'Mulai fokus dengan Pomodoro untuk melihat peta jam produktivitas emasmu.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#7ce0b2] shrink-0">
          <TrendingUp size={12} />
          <span>Analisis 24-Jam Otomatis</span>
        </div>
      </div>
    </div>
  );
};
