import { createClient } from '@/src/lib/supabase/server'

export interface WorkoutSet {
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

export interface Workout {
  id: string
  workout_date: string
  notes: string | null
  created_at: string
  workout_sets: WorkoutSet[]
}

export async function getLastWorkout(userId: string): Promise<Workout | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
      *,
      workout_sets (
        *,
        exercises (
          id,
          name
        )
      )
    `
    )
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  const workout = {
    ...data,
    workout_sets: (data.workout_sets || []).sort(
      (a: WorkoutSet, b: WorkoutSet) => a.set_number - b.set_number
    ),
  }
  return workout as Workout
}
