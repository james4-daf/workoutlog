'use server'

import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createExercise(formData: FormData) {
  const user = await requireAuth()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const muscle_group = formData.get('muscle_group') as string | null
  const equipment = formData.get('equipment') as string | null
  const notes = formData.get('notes') as string | null

  if (!name || name.trim().length === 0) {
    return { error: 'Exercise name is required' }
  }

  const { error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.id,
      name: name.trim(),
      muscle_group: muscle_group?.trim() || null,
      equipment: equipment?.trim() || null,
      notes: notes?.trim() || null,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/workout/exercises')
  revalidatePath('/workout')
  return { success: true }
}

/** Create an exercise with just a name (e.g. from schedule search). Returns the new exercise. */
export async function createExerciseQuick(name: string): Promise<
  { error: string; exercise: null } | { error: null; exercise: { id: string; name: string } }
> {
  const user = await requireAuth()
  const supabase = await createClient()
  const trimmed = name?.trim()
  if (!trimmed) {
    return { error: 'Exercise name is required', exercise: null }
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: user.id,
      name: trimmed,
      muscle_group: null,
      equipment: null,
      notes: null,
    })
    .select('id, name')
    .single()

  if (error) {
    return { error: error.message, exercise: null }
  }
  revalidatePath('/workout/exercises')
  revalidatePath('/workout')
  return { error: null, exercise: data as { id: string; name: string } }
}

export async function deleteExercise(exerciseId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/workout/exercises')
}

// Wrapper for form actions
export async function deleteExerciseAction(formData: FormData) {
  const exerciseId = formData.get('exerciseId') as string
  if (!exerciseId) {
    throw new Error('Exercise ID is required')
  }
  await deleteExercise(exerciseId)
}

