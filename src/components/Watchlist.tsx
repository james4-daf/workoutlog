'use client'

import { useStock } from '@/src/hooks/useStock'
import { addToWatchlist, removeFromWatchlist } from '@/src/actions/watchlist'
import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Check,
  Trash2,
  Plus,
} from 'lucide-react'

const FMP_PROFILE_URL = 'https://financialmodelingprep.com/stable/profile'

type StockData = {
  price: number
  changePercentage: number
  range: string
  progress: number
}

type WatchlistProps = {
  initialSymbols: string[]
}

export function Watchlist({ initialSymbols }: WatchlistProps) {
  const { apiKey } = useStock()
  const router = useRouter()
  const [symbols, setSymbols] = useState<string[]>(initialSymbols)
  const [stockData, setStockData] = useState<Record<string, StockData>>({})
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addSymbol, setAddSymbol] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const fetched = useRef(new Set<string>())

  const sortedSymbols = [...symbols].sort((a, b) => {
    const changeA = stockData[a]?.changePercentage ?? 0
    const changeB = stockData[b]?.changePercentage ?? 0
    return sortDirection === 'asc' ? changeA - changeB : changeB - changeA
  })

  // Fetch FMP profile for each symbol (same API as reference)
  useEffect(() => {
    if (!apiKey || symbols.length === 0) {
      setLoading(symbols.length === 0)
      return
    }

    const fetchOne = async (ticker: string) => {
      if (fetched.current.has(ticker)) return
      fetched.current.add(ticker)

      try {
        const res = await fetch(
          `${FMP_PROFILE_URL}?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`
        )
        if (!res.ok) return
        const json = await res.json()
        if (!json?.length) return

        const { price, changePercentage, range } = json[0]
        const [low, high] = (range ?? '0-0').split('-').map(Number)
        let progress = 0
        if (!isNaN(low) && !isNaN(high) && high > low) {
          progress = Math.max(0, Math.min(100, ((price - low) / (high - low)) * 100))
        }

        setStockData((prev) => ({
          ...prev,
          [ticker]: { price, changePercentage, range: range ?? '—', progress },
        }))
      } catch (e) {
        console.error(`Error fetching ${ticker}:`, e)
      }
    }

    symbols.forEach(fetchOne)
  }, [symbols, apiKey])

  useEffect(() => {
    setSymbols(initialSymbols)
    if (initialSymbols.length === 0) fetched.current.clear()
  }, [initialSymbols])

  useEffect(() => {
    if (symbols.length === 0) setLoading(false)
  }, [symbols.length])

  useEffect(() => {
    if (
      symbols.length > 0 &&
      symbols.every((t) => stockData[t] !== undefined)
    ) {
      setLoading(false)
    }
  }, [symbols, stockData])

  const handleSort = () => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  const handleRemove = async (ticker: string) => {
    setRemoving(ticker)
    const result = await removeFromWatchlist(ticker)
    setRemoving(null)
    if (!result.error) {
      setSymbols((prev) => prev.filter((s) => s !== ticker))
      fetched.current.delete(ticker)
      router.refresh()
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const sym = addSymbol.trim().toUpperCase()
    if (!sym) return
    setAddError(null)
    setAdding(true)
    const result = await addToWatchlist(sym)
    setAdding(false)
    if (result.error) {
      setAddError(result.error)
      return
    }
    setAddSymbol('')
    setSymbols((prev) => (prev.includes(sym) ? prev : [...prev, sym]))
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-3xl animate-slide-up">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Watchlist
          </h1>
          <div className="flex items-center gap-2">
            <form onSubmit={handleAdd} className="flex items-center gap-2">
              <input
                type="text"
                value={addSymbol}
                onChange={(e) => {
                  setAddSymbol(e.target.value.toUpperCase())
                  setAddError(null)
                }}
                placeholder="e.g. AAPL"
                maxLength={10}
                className="w-24 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                disabled={adding || !addSymbol.trim()}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </button>
            </form>
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 text-sm font-medium text-muted hover:bg-surface-hover"
            >
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>
        {addError && <p className="text-sm text-danger">{addError}</p>}
      </div>

      {symbols.length === 0 && (
        <p className="text-center text-muted">Your watchlist is empty. Add symbols to track prices and 52-week range.</p>
      )}

      {loading && symbols.length > 0 && (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
        </div>
      )}

      {!loading && symbols.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {editing && (
                  <th className="w-12 p-3 font-medium text-muted" scope="col" />
                )}
                <th className="p-3 font-medium text-muted" scope="col">
                  Ticker
                </th>
                <th className="p-3 font-medium text-muted" scope="col">
                  Price
                </th>
                <th
                  className="cursor-pointer select-none p-3 font-medium text-muted transition hover:text-foreground"
                  onClick={handleSort}
                  scope="col"
                >
                  Daily Change %
                  {sortDirection === 'desc' ? (
                    <ChevronDown className="ml-1 inline h-4 w-4" />
                  ) : (
                    <ChevronUp className="ml-1 inline h-4 w-4" />
                  )}
                </th>
                <th className="p-3 text-right font-medium text-muted" scope="col">
                  52 Week Range
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSymbols.map((ticker) => (
                <tr
                  key={ticker}
                  className="border-b border-border last:border-0"
                >
                  {editing && (
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleRemove(ticker)}
                        disabled={removing === ticker}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-dim hover:bg-danger-muted hover:text-danger disabled:opacity-50"
                        aria-label={`Remove ${ticker}`}
                      >
                        {removing === ticker ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="p-3 font-medium text-foreground">
                    {ticker.toUpperCase()}
                  </td>
                  <td className="p-3 text-foreground">
                    {stockData[ticker] != null
                      ? `$${stockData[ticker].price.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="p-3">
                    {stockData[ticker] != null ? (
                      <span
                        className={
                          stockData[ticker].changePercentage >= 0
                            ? 'text-success'
                            : 'text-danger'
                        }
                      >
                        {stockData[ticker].changePercentage.toFixed(2)}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {stockData[ticker] != null ? (
                      <div className="space-y-1">
                        <span className="text-foreground">
                          {stockData[ticker].range}
                        </span>
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt"
                          role="progressbar"
                          aria-valuenow={stockData[ticker].progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{
                              width: `${stockData[ticker].progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
