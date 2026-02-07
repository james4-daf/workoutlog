'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Note, NoteFolder } from '@/src/actions/notes'
import { NotesSidebar } from './NotesSidebar'
import { NotesList } from './NotesList'
import { NoteEditor } from './NoteEditor'

const NEW_NOTE_ID = 'new'
const CACHE_KEY = 'notes_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

type CachePayload = {
  ts: number
  notes: Note[]
  folders: NoteFolder[]
}

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeCache(notes: Note[], folders: NoteFolder[]) {
  try {
    const payload: CachePayload = { ts: Date.now(), notes, folders }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function NotesShell({
  initialFolders,
  initialNotes,
}: {
  initialFolders: NoteFolder[]
  initialNotes: Note[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folder')
  const noteId = searchParams.get('note')

  // Initialize from server props if available, otherwise fall back to cache
  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    if (initialFolders.length > 0) return initialFolders
    return readCache()?.folders ?? []
  })
  const [allNotes, setAllNotes] = useState<Note[]>(() => {
    if (initialNotes.length > 0) return initialNotes
    return readCache()?.notes ?? []
  })

  const currentFolderId = folderId === '' || folderId === undefined ? null : folderId
  const effectiveNoteId = noteId === '' || noteId === undefined ? null : noteId
  const isNewNote = effectiveNoteId === NEW_NOTE_ID

  // Sync from server props when they arrive (e.g. after hydration on return visit)
  useEffect(() => {
    if (initialNotes.length > 0) {
      setAllNotes(initialNotes)
    }
    if (initialFolders.length > 0) {
      setFolders(initialFolders)
    }
  }, [initialNotes, initialFolders])

  // Write to cache whenever notes or folders change
  useEffect(() => {
    writeCache(allNotes, folders)
  }, [allNotes, folders])

  // Filter notes client-side by current folder
  const filteredNotes = useMemo(() => {
    if (currentFolderId === null) return allNotes
    return allNotes.filter((n) => n.folder_id === currentFolderId)
  }, [allNotes, currentFolderId])

  // Find selected note from memory
  const editorNoteId = isNewNote ? null : effectiveNoteId
  const selectedNote = useMemo(() => {
    if (!editorNoteId) return null
    return allNotes.find((n) => n.id === editorNoteId) ?? null
  }, [allNotes, editorNoteId])

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
      setAllNotes((prev) => {
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
    setAllNotes((prev) => prev.filter((n) => n.id !== effectiveNoteId))
    setUrl({ note: null })
  }, [effectiveNoteId, setUrl])

  const showEditor = effectiveNoteId !== null

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
          <NotesList
            notes={filteredNotes}
            currentFolderId={currentFolderId}
            selectedNoteId={effectiveNoteId}
            onSelectNote={handleSelectNote}
          />
        </div>
      </div>

      {/* Mobile: note editor full screen when note open; desktop: same row */}
      {showEditor && (
        <div className="absolute inset-0 flex flex-col bg-surface md:static md:min-w-0 md:flex-1 md:border-r md:border-border">
          <NoteEditor
            noteId={editorNoteId}
            folderId={currentFolderId}
            initialNote={selectedNote}
            onClose={handleCloseEditor}
            onSaved={handleNoteSaved}
            onDeleted={handleNoteDeleted}
          />
        </div>
      )}
    </div>
  )
}
