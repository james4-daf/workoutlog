import { requireAuth } from '@/src/lib/auth'
import { getFolders, getNotes } from '@/src/actions/notes'
import { NotesShell } from '@/src/components/notes/NotesShell'

export default async function NotesPage() {
  await requireAuth()

  const [folders, notes] = await Promise.all([
    getFolders(),
    getNotes(),
  ])

  return (
    <div className="min-h-screen">
      <NotesShell initialFolders={folders} initialNotes={notes} />
    </div>
  )
}
