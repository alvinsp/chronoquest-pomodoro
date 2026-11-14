import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Quote, CheckCircle, Pencil } from 'lucide-react';
import { useGoalStore } from '../../store/useGoalStore';
import { PixelButton } from '../ui/PixelButton';
import { AddIdentityModal } from './AddIdentityModal';
import type { Identity } from '../../types/goal';

export const IdentityManager: React.FC = () => {
  const { identities, activeIdentityId, setActiveIdentityId, deleteIdentity } = useGoalStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#00f0ff]" />
            Daftar Identitas Diri (Atomic Identity)
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            "Every action you take is a vote for the type of person you wish to become." — James Clear
          </p>
        </div>

        <PixelButton
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingIdentity(null);
            setIsAddOpen(true);
          }}
        >
          <Plus size={14} />
          <span>Tambah Identitas</span>
        </PixelButton>
      </div>

      {/* Identities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {identities.map((id) => {
          const isActive = id.id === activeIdentityId;
          return (
            <div
              key={id.id}
              className={`p-4 border-2 transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-[#1e1738] border-[#00f0ff] shadow-[3px_3px_0px_#000]'
                  : 'bg-[#151224] border-[#2f274a] hover:border-[#4b3f73]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 border border-black shadow-[1px_1px_0px_#000]"
                      style={{ backgroundColor: id.color }}
                    />
                    <h4 className="font-silkscreen text-xs font-bold text-[#f0edf6]">{id.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIdentity(id)}
                      className="text-[#6d648b] hover:text-[#00f0ff] p-1 cursor-pointer transition-colors"
                      title="Edit identitas ini"
                    >
                      <Pencil size={13} />
                    </button>
                    {identities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteIdentity(id.id)}
                        className="text-[#6d648b] hover:text-[#ff3b30] p-1 cursor-pointer transition-colors"
                        title="Hapus identitas"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-pixel text-[#00f0ff] mb-2">{id.role}</div>

                <div className="bg-[#0f0d1a] border border-[#2c2547] p-2.5 text-xs text-[#b8b0cf] italic flex items-start gap-1.5">
                  <Quote size={12} className="text-[#ffd700] shrink-0 mt-0.5" />
                  <span className="leading-snug">"{id.motto}"</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#2b2545] flex items-center justify-between">
                {isActive ? (
                  <span className="text-[10px] font-pixel text-[#00ff66] flex items-center gap-1">
                    <CheckCircle size={12} /> AKTIF DI SESI
                  </span>
                ) : (
                  <PixelButton
                    variant="retro-dark"
                    size="sm"
                    onClick={() => setActiveIdentityId(id.id)}
                    className="w-full text-[11px] py-1"
                  >
                    Pilih Identitas Ini
                  </PixelButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddIdentityModal
        isOpen={isAddOpen || Boolean(editingIdentity)}
        identityToEdit={editingIdentity}
        onClose={() => {
          setIsAddOpen(false);
          setEditingIdentity(null);
        }}
      />
    </div>
  );
};

