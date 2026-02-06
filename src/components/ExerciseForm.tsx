'use client'

import { useState, useTransition } from 'react'

interface ExerciseFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean } | void>
}

export function ExerciseForm({ action }: ExerciseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        const form = document.getElementById('exercise-form') as HTMLFormElement
        form?.reset()
        setTimeout(() => {
          setSuccess(false)
          setIsOpen(false)
        }, 2000)
      }
    })
  }

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-2xl border border-dashed border-border hover:border-accent/30
            bg-surface/50 px-6 py-4 text-left transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted
              group-hover:bg-accent/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" className="text-accent">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Add Exercise</p>
              <p className="text-xs text-dim">Create a new exercise to use in workouts</p>
            </div>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl bg-surface border border-border p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-foreground">New Exercise</h2>
            <button
              onClick={() => { setIsOpen(false); setError(null); setSuccess(false) }}
              className="text-dim hover:text-foreground transition-colors p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-danger-muted border border-danger/20 px-4 py-3 animate-slide-down">
              <p className="text-sm font-medium text-danger">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-success-muted border border-success/20 px-4 py-3 animate-slide-down">
              <p className="text-sm font-medium text-success">Exercise created!</p>
            </div>
          )}

          <form id="exercise-form" action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name">
                Exercise Name <span className="text-accent">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isPending}
                placeholder="e.g., Bench Press"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="muscle_group">Muscle Group</label>
                <input
                  id="muscle_group"
                  name="muscle_group"
                  type="text"
                  disabled={isPending}
                  placeholder="e.g., Chest"
                />
              </div>
              <div>
                <label htmlFor="equipment">Equipment</label>
                <input
                  id="equipment"
                  name="equipment"
                  type="text"
                  disabled={isPending}
                  placeholder="e.g., Barbell"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                disabled={isPending}
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black
                  hover:brightness-110 active:scale-[0.98] transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creating...' : 'Create Exercise'}
              </button>
              <button
                type="button"
                onClick={() => { setIsOpen(false); setError(null); setSuccess(false) }}
                disabled={isPending}
                className="rounded-xl bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-muted
                  border border-border hover:bg-white/[0.08] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
