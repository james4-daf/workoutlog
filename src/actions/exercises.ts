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

  revalidatePath('/exercises')
  return { success: true }
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

  revalidatePath('/exercises')
}

// Wrapper for form actions
export async function deleteExerciseAction(formData: FormData) {
  const exerciseId = formData.get('exerciseId') as string
  if (!exerciseId) {
    throw new Error('Exercise ID is required')
  }
  await deleteExercise(exerciseId)
}

