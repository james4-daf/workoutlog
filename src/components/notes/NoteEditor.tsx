'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Note } from '@/src/actions/notes'
import { getNote, createNote, updateNote, deleteNote } from '@/src/actions/notes'
import { toDateInputValue, todayDateString } from './formatNoteDate'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'

type NoteEditorProps = {
  noteId: string | null
  folderId: string | null
  initialNote?: Note | null
  onClose: () => void
  onSaved: (note: Note) => void
  onDeleted: () => void
}

const SAVE_DEBOUNCE_MS = 800

export function NoteEditor({
  noteId,
  folderId,
  initialNote,
  onClose,
  onSaved,
  onDeleted,
}: NoteEditorProps) {
  const [note, setNote] = useState<Note | null>(initialNote ?? null)
  const [loading, setLoading] = useState(!!noteId && !initialNote)
  const [title, setTitle] = useState(initialNote?.title ?? '')
  const [body, setBody] = useState(initialNote?.body ?? '')
  const [noteDate, setNoteDate] = useState(
    initialNote
      ? toDateInputValue(initialNote.note_date ?? initialNote.updated_at)
      : noteId
        ? ''
        : todayDateString()
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const lastSavedRef = useRef<string | null>(null)
  const prevNoteIdRef = useRef<string | null | undefined>(undefined)
  const persistRef = useRef<(p: { title: string; body: string; note_date: string | null }) => Promise<void>>(() => Promise.resolve())

  const persist = useCallback(
    async (payload: { title: string; body: string; note_date: string | null }) => {
      if (noteId) {
        setSaving(true)
        const result = await updateNote(noteId, payload)
        setSaving(false)
        if (!result.error && note) {
          setNote((prev) => (prev ? { ...prev, ...payload, updated_at: new Date().toISOString() } : null))
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
  persistRef.current = persist

  // Load note data — use initialNote when available, fetch as fallback
  useEffect(() => {
    // Guard: don't re-run if noteId hasn't actually changed
    if (prevNoteIdRef.current === noteId) return
    prevNoteIdRef.current = noteId

    if (noteId) {
      if (initialNote && initialNote.id === noteId) {
        // Data already in memory — use it directly
        setNote(initialNote)
        setTitle(initialNote.title)
        setBody(initialNote.body)
        setNoteDate(toDateInputValue(initialNote.note_date ?? initialNote.updated_at))
        setLoading(false)
        lastSavedRef.current = null
      } else {
        // Fallback: fetch from server (e.g. deep-link with note not in cache)
        setLoading(true)
        getNote(noteId).then((n) => {
          setLoading(false)
          if (n) {
            setNote(n)
            setTitle(n.title)
            setBody(n.body)
            setNoteDate(toDateInputValue(n.note_date ?? n.updated_at))
            lastSavedRef.current = null
          }
        })
      }
    } else {
      setNote(null)
      setTitle('')
      setBody('')
      setNoteDate(todayDateString())
      lastSavedRef.current = null
    }
  }, [noteId, initialNote])

  // Auto-save debounce
  useEffect(() => {
    const payload = {
      title: title.trim(),
      body: body.trim(),
      note_date: noteDate.trim() || null,
    }
    const payloadKey = JSON.stringify(payload)
    if (lastSavedRef.current === payloadKey) return

    const t = setTimeout(() => {
      if (noteId) {
        lastSavedRef.current = payloadKey
        persistRef.current(payload)
      } else if (payload.title || payload.body) {
        lastSavedRef.current = payloadKey
        persistRef.current(payload)
      }
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [title, body, noteDate, noteId])

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
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="-ml-1 flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-2 text-foreground hover:bg-surface-hover md:min-w-[44px] md:justify-center"
          aria-label="Back to notes"
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium md:hidden">Back to notes</span>
        </button>
        <div className="min-w-0 flex-1" />
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
