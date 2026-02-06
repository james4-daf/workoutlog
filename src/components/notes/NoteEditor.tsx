'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Note } from '@/src/actions/notes'
import { getNote, createNote, updateNote, deleteNote } from '@/src/actions/notes'
import { toDateInputValue, todayDateString } from './formatNoteDate'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'

type NoteEditorProps = {
  noteId: string | null
  folderId: string | null
  onClose: () => void
  onSaved: (note: Note) => void
  onDeleted: () => void
}

const SAVE_DEBOUNCE_MS = 800

export function NoteEditor({
  noteId,
  folderId,
  onClose,
  onSaved,
  onDeleted,
}: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(!!noteId)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [noteDate, setNoteDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const saveTimeoutRef = useState<ReturnType<typeof setTimeout> | null>(null)[0]

  const persist = useCallback(
    async (payload: { title: string; body: string; note_date: string | null }) => {
      if (noteId) {
        setSaving(true)
        const result = await updateNote(noteId, payload)
        setSaving(false)
        if (!result.error && note) {
          setNote({ ...note, ...payload, updated_at: new Date().toISOString() })
          onSaved({ ...note, ...payload, updated_at: new Date().toISOString() })
        }
      } else {
        setSaving(true)
        const result = await createNote({
          folder_id: folderId,
          title: payload.title,
          body: payload.body,
          note_date: payload.note_date || null,
        })
        setSaving(false)
        if (!result.error && result.note) {
          setNote(result.note)
          onSaved(result.note)
        }
      }
    },
    [noteId, folderId, note, onSaved]
  )

  useEffect(() => {
    if (noteId) {
      setLoading(true)
      getNote(noteId).then((n) => {
        setLoading(false)
        if (n) {
          setNote(n)
          setTitle(n.title)
          setBody(n.body)
          setNoteDate(toDateInputValue(n.note_date ?? n.updated_at))
        }
      })
    } else {
      setNote(null)
      setTitle('')
      setBody('')
      setNoteDate(todayDateString())
    }
  }, [noteId])

  useEffect(() => {
    const payload = {
      title: title.trim(),
      body: body.trim(),
      note_date: noteDate.trim() || null,
    }
    const t = setTimeout(() => {
      if (noteId) {
        persist(payload)
      } else if (payload.title || payload.body) {
        persist(payload)
      }
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [title, body, noteDate, noteId, persist])

  const handleDelete = async () => {
    if (!noteId || deleting) return
    if (!confirm('Delete this note?')) return
    setDeleting(true)
    const result = await deleteNote(noteId)
    setDeleting(false)
    if (!result.error) onDeleted()
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        {saving && (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        )}
        {noteId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-dim hover:bg-danger-muted hover:text-danger disabled:opacity-50"
            aria-label="Delete note"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        )}
      </header>
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mb-2 w-full border-0 bg-transparent font-display text-xl font-bold text-foreground placeholder:text-dim focus:outline-none"
        />
        <input
          type="date"
          value={noteDate}
          onChange={(e) => setNoteDate(e.target.value)}
          className="mb-4 w-fit rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing…"
          className="min-h-[200px] w-full flex-1 resize-none border-0 bg-transparent text-foreground placeholder:text-dim focus:outline-none"
          rows={10}
        />
      </div>
    </div>
  )
}
