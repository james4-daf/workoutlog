'use client'

import { useState } from 'react'
import type { NoteFolder } from '@/src/actions/notes'
import { createFolder } from '@/src/actions/notes'
import { FolderPlus, Plus } from 'lucide-react'

type NotesSidebarProps = {
  folders: NoteFolder[]
  currentFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  onNewNote: () => void
  onFolderCreated?: (folder: NoteFolder) => void
}

export function NotesSidebar({
  folders,
  currentFolderId,
  onSelectFolder,
  onNewNote,
  onFolderCreated,
}: NotesSidebarProps) {
  const [newFolderName, setNewFolderName] = useState('')
  const [addingFolder, setAddingFolder] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name || creating) return
    setCreating(true)
    const result = await createFolder(name)
    setCreating(false)
    if (!result.error && result.folder) {
      setNewFolderName('')
      setAddingFolder(false)
      onFolderCreated?.(result.folder)
    }
  }

  return (
    <aside className="flex w-full md:w-52 shrink-0 flex-col border-r border-border bg-surface-alt">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h2 className="font-display text-sm font-bold text-foreground">Folders</h2>
        <button
          type="button"
          onClick={() => setAddingFolder(!addingFolder)}
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-muted hover:bg-surface-hover hover:text-foreground"
          aria-label="New folder"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>
      {addingFolder && (
        <form onSubmit={handleCreateFolder} className="border-b border-border p-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="mb-2 w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!newFolderName.trim() || creating}
              className="rounded-lg bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAddingFolder(false)}
              className="rounded-lg px-2 py-1 text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <nav className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            currentFolderId === null ? 'bg-accent-muted text-accent' : 'text-foreground hover:bg-surface-hover'
          }`}
        >
          All Notes
        </button>
        {folders.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFolder(f.id)}
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              currentFolderId === f.id ? 'bg-accent-muted text-accent' : 'text-foreground hover:bg-surface-hover'
            }`}
          >
            <span className="truncate">{f.name}</span>
          </button>
        ))}
      </nav>
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onNewNote}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> New note
        </button>
      </div>
    </aside>
  )
}
