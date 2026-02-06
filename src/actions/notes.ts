'use server'

import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/auth'
import { revalidatePath } from 'next/cache'

export type NoteFolder = {
  id: string
  user_id: string
  name: string
  sort_order: number
  created_at: string
}

export type Note = {
  id: string
  user_id: string
  folder_id: string | null
  title: string
  body: string
  note_date: string | null
  created_at: string
  updated_at: string
}

export async function getFolders(): Promise<NoteFolder[]> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('note_folders')
    .select('id, user_id, name, sort_order, created_at')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching folders:', error)
    return []
  }

  const folders = (data ?? []) as NoteFolder[]
  if (folders.length === 0) {
    const { data: newFolder, error: insertError } = await supabase
      .from('note_folders')
      .insert({ user_id: user.id, name: 'Daily', sort_order: 0 })
      .select('id, user_id, name, sort_order, created_at')
      .single()
    if (!insertError && newFolder) {
      return [newFolder as NoteFolder]
    }
  }
  return folders
}

export async function createFolder(name: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: folders } = await supabase
    .from('note_folders')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = folders?.[0]?.sort_order != null ? folders[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('note_folders')
    .insert({ user_id: user.id, name: name.trim(), sort_order: nextOrder })
    .select('id, user_id, name, sort_order, created_at')
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    return { error: error.message, folder: null }
  }
  revalidatePath('/notes')
  return { error: null, folder: data as NoteFolder }
}

export async function renameFolder(id: string, name: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('note_folders')
    .update({ name: name.trim() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error renaming folder:', error)
    return { error: error.message }
  }
  revalidatePath('/notes')
  return { error: null }
}

export async function deleteFolder(id: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error: notesError } = await supabase
    .from('notes')
    .delete()
    .eq('folder_id', id)
    .eq('user_id', user.id)

  if (notesError) {
    console.error('Error deleting notes in folder:', notesError)
    return { error: notesError.message }
  }

  const { error } = await supabase
    .from('note_folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting folder:', error)
    return { error: error.message }
  }
  revalidatePath('/notes')
  return { error: null }
}

/** Pass folderId to filter by folder; null/undefined = all notes. */
export async function getNotes(folderId?: string | null): Promise<Note[]> {
  const user = await requireAuth()
  const supabase = await createClient()

  let query = supabase
    .from('notes')
    .select('id, user_id, folder_id, title, body, note_date, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (folderId != null && folderId !== '') {
    query = query.eq('folder_id', folderId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }
  return (data ?? []) as Note[]
}

export async function getNote(id: string): Promise<Note | null> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, folder_id, title, body, note_date, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as Note
}

export async function createNote(payload: {
  folder_id?: string | null
  title?: string
  body?: string
  note_date?: string | null
}) {
  const user = await requireAuth()
  const supabase = await createClient()

  const noteDate = payload.note_date && payload.note_date.trim() !== '' ? payload.note_date.trim() : null

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      folder_id: payload.folder_id ?? null,
      title: payload.title?.trim() ?? '',
      body: payload.body?.trim() ?? '',
      note_date: noteDate,
      updated_at: new Date().toISOString(),
    })
    .select('id, user_id, folder_id, title, body, note_date, created_at, updated_at')
    .single()

  if (error) {
    console.error('Error creating note:', error)
    return { error: error.message, note: null }
  }
  revalidatePath('/notes')
  return { error: null, note: data as Note }
}

export async function updateNote(
  id: string,
  payload: { title?: string; body?: string; folder_id?: string | null; note_date?: string | null }
) {
  const user = await requireAuth()
  const supabase = await createClient()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.title !== undefined) updates.title = payload.title.trim()
  if (payload.body !== undefined) updates.body = payload.body.trim()
  if (payload.folder_id !== undefined) updates.folder_id = payload.folder_id || null
  if (payload.note_date !== undefined) {
    updates.note_date = payload.note_date && payload.note_date.trim() !== '' ? payload.note_date.trim() : null
  }

  const { error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating note:', error)
    return { error: error.message }
  }
  revalidatePath('/notes')
  return { error: null }
}

export async function deleteNote(id: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Error deleting note:', error)
    return { error: error.message }
  }
  revalidatePath('/notes')
  return { error: null }
}
