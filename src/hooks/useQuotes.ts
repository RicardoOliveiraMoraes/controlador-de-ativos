import { useState, useEffect, useCallback } from 'react'
import { fetchQuotes } from '../services/stockApi'
import { useSettingsStore } from '../store/settingsStore'
import type { Quote } from '../types'

const REFRESH_INTERVAL = 60_000

export function useQuotes(tickers: string[]) {
  const apiKey = useSettingsStore((s) => s.apiKey)
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map())
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    if (!tickers.length) return
    setLoading(true)
    try {
      const results = await fetchQuotes(tickers, apiKey || undefined)
      setQuotes(new Map(results.map((q) => [q.ticker, q])))
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [tickers.join(','), apiKey])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [load])

  return { quotes, loading, lastUpdated, refresh: load }
}
