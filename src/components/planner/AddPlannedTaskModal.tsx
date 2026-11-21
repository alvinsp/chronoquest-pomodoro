import React, { useState, useEffect } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useGoalStore } from '../../store/useGoalStore';
import type { PlannedTask, PlanPriority } from '../../types/planner';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';

interface AddPlannedTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  taskToEdit?: PlannedTask | null;
}

export const AddPlannedTaskModal: React.FC<AddPlannedTaskModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  taskToEdit,
}) => {
  const { addTask, updateTask } = usePlannerStore();
  const { identities } = useGoalStore();

  const [form, setForm] = useState({
    title: '',
    date: defaultDate,
    targetMinutes: 50,
    identityId: identities[0]?.id || '',
    timeSlot: '09:00',
    priority: 'medium' as PlanPriority,
    notes: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      setForm({
        title: taskToEdit.title,
        date: taskToEdit.date,
        targetMinutes: taskToEdit.targetMinutes || 50,
        identityId: taskToEdit.identityId || (identities[0]?.id ?? ''),
        timeSlot: taskToEdit.timeSlot || '09:00',
        priority: taskToEdit.priority || 'medium',
        notes: taskToEdit.notes || '',
      });
    } else {
      setForm({
        title: '',
        date: defaultDate,
        targetMinutes: 50,
        identityId: identities[0]?.id || '',
        timeSlot: '09:00',
        priority: 'medium',
        notes: '',
      });
    }
  }, [taskToEdit, defaultDate, isOpen, identities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: form.title.trim(),
        date: form.date,
        targetMinutes: form.targetMinutes,
        identityId: form.identityId || (identities[0]?.id ?? 'id-dev'),
        timeSlot: form.timeSlot.trim() || undefined,
        priority: form.priority,
        notes: form.notes.trim() || undefined,
      });
    } else {
      addTask({
        title: form.title.trim(),
        date: form.date,
        targetMinutes: form.targetMinutes,
        identityId: form.identityId || (identities[0]?.id ?? 'id-dev'),
        timeSlot: form.timeSlot.trim() || undefined,
        priority: form.priority,
        notes: form.notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? '✏️ Edit Rencana Fokus' : '📅 Rencanakan Sesi Fokus Baru'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Tanggal Jadwal:
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-silkscreen focus:border-[#00f0ff] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Judul Sesi / Tugas Fokus:
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Koding Algoritma Search, Bedah Buku Bab 2..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] font-medium focus:border-[#00f0ff] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Target (Menit):
            </label>
            <input
              type="number"
              min={5}
              step={5}
              required
              value={form.targetMinutes}
              onChange={(e) =>
                setForm({ ...form, targetMinutes: parseInt(e.target.value) || 25 })
              }
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#ffd700] font-pixel focus:border-[#ffd700] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
              Jam Mulai (Opsional):
            </label>
            <input
              type="time"
              value={form.timeSlot}
              onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-pixel focus:border-[#00f0ff] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Tautkan ke Identitas Diri:
          </label>
          <select
            value={form.identityId}
            onChange={(e) => setForm({ ...form, identityId: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-silkscreen focus:border-[#00f0ff] outline-none cursor-pointer"
          >
            {identities.map((id) => (
              <option key={id.id} value={id.id}>
                {id.name} ({id.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Tingkat Prioritas:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm({ ...form, priority: p })}
                className={`py-1.5 px-2 text-xs font-silkscreen uppercase border-2 cursor-pointer transition-all ${
                  form.priority === p
                    ? p === 'high'
                      ? 'bg-[#ff0055] text-white border-white shadow-[2px_2px_0px_#000]'
                      : p === 'medium'
                      ? 'bg-[#ffd700] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#151224] text-[#9f97ba] border-[#2f274a]'
                }`}
              >
                {p === 'high' ? '🔥 Tinggi' : p === 'medium' ? '⚡ Sedang' : '🌱 Santai'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Catatan Tambahan (Opsional):
          </label>
          <textarea
            rows={2}
            placeholder="Agenda, sub-tujuan, atau checklist..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] focus:border-[#00f0ff] outline-none resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <PixelButton type="button" variant="retro-dark" size="sm" onClick={onClose}>
            Batal
          </PixelButton>
          <PixelButton type="submit" variant="primary" size="sm">
            {taskToEdit ? 'Simpan Perubahan' : 'Jadwalkan Sesi'}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};
