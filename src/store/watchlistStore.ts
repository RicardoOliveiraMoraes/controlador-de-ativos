import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WatchlistItem } from '../types'
import * as api from '../services/api'

interface WatchlistState {
  items: WatchlistItem[]
  synced: boolean
  syncFromApi: () => Promise<void>
  addItem: (ticker: string, note?: string) => Promise<void>
  removeItem: (ticker: string) => Promise<void>
  hasItem: (ticker: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      synced: false,

      // Busca dados da API (quando autenticado) e substitui estado local
      syncFromApi: async () => {
        try {
          const items = await api.fetchWatchlist()
          set({ items, synced: true })
        } catch {
          set({ synced: false })
        }
      },

      addItem: async (ticker, note) => {
        const upper = ticker.toUpperCase()
        if (get().hasItem(upper)) return

        const optimistic: WatchlistItem = {
          ticker: upper,
          addedAt: new Date().toISOString(),
          note,
        }

        // Atualiza UI imediatamente
        set((s) => ({ items: [...s.items, optimistic] }))

        // Sincroniza com a API
        try {
          const { rowId, addedAt } = await api.createWatchlistItem(upper, note)
          set((s) => ({
            items: s.items.map((i) =>
              i.ticker === upper && !i.rowId ? { ...i, rowId, addedAt } : i
            ),
          }))
        } catch {
          // offline ou não autenticado → fica só no localStorage
        }
      },

      removeItem: async (ticker) => {
        const item = get().items.find((i) => i.ticker === ticker)

        // Remove da UI imediatamente
        set((s) => ({ items: s.items.filter((i) => i.ticker !== ticker) }))

        // Remove da API se tiver rowId
        if (item?.rowId) {
          try {
            await api.deleteWatchlistItem(item.rowId)
          } catch {
            // falha silenciosa
          }
        }
      },

      hasItem: (ticker) => get().items.some((i) => i.ticker === ticker.toUpperCase()),
    }),
    { name: 'bovespa-watchlist' }
  )
)
