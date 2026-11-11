import React, { useState } from 'react';
import { useGoalStore } from '../../store/useGoalStore';
import type { GoalPeriod } from '../../types/goal';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { getTodayDateString } from '../../utils/formatters';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPeriod?: GoalPeriod;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  defaultPeriod = 'daily',
}) => {
  const { identities, addGoal } = useGoalStore();

  const [form, setForm] = useState({
    title: '',
    period: defaultPeriod,
    identityId: identities[0]?.id || '',
    targetMinutes: 60,
    targetSessions: 2,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const todayStr = getTodayDateString();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const isDaily = form.period === 'daily';

    addGoal({
      title: form.title.trim(),
      period: form.period,
      identityId: form.identityId || (identities[0]?.id ?? 'default'),
      targetMinutes: isDaily ? form.targetMinutes : 0,
      targetSessions: isDaily ? form.targetSessions : 0,
      date: isDaily ? todayStr : undefined,
      month: form.period === 'monthly' ? currentMonth : undefined,
      year: form.period === 'annually' || form.period === 'monthly' ? currentYear : undefined,
      notes: form.notes.trim() || undefined,
    });

    setForm({
      title: '',
      period: defaultPeriod,
      identityId: identities[0]?.id || '',
      targetMinutes: 60,
      targetSessions: 2,
      notes: '',
    });
    onClose();
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🎯 Tambah Target Baru (Goal)" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Periode Target:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'monthly', 'annually'] as const).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm({ ...form, period: p })}
                className={`py-1.5 px-2 text-xs font-silkscreen uppercase border-2 cursor-pointer transition-all ${
                  form.period === p
                    ? 'bg-[#00f0ff] text-black border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#151224] text-[#9f97ba] border-[#2f274a]'
                }`}
              >
                {p === 'daily' ? 'Harian' : p === 'monthly' ? 'Bulanan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Judul Goal:
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Selesaikan 4 sesi microservices / 50 jam riset..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] font-medium focus:border-[#00f0ff] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Tautkan ke Identitas:
          </label>
          <select
            value={form.identityId}
            onChange={(e) => setForm({ ...form, identityId: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#00f0ff] font-silkscreen focus:border-[#00f0ff] outline-none cursor-pointer"
          >
            {identities.map((id) => (
              <option key={id.id} value={id.id}>
                {id.name}
              </option>
            ))}
          </select>
        </div>

        {form.period === 'daily' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
                Target (Menit):
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.targetMinutes}
                onChange={(e) =>
                  setForm({ ...form, targetMinutes: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#ffd700] font-pixel focus:border-[#ffd700] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
                Target (Sesi):
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.targetSessions}
                onChange={(e) =>
                  setForm({ ...form, targetSessions: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#ffd700] font-pixel focus:border-[#ffd700] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#110e1f] border-2 border-[#2f274c] space-y-1.5 text-xs font-silkscreen">
            <div className="text-[#ffd700] font-bold flex items-center gap-1.5">
              <span>🎯 Milestone {form.period === 'monthly' ? 'Bulanan' : 'Tahunan'}</span>
            </div>
            <p className="text-[11px] text-[#8e85aa] leading-relaxed">
              Target {form.period === 'monthly' ? 'bulanan' : 'tahunan'} adalah sasaran besar (milestone) tanpa batasan menit kaku. Alokasi waktu fokus akan kamu tentukan harian di <strong>Target Harian (Daily Quests)</strong>.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Catatan / Visi Motivasi (Opsional):
          </label>
          <textarea
            rows={2}
            placeholder="Kaitkan goal ini dengan gambaran besar kesuksesanmu..."
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
            Buat Goal
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};
