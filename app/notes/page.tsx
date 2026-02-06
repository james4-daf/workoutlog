import { requireAuth } from '@/src/lib/auth'

export default async function NotesPage() {
  await requireAuth()

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-5 pt-20 text-center animate-slide-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-muted">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Notes</h1>
        <p className="mt-3 text-muted">Coming soon</p>
      </div>
    </div>
  )
}
