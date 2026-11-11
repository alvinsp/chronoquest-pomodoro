import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundFx } from '../audio/synthAudio';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: NoteItem[];
  activeNoteId: string;

  addNote: (title?: string, content?: string) => string;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  setActiveNoteId: (id: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [
        {
          id: 'note-welcome',
          title: '📌 Catatan Fokus & Ide Petualangan',
          content: `Tulis apa saja di sini selama sesi fokus:
- Ide brilian yang tiba-tiba muncul
- To-do list & checklist langkah tugas
- Kode snippet atau catatan bug
- Refleksi pikiran agar otak tetap fokus dan tidak terdistraksi!

Semua catatan tersimpan otomatis secara offline di browsermu.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      activeNoteId: 'note-welcome',

      addNote: (title = 'Catatan Baru', content = '') => {
        soundFx.playCoin();
        const id = 'note-' + Date.now();
        const newNote: NoteItem = {
          id,
          title,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: id,
        }));

        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, updatedAt: new Date().toISOString() }
              : n
          ),
        }));
      },

      deleteNote: (id) => {
        soundFx.playClick();
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          return {
            notes: filtered,
            activeNoteId: state.activeNoteId === id ? (filtered[0]?.id || '') : state.activeNoteId,
          };
        });
      },

      setActiveNoteId: (id) => {
        soundFx.playClick();
        set({ activeNoteId: id });
      },
    }),
    {
      name: 'pixel-pomodoro-notes',
    }
  )
);
