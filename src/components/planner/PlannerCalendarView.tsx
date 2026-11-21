import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useStatsStore } from '../../store/useStatsStore';
import { getEffectiveDateString, getTodayDateString } from '../../utils/formatters';

export const PlannerCalendarView: React.FC = () => {
  const { selectedDate, setSelectedDate, currentMonth, setCurrentMonth, tasks } = usePlannerStore();
  const { sessions } = useStatsStore();

  const todayStr = getTodayDateString();

  // Parse currentMonth "YYYY-MM"
  const [yearStr, monthStr] = currentMonth.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonthIdx = parseInt(monthStr, 10) - 1; // 0-based

  const monthDate = new Date(currentYear, currentMonthIdx, 1);
  const monthName = monthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const handlePrevMonth = () => {
    const prevDate = new Date(currentYear, currentMonthIdx - 1, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentYear, currentMonthIdx + 1, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${y}-${m}`);
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
    setCurrentMonth(todayStr.slice(0, 7));
  };

  // Build calendar matrix (Monday to Sunday)
  // First day of current month:
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1);
  // getDay: 0 = Sun, 1 = Mon ...
  const firstDayWeekday = firstDayOfMonth.getDay();
  // distance to Monday: if Sun (0) -> 6, else firstDayWeekday - 1
  const offsetDays = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;

  // Calendar starts on:
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - offsetDays);

  // We show 6 weeks (42 days) or 5 weeks (35 days)
  const totalDays = 35; // standard 5 weeks grid
  const calendarCells = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isCurrentMonth = d.getMonth() === currentMonthIdx;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;

    // Planned tasks for this day
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const plannedMinutes = dayTasks.reduce((acc, t) => acc + (t.targetMinutes || 0), 0);
    const tasksCount = dayTasks.length;
    const allCompleted = tasksCount > 0 && dayTasks.every((t) => t.completed);

    // Actual focus sessions for this day
    const daySessions = sessions.filter((s) => {
      const sDate = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
      return sDate === dateStr && s.mode === 'focus';
    });
    const actualMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth,
      isToday,
      isSelected,
      plannedMinutes,
      tasksCount,
      allCompleted,
      actualMinutes,
    };
  });

  const weekHeaders = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5 space-y-4">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#2b2545]">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-[#00f0ff]" />
          <h3 className="font-silkscreen text-sm sm:text-base font-bold text-[#f0edf6] uppercase">
            {monthName}
          </h3>
          <span className="text-[10px] font-pixel text-[#ffd700] px-2 py-0.5 bg-[#ffd700]/10 border border-[#ffd700]/30 hidden sm:inline">
            PIXEL CHRONO-CALENDAR
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1 text-xs font-silkscreen text-[#00f0ff] bg-[#120f20] border border-[#3b335c] hover:border-[#00f0ff] cursor-pointer transition-all mr-1"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 bg-[#120f20] text-[#9f97ba] hover:text-white border border-[#2b2545] hover:border-[#3b335c] cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 bg-[#120f20] text-[#9f97ba] hover:text-white border border-[#2b2545] hover:border-[#3b335c] cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week Day Labels Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-silkscreen text-[11px] text-[#7d749a] pb-1 border-b border-[#251f38]">
        {weekHeaders.map((dayName, idx) => (
          <div
            key={dayName}
            className={`py-1 ${idx >= 5 ? 'text-[#ff4d79]' : 'text-[#8e84aa]'}`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* 35/42 Days Matrix Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarCells.map((cell) => {
          return (
            <button
              key={cell.dateStr}
              type="button"
              onClick={() => setSelectedDate(cell.dateStr)}
              className={`min-h-[64px] sm:min-h-[76px] p-1.5 border-2 text-left cursor-pointer transition-all flex flex-col justify-between relative group ${
                cell.isSelected
                  ? 'bg-[#1f183b] border-[#00f0ff] shadow-[2px_2px_0px_#000] z-10 scale-[1.02]'
                  : cell.isToday
                  ? 'bg-[#0f2129] border-[#00f0ff]/80 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : cell.isCurrentMonth
                  ? 'bg-[#141024] border-[#292241] hover:border-[#4b3f73] hover:bg-[#1a1530]'
                  : 'bg-[#0e0c17]/60 border-[#1f1933] text-[#554e70] opacity-50'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`font-silkscreen text-xs font-bold leading-none ${
                    cell.isToday
                      ? 'text-[#00f0ff]'
                      : cell.isSelected
                      ? 'text-white'
                      : cell.isCurrentMonth
                      ? 'text-[#f0edf6]'
                      : 'text-[#635b80]'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* All completed trophy check */}
                {cell.allCompleted && (
                  <CheckCircle2 size={11} className="text-[#00ff66]" />
                )}
              </div>

              {/* Badges / Dots for Planned Tasks & Actual Focus */}
              <div className="space-y-0.5 mt-1 w-full">
                {/* Actual focus minutes indicator */}
                {cell.actualMinutes > 0 && (
                  <div
                    className="flex items-center gap-0.5 text-[9px] font-pixel px-1 py-0.2 bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 truncate"
                    title={`Fokus aktual: ${cell.actualMinutes} menit`}
                  >
                    <Flame size={8} className="shrink-0" />
                    <span>{cell.actualMinutes}m</span>
                  </div>
                )}

                {/* Planned tasks indicator */}
                {cell.tasksCount > 0 && (
                  <div
                    className={`flex items-center gap-0.5 text-[9px] font-pixel px-1 py-0.2 border truncate ${
                      cell.allCompleted
                        ? 'bg-[#21163b] text-[#b388ff] border-[#b388ff]/40'
                        : 'bg-[#291e17] text-[#ffd700] border-[#ffd700]/40'
                    }`}
                    title={`Rencana: ${cell.tasksCount} tugas (${cell.plannedMinutes}m)`}
                  >
                    <Clock size={8} className="shrink-0" />
                    <span>{cell.plannedMinutes}m ({cell.tasksCount})</span>
                  </div>
                )}
              </div>

              {/* Selected highlight line */}
              {cell.isSelected && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-silkscreen text-[#7e759b] pt-2 border-t border-[#231d38]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#00ff66]/20 border border-[#00ff66] inline-block" />
            <span>Fokus Selesai (Aktual)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#ffd700]/20 border border-[#ffd700] inline-block" />
            <span>Rencana Terjadwal</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#0f2129] border border-[#00f0ff] inline-block" />
            <span>Hari Ini</span>
          </span>
        </div>
        <span className="italic">Reset Harian: 07:00 WIB</span>
      </div>
    </div>
  );
};
