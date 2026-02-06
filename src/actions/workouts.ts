'use server'

import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/auth'
import { revalidatePath } from 'next/cache'

interface WorkoutSet {
  exercise_id: string
  set_number: number
  reps?: number | null
  weight?: number | null
  duration_seconds?: number | null
  distance_meters?: number | null
  notes?: string | null
}

export async function createWorkout(formData: FormData) {
  const user = await requireAuth()
  const supabase = await createClient()

  const workoutDate = formData.get('workout_date') as string
  const notes = formData.get('notes') as string | null
  const setsJson = formData.get('sets') as string

  if (!setsJson) {
    return { error: 'At least one set is required' }
  }

  let sets: WorkoutSet[]
  try {
    sets = JSON.parse(setsJson)
  } catch {
    return { error: 'Invalid sets data' }
  }

  if (sets.length === 0) {
    return { error: 'At least one set is required' }
  }

  // Validate all sets have exercise_id
  for (const set of sets) {
    if (!set.exercise_id) {
      return { error: 'All sets must have an exercise selected' }
    }
  }

  // Create workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      workout_date: workoutDate || new Date().toISOString(),
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (workoutError) {
    return { error: workoutError.message }
  }

  if (!workout) {
    return { error: 'Failed to create workout' }
  }

  // Create workout sets
  const setsToInsert = sets.map((set) => ({
    workout_id: workout.id,
    exercise_id: set.exercise_id,
    set_number: set.set_number,
    reps: set.reps || null,
    weight: set.weight || null,
    duration_seconds: set.duration_seconds || null,
    distance_meters: set.distance_meters || null,
    notes: set.notes?.trim() || null,
  }))

  const { error: setsError } = await supabase
    .from('workout_sets')
    .insert(setsToInsert)

  if (setsError) {
    // Clean up workout if sets fail
    await supabase.from('workouts').delete().eq('id', workout.id)
    return { error: setsError.message }
  }

  revalidatePath('/workout')
  revalidatePath('/workout/history')
  revalidatePath('/workout/log')
  return { success: true, workout_id: workout.id }
}

export async function deleteWorkout(workoutId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/workout')
  revalidatePath('/workout/history')
}

// Wrapper for form actions
export async function deleteWorkoutAction(formData: FormData) {
  const workoutId = formData.get('workoutId') as string
  if (!workoutId) {
    throw new Error('Workout ID is required')
  }
  await deleteWorkout(workoutId)
}

