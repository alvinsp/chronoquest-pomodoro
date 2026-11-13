import React, { useState } from 'react';
import { BarChart3, TrendingUp, Award, Calendar, Zap, Clock } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { formatDatePretty, formatMinutes, getTodayDateString } from '../../utils/formatters';

type TimeRange = 7 | 14 | 30;

interface FocusBarChartProps {
  hideOuterCard?: boolean;
}

export const FocusBarChart: React.FC<FocusBarChartProps> = ({ hideOuterCard = false }) => {
  const { getHeatmapData } = useStatsStore();
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  const todayStr = getTodayDateString();
  const rawData = getHeatmapData(timeRange);

  // Summary Metrics calculations
  const totalMinutes = rawData.reduce((acc, d) => acc + d.minutes, 0);
  const activeDaysCount = rawData.filter((d) => d.minutes > 0).length;
  const avgMinutesPerDay = Math.round(totalMinutes / timeRange);

  // Peak Day
  let peakDay = rawData[0];
  rawData.forEach((d) => {
    if (d.minutes > (peakDay?.minutes || 0)) {
      peakDay = d;
    }
  });

  // Calculate chart scale
  const maxDayMinutes = Math.max(...rawData.map((d) => d.minutes), 60);
  // Round max scale up to nearest 30 mins
  const chartMax = Math.ceil(maxDayMinutes / 30) * 30;

  // Selected or hovered day for detail card (defaults to today or peak day)
  const selectedDay =
    activeHoverIndex !== null
      ? rawData[activeHoverIndex]
      : rawData.find((d) => d.date === todayStr) || rawData[rawData.length - 1];

  const getDayName = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('id-ID', { weekday: 'short' });
    } catch {
      return '';
    }
  };

  const getDayNumber = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      return parts[2] || '';
    } catch {
      return '';
    }
  };

  const getBarColor = (minutes: number) => {
    if (minutes <= 0) return { bg: 'bg-[#1b172e]', border: 'border-[#2c264a]', cap: 'bg-[#3b335c]' };
    if (minutes >= 120) return { bg: 'bg-[#ff0055]', border: 'border-[#ff4d79]', cap: 'bg-[#ff99b3]' };
    if (minutes >= 75) return { bg: 'bg-[#ffd700]', border: 'border-[#ffe240]', cap: 'bg-[#fff499]' };
    if (minutes >= 40) return { bg: 'bg-[#00f0ff]', border: 'border-[#66f5ff]', cap: 'bg-[#b3faff]' };
    return { bg: 'bg-[#00ff66]', border: 'border-[#4dff94]', cap: 'bg-[#b3ffce]' };
  };

  return (
    <div className={hideOuterCard ? '' : 'bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5'}>
      {/* Top Header & Range Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#2b2545]">
        <div>
          <h3 className="font-silkscreen text-xs sm:text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-2">
            <BarChart3 size={15} className="text-[#00f0ff]" />
            Grafik Batang Waktu Fokus
          </h3>
          <p className="text-[11px] text-[#9f97ba] mt-0.5">
            Tinggi batang menunjukkan perbandingan total waktu fokus harianmu.
          </p>
        </div>

        {/* Timeframe switcher pills */}
        <div className="flex items-center gap-1.5 bg-[#120f20] p-1 border-2 border-[#2b2545]">
          {([7, 14, 30] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => {
                setTimeRange(range);
                setActiveHoverIndex(null);
              }}
              className={`px-2.5 py-1 text-xs font-silkscreen cursor-pointer transition-all border ${
                timeRange === range
                  ? 'bg-[#00f0ff] text-black font-bold border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-[#9f97ba] border-transparent hover:text-white'
              }`}
            >
              {range === 7 ? '7 Hari' : range === 14 ? '14 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <div className="bg-[#120f20] border-2 border-[#2b2545] p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shrink-0">
            <Clock size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-silkscreen text-[#7e769d] block truncate">Total Fokus</span>
            <span className="font-pixel text-xs sm:text-sm text-[#00f0ff] font-bold">
              {formatMinutes(totalMinutes)}
            </span>
          </div>
        </div>

        <div className="bg-[#120f20] border-2 border-[#2b2545] p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 shrink-0">
            <TrendingUp size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-silkscreen text-[#7e769d] block truncate">Rata-rata/Hari</span>
            <span className="font-pixel text-xs sm:text-sm text-[#ffd700] font-bold">
              {formatMinutes(avgMinutesPerDay)}
            </span>
          </div>
        </div>

        <div className="bg-[#120f20] border-2 border-[#2b2545] p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/30 shrink-0">
            <Award size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-silkscreen text-[#7e769d] block truncate">Hari Puncak</span>
            <span className="font-pixel text-xs sm:text-sm text-[#ff0055] font-bold">
              {peakDay && peakDay.minutes > 0 ? formatMinutes(peakDay.minutes) : '0m'}
            </span>
          </div>
        </div>

        <div className="bg-[#120f20] border-2 border-[#2b2545] p-2.5 flex items-center gap-2.5">
          <div className="p-2 bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 shrink-0">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-silkscreen text-[#7e769d] block truncate">Hari Aktif</span>
            <span className="font-pixel text-xs sm:text-sm text-[#00ff66] font-bold">
              {activeDaysCount} / {timeRange}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="bg-[#120f20] border-2 border-[#2b2545] p-3 sm:p-4 mb-3">
        {/* Y-axis guidelines */}
        <div className="flex justify-between items-center text-[10px] font-silkscreen text-[#675f85] border-b border-[#221c3b] pb-1 mb-2">
          <span>Skala Maks: {formatMinutes(chartMax)}</span>
          <span>50%: {formatMinutes(chartMax / 2)}</span>
          <span>0m</span>
        </div>

        {/* Bars Container */}
        <div className="h-44 sm:h-52 flex items-end gap-1.5 sm:gap-2.5 pt-2 px-1 relative">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#221c3b] pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-[#1c1733] pointer-events-none" />

          {rawData.map((day, idx) => {
            const isToday = day.date === todayStr;
            const isHovered = activeHoverIndex === idx;
            const heightPercent = day.minutes > 0
              ? Math.max(12, Math.round((day.minutes / chartMax) * 100))
              : 5;
            const color = getBarColor(day.minutes);

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setActiveHoverIndex(idx)}
                onMouseLeave={() => setActiveHoverIndex(null)}
                onClick={() => setActiveHoverIndex(idx)}
              >
                {/* Value on hover */}
                {isHovered && day.minutes > 0 && (
                  <div className="absolute -top-6 px-1.5 py-0.5 bg-black border border-[#00f0ff] font-pixel text-[9px] text-[#00f0ff] whitespace-nowrap z-20 animate-fade-in pointer-events-none">
                    {formatMinutes(day.minutes)}
                  </div>
                )}

                {/* The Bar */}
                <div
                  className={`w-full transition-all duration-300 relative border-2 ${
                    isHovered
                      ? 'scale-y-105 brightness-125 z-10 border-white shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                      : isToday
                      ? 'border-[#00f0ff] shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                      : color.border
                  } ${color.bg}`}
                  style={{
                    height: `${heightPercent}%`,
                    minHeight: day.minutes > 0 ? '16px' : '6px',
                  }}
                >
                  {/* Pixel highlight top cap */}
                  {day.minutes > 0 && (
                    <div className={`w-full h-1 sm:h-1.5 ${color.cap} opacity-80`} />
                  )}
                </div>

                {/* Day Label Below Bar */}
                <div className="mt-2 text-center select-none">
                  {timeRange <= 14 && (
                    <span
                      className={`text-[9px] font-silkscreen block ${
                        isToday
                          ? 'text-[#00f0ff] font-bold'
                          : isHovered
                          ? 'text-white'
                          : 'text-[#8b82aa]'
                      }`}
                    >
                      {getDayName(day.date)}
                    </span>
                  )}
                  <span
                    className={`text-[8px] sm:text-[9px] font-pixel block leading-none mt-0.5 ${
                      isToday
                        ? 'text-[#00f0ff] font-bold'
                        : isHovered
                        ? 'text-[#ffd700]'
                        : 'text-[#645c81]'
                    }`}
                  >
                    {getDayNumber(day.date)}
                  </span>

                  {/* Tiny Today Indicator dot */}
                  {isToday && (
                    <div className="w-1.5 h-1.5 bg-[#00f0ff] mx-auto mt-0.5 rounded-full animate-ping" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected / Hovered Day Detail Banner */}
      <div className="bg-[#120f20] border border-[#2b2545] p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-silkscreen">
        {selectedDay ? (
          <>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#1e1933] border border-[#3b335c] text-[#ffd700]">
                <Calendar size={13} />
              </span>
              <div>
                <span className="text-[#f0edf6] font-bold">
                  {formatDatePretty(selectedDay.date)}
                  {selectedDay.date === todayStr && (
                    <span className="ml-2 text-[9px] font-pixel px-1.5 py-0.2 bg-[#00f0ff] text-black border border-black font-bold">
                      HARI INI
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#9f97ba]">
                Fokus:{' '}
                <strong className="text-[#00f0ff] font-pixel text-[11px]">
                  {formatMinutes(selectedDay.minutes)}
                </strong>
              </span>
              <span className="text-[#9f97ba]">•</span>
              <span className="text-[#9f97ba]">
                Sesi:{' '}
                <strong className="text-[#ffd700] font-pixel text-[11px]">
                  {selectedDay.sessions} sesi
                </strong>
              </span>
            </div>
          </>
        ) : (
          <span className="text-[#7e769d]">Arahkan kursor ke batang untuk melihat detail tanggal.</span>
        )}
      </div>
    </div>
  );
};
