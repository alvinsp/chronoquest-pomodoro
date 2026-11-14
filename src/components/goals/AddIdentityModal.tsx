import React, { useState, useEffect } from 'react';
import { useGoalStore } from '../../store/useGoalStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import type { Identity } from '../../types/goal';

interface AddIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  identityToEdit?: Identity | null;
}

export const AddIdentityModal: React.FC<AddIdentityModalProps> = ({
  isOpen,
  onClose,
  identityToEdit,
}) => {
  const { addIdentity, updateIdentity } = useGoalStore();

  const [form, setForm] = useState({
    name: '',
    role: '',
    motto: '',
    color: '#00f0ff',
    icon: 'sparkles',
  });

  useEffect(() => {
    if (identityToEdit) {
      setForm({
        name: identityToEdit.name,
        role: identityToEdit.role,
        motto: identityToEdit.motto,
        color: identityToEdit.color,
        icon: identityToEdit.icon || 'sparkles',
      });
    } else {
      setForm({
        name: '',
        role: '',
        motto: '',
        color: '#00f0ff',
        icon: 'sparkles',
      });
    }
  }, [identityToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (identityToEdit) {
      updateIdentity(identityToEdit.id, {
        name: form.name.trim(),
        role: form.role.trim() || 'Focus Practitioner',
        motto: form.motto.trim() || 'Saya berkomitmen untuk tumbuh setiap hari melalui fokus terarah.',
        color: form.color,
        icon: form.icon,
      });
    } else {
      addIdentity({
        name: form.name.trim(),
        role: form.role.trim() || 'Focus Practitioner',
        motto: form.motto.trim() || 'Saya berkomitmen untuk tumbuh setiap hari melalui fokus terarah.',
        color: form.color,
        icon: form.icon,
      });
    }

    onClose();
  };

  const presetColors = ['#00f0ff', '#ff0055', '#ffd700', '#00ff66', '#b388ff', '#ff8800'];

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={identityToEdit ? "✏️ Edit Identitas Diri" : "✨ Tambah Identitas Diri Baru"}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Nama Identitas (Who do you want to be?):
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Senior Backend Engineer, Novelis Fantasi..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] font-medium focus:border-[#00f0ff] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Gelar / Peran:
          </label>
          <input
            type="text"
            placeholder="Contoh: Cloud Architect, Penulis Buku..."
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] focus:border-[#00f0ff] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1">
            Prinsip / Motto Afirmasi (Atomic Habits):
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Saya adalah tipe orang yang selalu menyelesaikan kode bersih dan terdokumentasi setiap hari."
            value={form.motto}
            onChange={(e) => setForm({ ...form, motto: e.target.value })}
            className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-sm text-[#f0edf6] focus:border-[#00f0ff] outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-silkscreen text-[#9f97ba] mb-1.5">
            Warna Identitas:
          </label>
          <div className="flex gap-2">
            {presetColors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 border-2 cursor-pointer transition-all ${
                  form.color === c ? 'scale-110 border-white' : 'border-black'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <PixelButton type="button" variant="retro-dark" size="sm" onClick={onClose}>
            Batal
          </PixelButton>
          <PixelButton type="submit" variant="primary" size="sm">
            {identityToEdit ? "Simpan Perubahan" : "Simpan Identitas"}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};

