import { requireAuth } from '@/src/lib/auth'
import { getWatchlist } from '@/src/actions/watchlist'
import { Watchlist } from '@/src/components/Watchlist'

export default async function StocksPage() {
  await requireAuth()
  const initialSymbols = await getWatchlist()

  return (
    <div className="min-h-screen px-5 pt-20 pb-12">
      <Watchlist initialSymbols={initialSymbols} />
    </div>
  )
}
