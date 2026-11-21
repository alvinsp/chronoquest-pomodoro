import React from 'react';
import { TrendingUp } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useStatsStore } from '../../store/useStatsStore';
import { formatMinutes, getEffectiveDateString, getTodayDateString } from '../../utils/formatters';

export const WeeklyRoadmapCard: React.FC = () => {
  const { selectedDate, setSelectedDate, tasks } = usePlannerStore();
  const { sessions } = useStatsStore();
  const todayStr = getTodayDateString();

  // Find Monday of the week containing selectedDate
  const curr = new Date(selectedDate);
  // getDay: 0 is Sun, 1 is Mon, ... 6 is Sat
  const dayOfWeek = curr.getDay();
  // distance to Monday: if Sunday (0), distance is 6 days back; else dayOfWeek - 1
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - diffToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayNumber = d.getDate();

    // Planned tasks for this day
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const plannedMinutes = dayTasks.reduce((acc, t) => acc + (t.targetMinutes || 0), 0);
    const tasksCount = dayTasks.length;
    const completedTasksCount = dayTasks.filter((t) => t.completed).length;

    // Actual focus minutes for this day
    const actualMinutes = sessions
      .filter((s) => {
        const sDate = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
        return sDate === dateStr && s.mode === 'focus';
      })
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      dateStr,
      dayName,
      dayNumber,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
      plannedMinutes,
      actualMinutes,
      tasksCount,
      completedTasksCount,
    };
  });

  const totalWeekPlanned = weekDays.reduce((acc, d) => acc + d.plannedMinutes, 0);
  const totalWeekActual = weekDays.reduce((acc, d) => acc + d.actualMinutes, 0);
  const weekRatio = totalWeekPlanned > 0 ? Math.min(100, Math.round((totalWeekActual / totalWeekPlanned) * 100)) : 0;

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-[#2b2545]">
        <div>
          <h3 className="font-silkscreen text-xs sm:text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00ff66]" />
            Roadmap Mingguan Fokus (Weekly Horizon)
          </h3>
          <p className="text-[11px] text-[#9f97ba] mt-0.5">
            Komitmen fokus Senin–Minggu: bandingkan alokasi waktu rencana vs realisasi aktual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-pixel text-[#9f97ba] block">Pencapaian Minggu Ini:</span>
            <span className="font-silkscreen text-xs sm:text-sm font-bold text-[#ffd700]">
              {formatMinutes(totalWeekActual)} / {formatMinutes(totalWeekPlanned || 1)} ({weekRatio}%)
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          const maxScale = Math.max(day.plannedMinutes, day.actualMinutes, 60);
          const actualHeight = Math.min(100, Math.round((day.actualMinutes / maxScale) * 100));
          const plannedHeight = Math.min(100, Math.round((day.plannedMinutes / maxScale) * 100));

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => setSelectedDate(day.dateStr)}
              className={`p-2 border-2 text-center cursor-pointer transition-all flex flex-col justify-between ${
                day.isSelected
                  ? 'bg-[#1e1738] border-[#00f0ff] shadow-[2px_2px_0px_#000] -translate-y-1'
                  : day.isToday
                  ? 'bg-[#152329] border-[#00f0ff]/60'
                  : 'bg-[#120f20] border-[#2b2545] hover:border-[#433966]'
              }`}
            >
              <div>
                <span className="font-silkscreen text-[10px] sm:text-xs text-[#9f97ba] uppercase block">
                  {day.dayName}
                </span>
                <span
                  className={`font-silkscreen text-xs sm:text-sm font-bold block mt-0.5 ${
                    day.isToday ? 'text-[#00f0ff]' : 'text-[#f0edf6]'
                  }`}
                >
                  {day.dayNumber}
                </span>
              </div>

              {/* Mini Dual Bar (Left: Planned, Right: Actual) */}
              <div className="h-16 w-full bg-[#0d0a17] border border-[#2b2545] my-2 flex items-end justify-center gap-1 p-0.5">
                {/* Planned bar (cyan dashed style) */}
                <div
                  className="w-2.5 bg-[#553b8a] transition-all"
                  style={{ height: `${Math.max(8, plannedHeight)}%` }}
                  title={`Rencana: ${day.plannedMinutes}m`}
                />
                {/* Actual bar (green / neon) */}
                <div
                  className={`w-2.5 transition-all ${
                    day.actualMinutes >= (day.plannedMinutes || 1) && day.actualMinutes > 0
                      ? 'bg-[#00ff66]'
                      : 'bg-[#00f0ff]'
                  }`}
                  style={{ height: `${Math.max(4, actualHeight)}%` }}
                  title={`Aktual: ${day.actualMinutes}m`}
                />
              </div>

              {/* Day footer indicator */}
              <div className="text-[9px] font-pixel text-[#8e85aa] truncate">
                {day.actualMinutes > 0 ? (
                  <span className="text-[#00ff66]">{day.actualMinutes}m</span>
                ) : day.plannedMinutes > 0 ? (
                  <span className="text-[#ffd700]">{day.plannedMinutes}m</span>
                ) : (
                  <span>-</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] font-silkscreen text-[#8a80a6] pt-1 border-t border-[#231d38]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#553b8a] inline-block border border-black" /> Target Rencana
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#00ff66] inline-block border border-black" /> Fokus Tercapai
          </span>
        </div>
        <span className="italic text-[10px]">Klik hari apa saja untuk melihat atau menyusun jadwal</span>
      </div>
    </div>
  );
};
