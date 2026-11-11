import React, { useState } from 'react';
import { History, Download, Upload, Zap, Coins, Clock } from 'lucide-react';
import { useStatsStore } from '../../store/useStatsStore';
import { useGoalStore } from '../../store/useGoalStore';
import { formatDatePretty, formatMinutes } from '../../utils/formatters';
import { PixelButton } from '../ui/PixelButton';

export const SessionHistory: React.FC = () => {
  const { sessions, exportDataJson, importDataJson } = useStatsStore();
  const { identities } = useGoalStore();
  const [filterIdentity, setFilterIdentity] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    if (filterIdentity === 'all') return true;
    return s.identityId === filterIdentity;
  });

  const getIdentity = (id: string) => identities.find((i) => i.id === id);

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
            Catatan setiap ekspedisi fokusmu beserta reward EXP dan Gold.
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
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-xs font-silkscreen text-[#786f94]">
            Belum ada riwayat sesi yang tercatat.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const identity = getIdentity(session.identityId);
            return (
              <div
                key={session.id}
                className="p-3 bg-[#130f21] border-2 border-[#2b2447] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {identity && (
                      <span
                        className="text-[10px] font-pixel px-1.5 py-0.5 border border-black"
                        style={{
                          backgroundColor: `${identity.color}20`,
                          color: identity.color,
                        }}
                      >
                        {identity.name}
                      </span>
                    )}
                    <span className="text-[10px] text-[#7d759b] font-silkscreen">
                      {formatDatePretty(session.dateStr)}
                    </span>
                  </div>
                  <div className="font-silkscreen text-[#f0edf6] font-bold text-xs sm:text-sm">
                    {session.taskTitle}
                  </div>
                </div>

                {/* Duration & Rewards */}
                <div className="flex items-center gap-3 shrink-0">
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

