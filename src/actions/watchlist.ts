'use server'

import { createClient } from '@/src/lib/supabase/server'
import { requireAuth } from '@/src/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getWatchlist(): Promise<string[]> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('watchlist')
    .select('stocks')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching watchlist:', error)
    return []
  }

  return (data?.stocks ?? []) as string[]
}

export async function removeFromWatchlist(symbol: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: row } = await supabase
    .from('watchlist')
    .select('stocks')
    .eq('user_id', user.id)
    .maybeSingle()

  const stocks: string[] = (row?.stocks ?? []) as string[]
  const updated = stocks.filter((s) => s.toUpperCase() !== symbol.toUpperCase())

  const { error } = await supabase
    .from('watchlist')
    .upsert(
      { user_id: user.id, stocks: updated, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error removing from watchlist:', error)
    return { error: error.message }
  }

  revalidatePath('/stocks')
  return { error: null }
}

export async function addToWatchlist(symbol: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const normalized = symbol.trim().toUpperCase()
  if (!normalized) return { error: 'Symbol is required' }

  const { data: row } = await supabase
    .from('watchlist')
    .select('stocks')
    .eq('user_id', user.id)
    .maybeSingle()

  const stocks: string[] = (row?.stocks ?? []) as string[]
  if (stocks.includes(normalized)) return { error: null }

  const updated = [...stocks, normalized]

  const { error } = await supabase
    .from('watchlist')
    .upsert(
      { user_id: user.id, stocks: updated, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error adding to watchlist:', error)
    return { error: error.message }
  }

  revalidatePath('/stocks')
  return { error: null }
}
