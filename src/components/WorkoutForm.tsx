'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Exercise {
  id: string
  name: string
}

interface WorkoutSet {
  id: string
  set_number: number
  reps?: number | null
  weight?: number | null
  duration_seconds?: number | null
  distance_meters?: number | null
  notes?: string | null
}

interface ExerciseGroup {
  id: string
  exercise_id: string
  sets: WorkoutSet[]
}

interface WorkoutFormProps {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; workout_id?: string } | void>
  exercises: Exercise[]
}

export function WorkoutForm({ action, exercises }: WorkoutFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [workoutDate, setWorkoutDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today.toISOString().slice(0, 16)
  })
  const [notes, setNotes] = useState('')
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([])

  function addExercise() {
    const newGroup: ExerciseGroup = {
      id: Date.now().toString(),
      exercise_id: '',
      sets: [
        {
          id: `${Date.now()}-1`,
          set_number: 1,
          reps: null,
          weight: null,
        },
      ],
    }
    setExerciseGroups([...exerciseGroups, newGroup])
  }

  function removeExercise(groupId: string) {
    setExerciseGroups(exerciseGroups.filter((g) => g.id !== groupId))
  }

  function updateExerciseGroup(groupId: string, exercise_id: string) {
    setExerciseGroups(
      exerciseGroups.map((g) =>
        g.id === groupId ? { ...g, exercise_id } : g
      )
    )
  }

  function addSetToExercise(groupId: string) {
    setExerciseGroups(
      exerciseGroups.map((g) => {
        if (g.id === groupId) {
          const newSet: WorkoutSet = {
            id: `${Date.now()}-${g.sets.length + 1}`,
            set_number: g.sets.length + 1,
            reps: null,
            weight: null,
          }
          return { ...g, sets: [...g.sets, newSet] }
        }
        return g
      })
    )
  }

  function removeSetFromExercise(groupId: string, setId: string) {
    setExerciseGroups(
      exerciseGroups.map((g) => {
        if (g.id === groupId) {
          if (g.sets.length === 1) {
            setError('Each exercise must have at least one set')
            return g
          }
          const newSets = g.sets.filter((s) => s.id !== setId)
          return {
            ...g,
            sets: newSets.map((s, index) => ({
              ...s,
              set_number: index + 1,
            })),
          }
        }
        return g
      })
    )
  }

  function updateSet(
    groupId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string | number | null
  ) {
    setExerciseGroups(
      exerciseGroups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            sets: g.sets.map((s) =>
              s.id === setId
                ? {
                    ...s,
                    [field]: value === '' ? null : value,
                  }
                : s
            ),
          }
        }
        return g
      })
    )
  }

  function getExerciseName(exerciseId: string): string {
    const exercise = exercises.find((e) => e.id === exerciseId)
    return exercise?.name || 'Unknown Exercise'
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (exerciseGroups.length === 0) {
      setError('Add at least one exercise to log a workout')
      return
    }

    for (const group of exerciseGroups) {
      if (!group.exercise_id) {
        setError('All exercises must be selected')
        return
      }
      if (group.sets.length === 0) {
        setError('Each exercise must have at least one set')
        return
      }
    }

    let setNumber = 1
    const flattenedSets = exerciseGroups.flatMap((group) =>
      group.sets.map((set) => ({
        exercise_id: group.exercise_id,
        set_number: setNumber++,
        reps: set.reps || null,
        weight: set.weight || null,
        duration_seconds: set.duration_seconds || null,
        distance_meters: set.distance_meters || null,
        notes: set.notes?.trim() || null,
      }))
    )

    const formData = new FormData()
    formData.append('workout_date', new Date(workoutDate).toISOString())
    formData.append('notes', notes)
    formData.append('sets', JSON.stringify(flattenedSets))

    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        setWorkoutDate(() => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return today.toISOString().slice(0, 16)
        })
        setNotes('')
        setExerciseGroups([])
        setTimeout(() => {
          router.push('/workout/history')
          router.refresh()
        }, 1500)
      }
    })
  }

  return (
    <div className="animate-slide-up">
      {error && (
        <div className="mb-4 rounded-xl bg-danger-muted border border-danger/20 px-4 py-3 animate-slide-down">
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl bg-success-muted border border-success/20 px-4 py-3 animate-slide-down">
          <p className="text-sm font-medium text-success">Workout logged! Redirecting...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date & Notes */}
        <div className="rounded-2xl bg-surface border border-border p-4 space-y-4">
          <div>
            <label htmlFor="workout_date">Date & Time</label>
            <input
              id="workout_date"
              type="datetime-local"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div>
            <label htmlFor="notes">Notes <span className="text-dim font-normal">(optional)</span></label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              placeholder="How did the workout feel?"
            />
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base font-bold text-foreground">Exercises</h3>
            <button
              type="button"
              onClick={addExercise}
              disabled={isPending}
              className="rounded-xl bg-accent-muted px-3.5 py-1.5 text-xs font-semibold text-accent
                hover:bg-accent/20 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              + Add
            </button>
          </div>

          {exerciseGroups.length === 0 ? (
            <button
              type="button"
              onClick={addExercise}
              disabled={isPending}
              className="w-full rounded-2xl border border-dashed border-border hover:border-accent/30
                bg-surface/50 p-8 text-center transition-all group disabled:opacity-50"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl
                bg-accent-muted group-hover:bg-accent/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" className="text-accent">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-sm text-muted">Add your first exercise</p>
            </button>
          ) : (
            <div className="space-y-3">
              {exerciseGroups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  className="rounded-2xl bg-surface border border-border p-4 animate-scale-in"
                >
                  {/* Exercise selector */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <label>
                        Exercise {groupIndex + 1} <span className="text-accent">*</span>
                      </label>
                      <select
                        value={group.exercise_id}
                        onChange={(e) => updateExerciseGroup(group.id, e.target.value)}
                        disabled={isPending}
                        required
                      >
                        <option value="">Select exercise</option>
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(group.id)}
                      disabled={isPending}
                      className="mt-6 rounded-lg p-2 text-dim hover:text-danger hover:bg-danger-muted
                        transition-colors disabled:opacity-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Sets */}
                  {group.exercise_id && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-dim uppercase tracking-wide">
                          Sets for {getExerciseName(group.exercise_id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addSetToExercise(group.id)}
                          disabled={isPending}
                          className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors
                            disabled:opacity-50"
                        >
                          + Add Set
                        </button>
                      </div>

                      {/* Set header */}
                      <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr_2rem] gap-2 mb-1 px-1">
                        <span className="text-[10px] font-medium text-dim">#</span>
                        <span className="text-[10px] font-medium text-dim">Reps</span>
                        <span className="text-[10px] font-medium text-dim">Weight</span>
                        <span className="text-[10px] font-medium text-dim">Time</span>
                        <span className="text-[10px] font-medium text-dim">Dist</span>
                        <span></span>
                      </div>

                      <div className="space-y-1.5">
                        {group.sets.map((set) => (
                          <div
                            key={set.id}
                            className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr_2rem] gap-2 items-center"
                          >
                            <span className="text-sm font-bold text-accent text-center">
                              {set.set_number}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={set.reps || ''}
                              onChange={(e) =>
                                updateSet(group.id, set.id, 'reps',
                                  e.target.value ? parseInt(e.target.value) : null)
                              }
                              disabled={isPending}
                              placeholder="-"
                              className="!p-2 !text-sm text-center !rounded-lg"
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight || ''}
                              onChange={(e) =>
                                updateSet(group.id, set.id, 'weight',
                                  e.target.value ? parseFloat(e.target.value) : null)
                              }
                              disabled={isPending}
                              placeholder="-"
                              className="!p-2 !text-sm text-center !rounded-lg"
                            />
                            <input
                              type="number"
                              min="0"
                              value={set.duration_seconds || ''}
                              onChange={(e) =>
                                updateSet(group.id, set.id, 'duration_seconds',
                                  e.target.value ? parseInt(e.target.value) : null)
                              }
                              disabled={isPending}
                              placeholder="-"
                              className="!p-2 !text-sm text-center !rounded-lg"
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={set.distance_meters || ''}
                              onChange={(e) =>
                                updateSet(group.id, set.id, 'distance_meters',
                                  e.target.value ? parseFloat(e.target.value) : null)
                              }
                              disabled={isPending}
                              placeholder="-"
                              className="!p-2 !text-sm text-center !rounded-lg"
                            />
                            {group.sets.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeSetFromExercise(group.id, set.id)}
                                disabled={isPending}
                                className="p-1 text-dim hover:text-danger transition-colors disabled:opacity-50"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            ) : <span />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-accent px-6 py-3.5 text-sm font-semibold text-black
            hover:brightness-110 active:scale-[0.98] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isPending ? 'Logging workout...' : 'Log Workout'}
        </button>
      </form>
    </div>
  )
}
