import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WatchlistItem } from '../types'

interface WatchlistState {
  items: WatchlistItem[]
  addItem: (ticker: string, note?: string) => void
  removeItem: (ticker: string) => void
  hasItem: (ticker: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (ticker, note) => {
        if (get().hasItem(ticker)) return
        set((s) => ({
          items: [
            ...s.items,
            { ticker: ticker.toUpperCase(), addedAt: new Date().toISOString(), note },
          ],
        }))
      },

      removeItem: (ticker) => {
        set((s) => ({ items: s.items.filter((i) => i.ticker !== ticker) }))
      },

      hasItem: (ticker) => get().items.some((i) => i.ticker === ticker.toUpperCase()),
    }),
    { name: 'bovespa-watchlist' }
  )
)
