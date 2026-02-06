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
  const date = new Date(workout.workout_date)

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const dayNum = date.getDate()
  const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="rounded-2xl bg-surface border border-border hover:border-border-hover transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-stretch">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-4 px-4 py-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          {/* Date block */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12
            rounded-xl bg-accent-muted">
            <span className="text-[10px] font-bold text-accent leading-none">{dayName}</span>
            <span className="text-lg font-bold text-accent leading-tight">{dayNum}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{monthYear}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-dim">{time}</span>
              <span className="text-xs text-dim">
                {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-dim">
                {totalSets} set{totalSets !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Expand indicator */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round"
            className={`text-dim transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Delete */}
        <form action={deleteWorkoutAction} className="flex items-center pr-3">
          <input type="hidden" name="workoutId" value={workout.id} />
          <button
            type="submit"
            className="rounded-lg p-2 text-dim hover:text-danger hover:bg-danger-muted transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
          </button>
        </form>
      </div>

      {/* Expandable content */}
      <div className={`expand-wrapper ${isExpanded ? 'expanded' : ''}`}>
        <div>
          {workout.notes && (
            <div className="px-4 py-3 border-t border-border">
              <p className="text-sm text-muted italic">{workout.notes}</p>
            </div>
          )}

          <div className="px-4 py-3 border-t border-border space-y-3">
            {Object.values(exerciseGroups).map((group, groupIndex) => (
              <div key={groupIndex} className="rounded-xl bg-white/[0.02] border border-border p-3">
                <h3 className="text-sm font-semibold text-foreground mb-2">{group.exerciseName}</h3>

                {/* Table header */}
                <div className="grid grid-cols-[3rem_1fr_1fr_1fr_1fr] gap-1 mb-1.5 px-1">
                  <span className="text-[10px] font-medium text-dim uppercase">Set</span>
                  <span className="text-[10px] font-medium text-dim uppercase">Reps</span>
                  <span className="text-[10px] font-medium text-dim uppercase">Weight</span>
                  <span className="text-[10px] font-medium text-dim uppercase">Time</span>
                  <span className="text-[10px] font-medium text-dim uppercase">Dist</span>
                </div>

                {/* Sets */}
                {group.sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[3rem_1fr_1fr_1fr_1fr] gap-1 px-1 py-1.5
                      border-t border-white/[0.04] text-sm"
                  >
                    <span className="text-accent font-semibold text-xs">{set.set_number}</span>
                    <span className="text-foreground">
                      {set.reps !== null ? set.reps : <span className="text-dim">-</span>}
                    </span>
                    <span className="text-foreground">
                      {set.weight !== null ? (
                        <>{set.weight}<span className="text-dim text-xs ml-0.5">lb</span></>
                      ) : (
                        <span className="text-dim">-</span>
                      )}
                    </span>
                    <span className="text-foreground">
                      {set.duration_seconds !== null ? (
                        <>{set.duration_seconds}<span className="text-dim text-xs ml-0.5">s</span></>
                      ) : (
                        <span className="text-dim">-</span>
                      )}
                    </span>
                    <span className="text-foreground">
                      {set.distance_meters !== null ? (
                        <>{set.distance_meters}<span className="text-dim text-xs ml-0.5">m</span></>
                      ) : (
                        <span className="text-dim">-</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
