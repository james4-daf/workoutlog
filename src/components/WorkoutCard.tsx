'use client'

import { useState } from 'react'
import { deleteWorkoutAction } from '@/src/actions/workouts'

interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight: number | null
  duration_seconds: number | null
  distance_meters: number | null
  notes: string | null
  exercises: {
    id: string
    name: string
  }
}

interface WorkoutCardProps {
  workout: {
    id: string
    workout_date: string
    notes: string | null
    created_at: string
    workout_sets: WorkoutSet[]
  }
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group sets by exercise
  const exerciseGroups = workout.workout_sets.reduce(
    (acc, set) => {
      const exerciseId = set.exercise_id
      if (!acc[exerciseId]) {
        acc[exerciseId] = {
          exerciseName: set.exercises.name,
          sets: [],
        }
      }
      acc[exerciseId].sets.push(set)
      return acc
    },
    {} as Record<string, { exerciseName: string; sets: WorkoutSet[] }>
  )

  const exerciseCount = Object.keys(exerciseGroups).length
  const totalSets = workout.workout_sets.length

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 text-left hover:bg-gray-50 -mx-6 px-6 py-2 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {new Date(workout.workout_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(workout.workout_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {' • '}
                  {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                  {' • '}
                  {totalSets} {totalSets === 1 ? 'set' : 'sets'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </button>
          <form action={deleteWorkoutAction} className="ml-4">
            <input type="hidden" name="workoutId" value={workout.id} />
            <button
              type="submit"
              className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {isExpanded && (
        <>
          {workout.notes && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">{workout.notes}</p>
            </div>
          )}

          <div className="px-6 py-4">
            <div className="space-y-6">
              {Object.values(exerciseGroups).map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-base font-semibold text-gray-900">
                    {group.exerciseName}
                  </h3>
                  <div className="space-y-2">
                    {group.sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-start gap-4 rounded-md bg-white p-3 text-sm"
                      >
                        <div className="w-16 flex-shrink-0">
                          <span className="font-medium text-gray-700">
                            Set {set.set_number}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            {set.reps !== null && (
                              <span>{set.reps} reps</span>
                            )}
                            {set.weight !== null && (
                              <span>{set.weight} lbs</span>
                            )}
                            {set.duration_seconds !== null && (
                              <span>{set.duration_seconds}s</span>
                            )}
                            {set.distance_meters !== null && (
                              <span>{set.distance_meters}m</span>
                            )}
                          </div>
                          {set.notes && (
                            <p className="mt-1 text-xs text-gray-500">
                              {set.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

