import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Trash2,
  Pencil,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useGoalStore } from '../../store/useGoalStore';
import { useStatsStore } from '../../store/useStatsStore';
import { useTimerStore } from '../../store/useTimerStore';
import type { PlannedTask } from '../../types/planner';
import { formatDatePretty, formatMinutes, getEffectiveDateString, getTodayDateString } from '../../utils/formatters';
import { PixelButton } from '../ui/PixelButton';
import { AddPlannedTaskModal } from './AddPlannedTaskModal';

interface DayPlannerDetailProps {
  onLaunchTimer?: () => void;
}

export const DayPlannerDetail: React.FC<DayPlannerDetailProps> = ({ onLaunchTimer }) => {
  const { selectedDate, tasks, toggleTaskComplete, deleteTask } = usePlannerStore();
  const { identities } = useGoalStore();
  const { sessions } = useStatsStore();
  const { setTaskTitle, setActiveIdentityId: setTimerIdentityId } = useTimerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlannedTask | null>(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;
  const isFuture = selectedDate > todayStr;

  // Filter planned tasks for selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedTasks = dayTasks.filter((t) => t.completed);
  const totalPlannedMinutes = dayTasks.reduce((acc, t) => acc + (t.targetMinutes || 0), 0);

  // Filter actual focus sessions for selected date
  const daySessions = sessions.filter((s) => {
    const sDate = s.timestamp ? getEffectiveDateString(s.timestamp) : s.dateStr;
    return sDate === selectedDate && s.mode === 'focus';
  });
  const totalActualMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

  const handleLaunchToTimer = (task: PlannedTask) => {
    setTaskTitle(task.title);
    if (task.identityId) {
      setTimerIdentityId(task.identityId);
    }
    if (onLaunchTimer) {
      onLaunchTimer();
    }
  };

  const priorityStyles = {
    high: 'text-[#ff0055] border-[#ff0055] bg-[#ff0055]/10',
    medium: 'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10',
    low: 'text-[#00f0ff] border-[#00f0ff] bg-[#00f0ff]/10',
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5 space-y-5">
      {/* Date Header & Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#2b2545]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#00f0ff]" />
            <h3 className="font-silkscreen text-sm sm:text-base font-bold text-[#f0edf6]">
              {formatDatePretty(selectedDate)}
            </h3>
            {isToday ? (
              <span className="text-[9px] font-pixel px-2 py-0.5 bg-[#00f0ff] text-black border border-black font-bold">
                HARI INI
              </span>
            ) : isFuture ? (
              <span className="text-[9px] font-pixel px-2 py-0.5 bg-[#b388ff]/20 text-[#b388ff] border border-[#b388ff]">
                MENDATANG
              </span>
            ) : (
              <span className="text-[9px] font-pixel px-2 py-0.5 bg-[#3b335c] text-[#9f97ba] border border-black">
                TERLEWAT
              </span>
            )}
          </div>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            Daftar rencana sesi fokus dan pencapaian aktual pada tanggal ini.
          </p>
        </div>

        <PixelButton
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={14} />
          <span>+ Rencana Baru</span>
        </PixelButton>
      </div>

      {/* Day Overview Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#110e1f] p-3 border-2 border-[#2b2545]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e1738] border-2 border-[#00f0ff] flex items-center justify-center shrink-0">
            <Clock size={20} className="text-[#00f0ff]" />
          </div>
          <div>
            <span className="text-[10px] font-pixel text-[#9f97ba] uppercase block">
              Direncanakan Hari Ini:
            </span>
            <div className="font-silkscreen text-sm font-bold text-[#f0edf6]">
              {formatMinutes(totalPlannedMinutes)}{' '}
              <span className="text-xs text-[#7e769d]">({dayTasks.length} sesi)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#18241d] border-2 border-[#00ff66] flex items-center justify-center shrink-0">
            <Flame size={20} className="text-[#00ff66]" />
          </div>
          <div>
            <span className="text-[10px] font-pixel text-[#9f97ba] uppercase block">
              Fokus Aktual Tercapai:
            </span>
            <div className="font-silkscreen text-sm font-bold text-[#00ff66]">
              {formatMinutes(totalActualMinutes)}{' '}
              <span className="text-xs text-[#7e769d]">({daySessions.length} sesi selesai)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-silkscreen text-xs sm:text-sm font-bold text-[#f0edf6] flex items-center gap-1.5 uppercase">
            <Zap size={14} className="text-[#ffd700]" />
            Rencana Sesi Fokus ({completedTasks.length}/{dayTasks.length})
          </h4>
          {dayTasks.length > 0 && (
            <span className="text-[10px] font-pixel text-[#ffd700]">
              {Math.round((completedTasks.length / dayTasks.length) * 100)}% SELESAI
            </span>
          )}
        </div>

        {dayTasks.length === 0 ? (
          <div className="p-6 text-center bg-[#130f21] border-2 border-dashed border-[#2f274a]">
            <p className="text-xs font-silkscreen text-[#9f97ba]">
              Belum ada rencana fokus untuk tanggal ini.
            </p>
            <p className="text-[11px] text-[#6d648b] mt-1">
              Klik "+ Rencana Baru" untuk menjadwalkan sesi belajar atau coding!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map((task) => {
              const identity = getIdentity(task.identityId);

              return (
                <div
                  key={task.id}
                  className={`p-3 border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-[#15241b] border-[#00ff66]/60 opacity-80'
                      : 'bg-[#141024] border-[#362e54] hover:border-[#4d4277]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 flex items-center justify-center border cursor-pointer shrink-0 mt-0.5 transition-all ${
                        task.completed
                          ? 'bg-[#00ff66] text-black border-black shadow-[1px_1px_0px_#000]'
                          : 'bg-[#0d0b17] text-transparent border-[#3b335c] hover:border-[#00ff66]'
                      }`}
                      title={task.completed ? 'Tandai belum selesai' : 'Tandai selesai (+15 XP, +3 Gold)'}
                    >
                      <CheckCircle2 size={13} className={task.completed ? 'text-black' : 'opacity-0'} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {identity && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] font-pixel border border-black"
                            style={{
                              backgroundColor: `${identity.color}22`,
                              color: identity.color,
                              borderColor: identity.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 inline-block"
                              style={{ backgroundColor: identity.color }}
                            />
                            {identity.name}
                          </span>
                        )}

                        {task.timeSlot && (
                          <span className="text-[9px] font-pixel px-1.5 py-0.2 bg-[#1b1730] text-[#00f0ff] border border-[#3b335c]">
                            ⏰ {task.timeSlot}
                          </span>
                        )}

                        <span
                          className={`text-[9px] font-pixel uppercase px-1.5 py-0.2 border ${
                            priorityStyles[task.priority]
                          }`}
                        >
                          {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                        </span>
                      </div>

                      <h5
                        className={`font-silkscreen text-xs font-bold truncate leading-snug ${
                          task.completed ? 'line-through text-[#796f94]' : 'text-[#f0edf6]'
                        }`}
                      >
                        {task.title}
                      </h5>

                      {task.notes && (
                        <p className="text-[11px] text-[#938ba8] mt-0.5 truncate">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Target info */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-silkscreen text-[#ffd700] px-2 py-0.5 bg-[#120f20] border border-[#2e264a]">
                      {task.targetMinutes}m
                    </span>

                    {/* Quick launch to Timer (Available for all or today's tasks) */}
                    <button
                      type="button"
                      onClick={() => handleLaunchToTimer(task)}
                      className="px-2.5 py-1 bg-[#00f0ff]/10 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-black border border-[#00f0ff] text-[10px] font-silkscreen cursor-pointer flex items-center gap-1 transition-all"
                      title="Muat tugas ini langsung ke Pomodoro Timer"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Fokus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-[#786e96] hover:text-[#00f0ff] border border-[#342c52] hover:border-[#00f0ff] cursor-pointer"
                      title="Edit rencana"
                    >
                      <Pencil size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-[#786e96] hover:text-[#ff0055] border border-[#342c52] hover:border-[#ff0055] cursor-pointer"
                      title="Hapus rencana"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actual Focus History on this date */}
      <div className="pt-3 border-t border-[#261f3d] space-y-2">
        <h4 className="font-silkscreen text-xs font-bold text-[#9f97ba] uppercase flex items-center gap-1.5">
          <Award size={13} className="text-[#00ff66]" />
          Sesi Fokus yang Berhasil Diselesaikan pada Tanggal Ini ({daySessions.length})
        </h4>

        {daySessions.length === 0 ? (
          <p className="text-[11px] text-[#6d648b] font-silkscreen italic py-1">
            Belum ada sesi fokus yang tercatat pada tanggal ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {daySessions.map((s) => {
              const idn = getIdentity(s.identityId);
              const timeStr = s.timestamp
                ? new Date(s.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={s.id}
                  className="p-2 bg-[#120f20] border border-[#2b2545] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-silkscreen text-[#f0edf6] font-bold block truncate">
                      {s.taskTitle || 'Sesi Fokus Deep Work'}
                    </span>
                    <span className="text-[10px] text-[#8e85aa] flex items-center gap-1.5 mt-0.5">
                      {idn && (
                        <span style={{ color: idn.color }}>{idn.name}</span>
                      )}
                      {timeStr && <span>• Pukul {timeStr}</span>}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[#00ff66] font-silkscreen font-bold block">
                      +{s.durationMinutes}m
                    </span>
                    <span className="text-[10px] font-pixel text-[#ffd700]">
                      +{s.xpEarned} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddPlannedTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        defaultDate={selectedDate}
        taskToEdit={editingTask}
      />
    </div>
  );
};
