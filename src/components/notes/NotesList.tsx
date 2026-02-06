'use client'

import type { Note } from '@/src/actions/notes'
import { formatNoteDate } from './formatNoteDate'

type NotesListProps = {
  notes: Note[]
  currentFolderId: string | null
  selectedNoteId: string | null
  onSelectNote: (noteId: string) => void
}

export function NotesList({
  notes,
  currentFolderId,
  selectedNoteId,
  onSelectNote,
}: NotesListProps) {
  const displayDate = (note: Note) => {
    if (note.note_date) return formatNoteDate(note.note_date)
    return formatNoteDate(note.updated_at)
  }

  const preview = (body: string, maxLen: number) => {
    const t = (body ?? '').trim().replace(/\s+/g, ' ')
    if (t.length <= maxLen) return t
    return t.slice(0, maxLen) + '…'
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {notes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-muted">
          <p className="text-sm">No notes yet. Create one to get started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onSelectNote(note.id)}
                className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
                  selectedNoteId === note.id ? 'bg-accent-muted' : ''
                }`}
              >
                <span className="font-medium text-foreground line-clamp-1">
                  {note.title || 'Untitled'}
                </span>
                <span className="text-xs text-muted line-clamp-1">
                  {preview(note.body, 60)}
                </span>
                <span className="text-xs text-dim">{displayDate(note)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
