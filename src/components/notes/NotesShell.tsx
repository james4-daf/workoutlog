'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Note, NoteFolder } from '@/src/actions/notes'
import { getFolders, getNotes } from '@/src/actions/notes'
import { NotesSidebar } from './NotesSidebar'
import { NotesList } from './NotesList'
import { NoteEditor } from './NoteEditor'

const NEW_NOTE_ID = 'new'

export function NotesShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folder')
  const noteId = searchParams.get('note')

  const [folders, setFolders] = useState<NoteFolder[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const currentFolderId = folderId === '' || folderId === undefined ? null : folderId
  const effectiveNoteId = noteId === '' || noteId === undefined ? null : noteId
  const isNewNote = effectiveNoteId === NEW_NOTE_ID

  const setUrl = useCallback(
    (params: { folder?: string | null; note?: string | null }) => {
      const p = new URLSearchParams(searchParams.toString())
      if (params.folder !== undefined) {
        if (params.folder == null) p.delete('folder')
        else p.set('folder', params.folder)
      }
      if (params.note !== undefined) {
        if (params.note == null) p.delete('note')
        else p.set('note', params.note)
      }
      router.replace(`/notes?${p.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getFolders(), getNotes(currentFolderId)]).then(([f, n]) => {
      if (!cancelled) {
        setFolders(f)
        setNotes(n)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [currentFolderId])

  const handleSelectFolder = useCallback(
    (id: string | null) => {
      setUrl({ folder: id, note: null })
    },
    [setUrl]
  )

  const handleSelectNote = useCallback(
    (id: string) => {
      setUrl({ folder: currentFolderId, note: id })
    },
    [setUrl, currentFolderId]
  )

  const handleNewNote = useCallback(() => {
    setUrl({ folder: currentFolderId, note: NEW_NOTE_ID })
  }, [setUrl, currentFolderId])

  const handleFolderCreated = useCallback((folder: NoteFolder) => {
    setFolders((prev) => [...prev, folder].sort((a, b) => a.sort_order - b.sort_order))
  }, [])

  const handleCloseEditor = useCallback(() => {
    setUrl({ note: null })
  }, [setUrl])

  const handleNoteSaved = useCallback(
    (note: Note) => {
      if (isNewNote && note.id) {
        setUrl({ folder: note.folder_id ?? currentFolderId, note: note.id })
      }
      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === note.id)
        const next = [...prev]
        if (idx >= 0) next[idx] = note
        else next.unshift(note)
        return next
      })
    },
    [isNewNote, currentFolderId, setUrl]
  )

  const handleNoteDeleted = useCallback(() => {
    setNotes((prev) => prev.filter((n) => n.id !== effectiveNoteId))
    setUrl({ note: null })
  }, [effectiveNoteId, setUrl])

  const showEditor = effectiveNoteId !== null
  const editorNoteId = isNewNote ? null : effectiveNoteId

  return (
    <div className="relative flex h-[calc(100vh-theme(spacing.14))] min-h-[400px]">
      {/* Mobile: list view (sidebar + notes list) full screen when no note open */}
      <div
        className={`flex flex-col md:flex-row md:min-w-0 flex-1 ${showEditor ? 'hidden md:flex' : ''}`}
      >
        <NotesSidebar
          folders={folders}
          currentFolderId={currentFolderId}
          onSelectFolder={handleSelectFolder}
          onNewNote={handleNewNote}
          onFolderCreated={handleFolderCreated}
        />
        <div className="flex min-w-0 flex-1 flex-col border-r border-border bg-surface-alt">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-bold text-foreground">
              {currentFolderId
                ? folders.find((f) => f.id === currentFolderId)?.name ?? 'Notes'
                : 'All Notes'}
            </h2>
          </div>
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <NotesList
              notes={notes}
              currentFolderId={currentFolderId}
              selectedNoteId={effectiveNoteId}
              onSelectNote={handleSelectNote}
            />
          )}
        </div>
      </div>

      {/* Mobile: note editor full screen when note open; desktop: same row */}
      {showEditor && (
        <div className="absolute inset-0 flex flex-col bg-surface md:static md:min-w-0 md:flex-1 md:border-r md:border-border">
          <NoteEditor
            noteId={editorNoteId}
            folderId={currentFolderId}
            onClose={handleCloseEditor}
            onSaved={handleNoteSaved}
            onDeleted={handleNoteDeleted}
          />
        </div>
      )}
    </div>
  )
}
