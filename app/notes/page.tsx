import { Suspense } from 'react'
import { requireAuth } from '@/src/lib/auth'
import { NotesShell } from '@/src/components/notes/NotesShell'

export default async function NotesPage() {
  await requireAuth()

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-theme(spacing.14))] min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        }
      >
        <NotesShell />
      </Suspense>
    </div>
  )
}
