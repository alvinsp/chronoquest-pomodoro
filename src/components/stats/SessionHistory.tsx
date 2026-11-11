import React, { useState } from 'react';
import { History, Download, Upload, Zap, Coins, Clock, Edit2, Check, X, Trash2, Wand2, Target } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { useGoalStore } from '../../store/useGoalStore';
import { formatDatePretty, formatMinutes } from '../../utils/formatters';
import { PixelButton } from '../ui/PixelButton';

export const SessionHistory: React.FC = () => {
  const { sessions, updateSessionTitle, deleteSession, renameUntitledSessions, exportDataJson, importDataJson } = useStatsStore();
  const { identities, goals } = useGoalStore();
  const [filterIdentity, setFilterIdentity] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const filteredSessions = sessions.filter((s) => {
    if (filterIdentity === 'all') return true;
    return s.identityId === filterIdentity;
  });

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

  const untitledSessionsCount = sessions.filter(
    (s) => !s.taskTitle || s.taskTitle.toLowerCase().includes('tanpa judul') || s.taskTitle.trim() === ''
  ).length;

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      updateSessionTitle(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleAutoFixUntitled = () => {
    renameUntitledSessions('Sesi Deep Work');
  };

  const handleExport = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-pomodoro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert('Data berhasil di-restore!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-silkscreen text-sm font-bold text-[#f0edf6] uppercase flex items-center gap-1.5">
            <History size={16} className="text-[#00f0ff]" />
            Log Riwayat Sesi (Adventure Chronicle)
          </h3>
          <p className="text-xs text-[#9f97ba] mt-0.5">
            Catatan setiap ekspedisi fokusmu. Klik ikon pensil ✏️ untuk mengubah judul sesi.
          </p>
        </div>

        {/* Export / Import Data */}
        <div className="flex items-center gap-2">
          <PixelButton variant="retro-dark" size="sm" onClick={handleExport} title="Download data cadangan JSON">
            <Download size={13} />
            <span>Ekspor</span>
          </PixelButton>

          <label className="cursor-pointer inline-flex items-center">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <span className="pixel-btn inline-flex items-center justify-center font-bold tracking-wider uppercase bg-[#211c38] text-[#f0edf6] border-2 border-black hover:bg-[#2c264a] text-xs px-2.5 py-1.5 font-silkscreen gap-1.5">
              <Upload size={13} />
              <span>Impor</span>
            </span>
          </label>
        </div>
      </div>

      {/* Auto fix banner if there are untitled sessions */}
      {untitledSessionsCount > 0 && (
        <div className="mb-3 p-3 bg-[#241a05] border-2 border-[#ffd700] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <span className="text-[#ffd700] font-silkscreen">
            ⚠️ Terdapat {untitledSessionsCount} sesi berlabel "Fokus Tanpa Judul".
          </span>
          <button
            onClick={handleAutoFixUntitled}
            className="px-2.5 py-1 bg-[#ffd700] text-black font-silkscreen text-[11px] font-bold border border-black hover:bg-[#ffe033] cursor-pointer flex items-center gap-1 shadow-[1px_1px_0px_#000]"
          >
            <Wand2 size={12} />
            <span>Beri Judul Otomatis Semua</span>
          </button>
        </div>
      )}

      {/* Filter by identity */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs font-silkscreen">
        <span className="text-[#7d759b]">Filter:</span>
        <button
          onClick={() => setFilterIdentity('all')}
          className={`px-2.5 py-1 border cursor-pointer ${
            filterIdentity === 'all'
              ? 'bg-[#00f0ff] text-black border-black font-bold'
              : 'bg-[#120f20] text-[#9f97ba] border-[#2c2547]'
          }`}
        >
          Semua ({sessions.length})
        </button>
        {identities.map((id) => (
          <button
            key={id.id}
            onClick={() => setFilterIdentity(id.id)}
            className={`px-2.5 py-1 border cursor-pointer flex items-center gap-1.5 ${
              filterIdentity === id.id
                ? 'bg-[#00f0ff] text-black border-black font-bold'
                : 'bg-[#120f20] text-[#9f97ba] border-[#2c2547]'
            }`}
          >
            <span className="w-2 h-2 inline-block" style={{ backgroundColor: id.color }} />
            <span>{id.name}</span>
          </button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs font-silkscreen text-[#786f94]">
            Belum ada riwayat sesi yang tercatat.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const identity = getIdentity(session.identityId);
            const isEditing = editingId === session.id;
            const isUntitled =
              !session.taskTitle ||
              session.taskTitle.toLowerCase().includes('tanpa judul') ||
              session.taskTitle.trim() === '';

            return (
              <div
                key={session.id}
                className={`p-3 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all ${
                  isUntitled
                    ? 'bg-[#1b1524] border-[#ffd700]/70'
                    : 'bg-[#130f21] border-[#2b2447]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {identity && (
                      <span
                        className="text-[10px] font-pixel px-1.5 py-0.5 border border-black flex items-center gap-1"
                        style={{
                          backgroundColor: `${identity.color}20`,
                          color: identity.color,
                        }}
                      >
                        <span className="w-1.5 h-1.5 inline-block" style={{ backgroundColor: identity.color }} />
                        {identity.name}
                      </span>
                    )}

                    {/* Goal Connection Badge */}
                    {session.goalTitle && (
                      <span className="text-[10px] font-silkscreen px-1.5 py-0.5 bg-[#0e2229] border border-[#00f0ff] text-[#00f0ff] flex items-center gap-1">
                        <Target size={10} className="text-[#00f0ff]" />
                        <span>Target: {session.goalTitle}</span>
                      </span>
                    )}

                    <span className="text-[10px] text-[#7d759b] font-silkscreen">
                      {formatDatePretty(session.dateStr)}
                    </span>
                    {isUntitled && (
                      <span className="text-[9px] font-pixel px-1.5 py-0.2 bg-[#332205] text-[#ffd700] border border-[#ffd700]">
                        BELUM DIBERI JUDUL
                      </span>
                    )}
                  </div>

                  {/* Title or Editable Input */}
                  {isEditing ? (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          placeholder="Masukkan judul sesi..."
                          className="bg-[#09080e] border border-[#00f0ff] px-2 py-1 text-xs text-[#00f0ff] font-bold outline-none flex-1 font-silkscreen"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(session.id)}
                          className="p-1 bg-[#00ff66] text-black border border-black hover:bg-[#25f07a] cursor-pointer"
                          title="Simpan Judul"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-[#211c38] text-white border border-black hover:bg-[#ff3b30] cursor-pointer"
                          title="Batal"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Quick goal title picker when editing */}
                      {goals.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-[#8e85aa]">
                          <span>Pilih dari Target:</span>
                          {goals.slice(0, 3).map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setEditingTitle(g.title)}
                              className="px-1.5 py-0.5 bg-[#171328] hover:bg-[#251e40] text-[#00f0ff] border border-[#393059] cursor-pointer truncate max-w-[200px]"
                              title={g.title}
                            >
                              {g.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span
                        className={`font-silkscreen font-bold text-xs sm:text-sm truncate ${
                          isUntitled ? 'text-[#ffd700] italic' : 'text-[#f0edf6]'
                        }`}
                      >
                        {session.taskTitle || 'Fokus Tanpa Judul'}
                      </span>
                      <button
                        onClick={() => handleStartEdit(session.id, session.taskTitle)}
                        className="p-1 text-[#786f94] hover:text-[#00f0ff] transition-colors cursor-pointer"
                        title="Ubah judul sesi ini"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Hapus sesi ini dari riwayat?')) {
                            deleteSession(session.id);
                          }
                        }}
                        className="p-1 text-[#5b5375] hover:text-[#ff3b30] transition-colors cursor-pointer"
                        title="Hapus sesi ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration & Rewards */}
                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#2b2447]">
                  <div className="flex items-center gap-1 text-[#00f0ff] font-pixel text-xs">
                    <Clock size={12} />
                    <span>{formatMinutes(session.durationMinutes)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#e0aaff] font-pixel text-xs">
                    <Zap size={12} className="text-[#c77dff]" />
                    <span>+{session.xpEarned} XP</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#ffd700] font-pixel text-xs">
                    <Coins size={12} />
                    <span>+{session.goldEarned} G</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
