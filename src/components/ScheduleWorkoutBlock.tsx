'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setScheduledWorkout, clearScheduledWorkout } from '@/src/actions/scheduledWorkout'
import { createExerciseQuick } from '@/src/actions/exercises'

type Exercise = { id: string; name: string }

type ScheduleWorkoutBlockProps = {
  exercises: Exercise[]
  /** Scheduled exercise IDs (from server). */
  initialIds: string[]
}

export function ScheduleWorkoutBlock({ exercises, initialIds }: ScheduleWorkoutBlockProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pendingNames, setPendingNames] = useState<Record<string, string>>({})
  const hasScheduled = initialIds.length > 0
  const [isEditing, setIsEditing] = useState(!hasScheduled)

  useEffect(() => {
    setSelectedIds(initialIds)
  }, [initialIds.join(',')])

  const searchLower = search.trim().toLowerCase()
  const available = useMemo(() => {
    if (!searchLower) return exercises
    return exercises.filter((e) => e.name.toLowerCase().includes(searchLower))
  }, [exercises, searchLower])

  const addExercise = (id: string) => {
    if (selectedIds.includes(id)) return
    setSelectedIds((prev) => [...prev, id])
  }

  const removeExercise = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) return
    setSaving(true)
    await setScheduledWorkout(selectedIds)
    setSaving(false)
    setIsEditing(false)
    router.refresh()
  }

  const handleCreateAndAdd = async () => {
    const name = search.trim()
    if (!name || creating) return
    setCreating(true)
    const result = await createExerciseQuick(name)
    setCreating(false)
    if (result.error) {
      alert(result.error)
      return
    }
    if (result.exercise) {
      setSelectedIds((prev) => [...prev, result.exercise!.id])
      setPendingNames((prev) => ({ ...prev, [result.exercise!.id]: result.exercise!.name }))
      setSearch('')
    }
  }

  const handleClear = async () => {
    if (!confirm('Clear scheduled workout?')) return
    setClearing(true)
    await clearScheduledWorkout()
    setClearing(false)
    setSelectedIds([])
    setIsEditing(true)
    router.refresh()
  }

  const scheduledExercises = initialIds
    .map((id) => exercises.find((e) => e.id === id))
    .filter((e): e is Exercise => e != null)

  if (hasScheduled && !isEditing) {
    return (
      <div className="mt-4 animate-slide-up">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Scheduled workout
        </h2>
        <div className="rounded-2xl bg-surface border border-border p-4">
          <ul className="space-y-1.5 mb-4">
            {scheduledExercises.map((ex, i) => (
              <li key={ex.id} className="text-sm font-medium text-foreground">
                {i + 1}. {ex.name}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/workout/log?scheduled=1"
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black
                hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Start scheduled workout
            </Link>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted
                hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-dim hover:text-danger
                transition-colors disabled:opacity-50"
            >
              {clearing ? 'Clearing…' : 'Clear'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="mt-4 animate-slide-up">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Schedule a workout
        </h2>
        <div className="rounded-2xl bg-surface border border-border p-4 text-center">
          <p className="text-sm text-muted">Add exercises in Exercises first, then you can schedule a workout.</p>
          <Link
            href="/workout/exercises"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            Go to Exercises →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 animate-slide-up">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
        Schedule a workout
      </h2>
      <form onSubmit={handleSchedule} className="rounded-2xl bg-surface border border-border p-4">
        <p className="text-xs text-dim mb-3">
          Search and add exercises from your library. Order is preserved.
        </p>

        {/* Selected (in order) */}
        {selectedIds.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-medium text-dim uppercase tracking-wide">Selected</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const ex = exercises.find((e) => e.id === id)
                const name = ex?.name ?? pendingNames[id]
                if (!name) return null
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent-muted px-3 py-1.5
                      text-sm font-medium text-accent"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeExercise(id)}
                      className="rounded p-0.5 hover:bg-accent/20 transition-colors"
                      aria-label={`Remove ${name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your exercises…"
          className="mb-3 w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm
            focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />

        {/* Exercise list */}
        <div className="max-h-48 overflow-y-auto rounded-lg border border-border mb-4">
          {available.length === 0 ? (
            <div className="p-3 text-center">
              <p className="text-sm text-dim">
                {search.trim() ? 'No exercises match.' : 'No exercises yet.'}
              </p>
              {search.trim() && (
                <button
                  type="button"
                  onClick={handleCreateAndAdd}
                  disabled={creating}
                  className="mt-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black
                    hover:brightness-110 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : `Create "${search.trim()}"`}
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {available.map((ex) => {
                const isSelected = selectedIds.includes(ex.id)
                return (
                  <li key={ex.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{ex.name}</span>
                    <button
                      type="button"
                      onClick={() => (isSelected ? removeExercise(ex.id) : addExercise(ex.id))}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-accent-muted text-accent'
                          : 'bg-accent text-black hover:brightness-110'
                      }`}
                    >
                      {isSelected ? 'Remove' : 'Add'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || selectedIds.length === 0}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black
              hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Schedule'}
          </button>
          {hasScheduled && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setSelectedIds(initialIds)
              }}
              className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
