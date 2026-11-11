import React, { useState } from 'react';
import { FileText, Plus, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { PixelButton } from '../ui/PixelButton';

export const FocusNotesCard: React.FC = () => {
  const { notes, activeNoteId, addNote, updateNote, deleteNote, setActiveNoteId } = useNotesStore();
  const [copied, setCopied] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = activeNote?.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[#181528] pixel-border border-4 border-black p-4 sm:p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b-2 border-[#2b2545]">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#ffd700]" />
          <div>
            <h3 className="font-silkscreen text-xs sm:text-sm font-bold text-[#f0edf6] uppercase">
              Catatan Petualang (Focus Scratchpad)
            </h3>
            <p className="text-[11px] text-[#9f97ba]">
              Tulis ide, to-do list, catatan coding, atau apa saja selama sesi fokus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PixelButton
            variant="retro-dark"
            size="sm"
            onClick={handleCopy}
            title="Salin isi catatan ke clipboard"
          >
            {copied ? <Check size={13} className="text-[#00ff66]" /> : <Copy size={13} />}
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </PixelButton>

          <PixelButton
            variant="primary"
            size="sm"
            onClick={() => addNote('Catatan Baru ' + (notes.length + 1), '')}
          >
            <Plus size={13} />
            <span>Tambah Catatan</span>
          </PixelButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Note list sidebar */}
        <div className="space-y-1.5 md:border-r-2 md:border-[#2b2545] md:pr-3 max-h-56 overflow-y-auto">
          {notes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-2 border cursor-pointer text-xs font-silkscreen transition-all flex items-center justify-between gap-1 ${
                  isActive
                    ? 'bg-[#251a3d] border-[#00f0ff] text-[#f0edf6] font-bold shadow-[1px_1px_0px_#000]'
                    : 'bg-[#120f20] border-[#2b2447] text-[#9f97ba] hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{note.title || 'Tanpa Judul'}</span>
                {notes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-[#645c82] hover:text-[#ff3b30] p-0.5 cursor-pointer"
                    title="Hapus catatan"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Note Editor Area */}
        {activeNote ? (
          <div className="md:col-span-3 space-y-2">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
              placeholder="Judul Catatan..."
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] px-3 py-1.5 text-xs sm:text-sm font-silkscreen font-bold text-[#ffd700] outline-none focus:border-[#ffd700]"
            />

            <textarea
              rows={7}
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Tuliskan pemikiran, rencana tugas, snippet kode, atau ide apapun di sini..."
              className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-3 text-xs sm:text-sm text-[#f0edf6] font-mono leading-relaxed outline-none focus:border-[#00f0ff] resize-none"
            />

            <div className="flex items-center justify-between text-[11px] font-silkscreen text-[#786f94]">
              <span className="flex items-center gap-1 text-[#00ff66]">
                <Sparkles size={11} /> Tersimpan otomatis di browsermu
              </span>
              <span>{wordCount} kata • {activeNote.content.length} karakter</span>
            </div>
          </div>
        ) : (
          <div className="md:col-span-3 p-8 text-center text-xs font-silkscreen text-[#786f94]">
            Pilih catatan atau buat catatan baru.
          </div>
        )}
      </div>
    </div>
  );
};

