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
          // Renumber sets
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

    // Validate
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

    // Flatten exercise groups into sets with exercise_id
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
        // Reset form
        setWorkoutDate(() => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return today.toISOString().slice(0, 16)
        })
        setNotes('')
        setExerciseGroups([])
        // Redirect after a moment
        setTimeout(() => {
          router.push('/workouts')
          router.refresh()
        }, 1500)
      }
    })
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Log Workout</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Workout logged successfully! Redirecting...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="workout_date"
              className="block text-sm font-medium text-gray-700"
            >
              Workout Date
            </label>
            <input
              id="workout_date"
              type="datetime-local"
              value={workoutDate}
              onChange={(e) => setWorkoutDate(e.target.value)}
              disabled={isPending}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Workout Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
            placeholder="How did the workout feel? Any notes..."
          />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
            <button
              type="button"
              onClick={addExercise}
              disabled={isPending}
              className="rounded-md bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              + Add Exercise
            </button>
          </div>

          {exerciseGroups.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500 mb-4">No exercises added yet.</p>
              <button
                type="button"
                onClick={addExercise}
                disabled={isPending}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Add Your First Exercise
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {exerciseGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-md border-2 border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exercise <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={group.exercise_id}
                        onChange={(e) =>
                          updateExerciseGroup(group.id, e.target.value)
                        }
                        disabled={isPending}
                        required
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
                      >
                        <option value="">Select exercise</option>
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(group.id)}
                      disabled={isPending}
                      className="ml-4 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Remove Exercise
                    </button>
                  </div>

                  {group.exercise_id && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          Sets for {getExerciseName(group.exercise_id)}
                        </h4>
                        <button
                          type="button"
                          onClick={() => addSetToExercise(group.id)}
                          disabled={isPending}
                          className="text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50"
                        >
                          + Add Set
                        </button>
                      </div>

                      <div className="space-y-3">
                        {group.sets.map((set) => (
                          <div
                            key={set.id}
                            className="rounded-md border border-gray-300 bg-white p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">
                                Set {set.set_number}
                              </span>
                              {group.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSetFromExercise(group.id, set.id)
                                  }
                                  disabled={isPending}
                                  className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Reps
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      group.id,
                                      set.id,
                                      'reps',
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : null
                                    )
                                  }
                                  disabled={isPending}
                                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
                                  placeholder="10"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Weight (lbs)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={set.weight || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      group.id,
                                      set.id,
                                      'weight',
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                  disabled={isPending}
                                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
                                  placeholder="135"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Duration (sec)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={set.duration_seconds || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      group.id,
                                      set.id,
                                      'duration_seconds',
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : null
                                    )
                                  }
                                  disabled={isPending}
                                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
                                  placeholder="60"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700">
                                  Distance (m)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={set.distance_meters || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      group.id,
                                      set.id,
                                      'distance_meters',
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                  disabled={isPending}
                                  className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 disabled:opacity-50"
                                  placeholder="100"
                                />
                              </div>
                            </div>
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

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Logging workout...' : 'Log Workout'}
          </button>
        </div>
      </form>
    </div>
  )
}

