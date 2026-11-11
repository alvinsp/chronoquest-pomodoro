import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { formatDatePretty, formatMinutes } from '../../utils/formatters';

export const HeatmapGrid: React.FC = () => {
  const { getHeatmapData } = useStatsStore();
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    minutes: number;
    sessions: number;
  } | null>(null);

  // Get past 70 days (10 weeks) of activity data
  const heatmapData = getHeatmapData(70);

  // Group into columns of 7 (days of week)
  const columns: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    columns.push(heatmapData.slice(i, i + 7));
  }

  const intensityColors = {
    0: 'bg-[#120f20] border-[#201a35]',
    1: 'bg-[#005f73] border-[#0a9396]',
    2: 'bg-[#0a9396] border-[#94d2bd]',
    3: 'bg-[#ee9b00] border-[#ca6702]',
    4: 'bg-[#ff0055] border-[#ff4d79] shadow-[0_0_8px_#ff0055]',
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-1.5">
            <Calendar size={15} className="text-[#00f0ff]" />
            Matriks Aktivitas Deep Focus (70 Hari Terakhir)
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            Setiap blok piksel mewakili akumulasi menit fokusmu dalam satu hari.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-silkscreen text-[#8e85aa]">
          <span>Kurang</span>
          <div className="w-3 h-3 bg-[#120f20] border border-[#201a35]" />
          <div className="w-3 h-3 bg-[#005f73] border border-[#0a9396]" />
          <div className="w-3 h-3 bg-[#0a9396] border border-[#94d2bd]" />
          <div className="w-3 h-3 bg-[#ee9b00] border-[#ca6702]" />
          <div className="w-3 h-3 bg-[#ff0055] border-[#ff4d79]" />
          <span>Lebih Banyak</span>
        </div>
      </div>

      {/* Heatmap Grid container */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5">
              {col.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border cursor-pointer transition-transform hover:scale-125 ${
                    intensityColors[day.intensityLevel]
                  }`}
                  title={`${day.date}: ${day.minutes} menit (${day.sessions} sesi)`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="mt-3 pt-2.5 border-t border-[#27213e] flex items-center justify-between text-xs font-silkscreen text-[#9f97ba] min-h-[24px]">
        {hoveredDay ? (
          <div className="flex items-center gap-2">
            <span className="text-[#ffd700] font-bold">{formatDatePretty(hoveredDay.date)}:</span>
            <span className="text-[#00f0ff] font-pixel text-[11px]">
              {formatMinutes(hoveredDay.minutes)}
            </span>
            <span>({hoveredDay.sessions} sesi fokus selesai)</span>
          </div>
        ) : (
          <span className="text-[#645c81] flex items-center gap-1">
            <Info size={12} /> Arahkan kursor pada piksel untuk melihat rincian tanggal.
          </span>
        )}
      </div>
    </div>
  );
};
