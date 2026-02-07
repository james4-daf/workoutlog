'use server'

import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/auth'
import { revalidatePath } from 'next/cache'

/** Get the user's scheduled workout (exercise IDs). One per user. */
export async function getScheduledWorkout(): Promise<string[]> {
  const user = await requireAuth()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('scheduled_workouts')
    .select('exercise_names')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching scheduled workout:', error)
    return []
  }
  const arr = data?.exercise_names
  if (!arr || !Array.isArray(arr)) return []
  return arr as string[]
}

/** Set the user's scheduled workout (exercise IDs). Replaces any existing. */
export async function setScheduledWorkout(exerciseIds: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()
  const ids = exerciseIds.filter((id) => id && typeof id === 'string')

  const { error } = await supabase
    .from('scheduled_workouts')
    .upsert(
      {
        user_id: user.id,
        exercise_names: ids,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error setting scheduled workout:', error)
    return { error: error.message }
  }
  revalidatePath('/workout')
  return { success: true }
}

/** Clear the scheduled workout. */
export async function clearScheduledWorkout() {
  const user = await requireAuth()
  const supabase = await createClient()
  const { error } = await supabase
    .from('scheduled_workouts')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Error clearing scheduled workout:', error)
    return { error: error.message }
  }
  revalidatePath('/workout')
  return { success: true }
}
