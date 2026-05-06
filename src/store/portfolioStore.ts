import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, Holding } from '../types'
import { v4 as uuid } from '../utils/uuid'
import * as api from '../services/api'

interface PortfolioState {
  transactions: Transaction[]
  holdings: Holding[]
  synced: boolean
  syncFromApi: () => Promise<void>
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  getHolding: (ticker: string) => Holding | undefined
}

function recalcHoldings(transactions: Transaction[]): Holding[] {
  const map = new Map<string, { qty: number; totalCost: number; txs: Transaction[] }>()

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const tx of sorted) {
    const entry = map.get(tx.ticker) ?? { qty: 0, totalCost: 0, txs: [] }
    if (tx.type === 'BUY') {
      entry.qty += tx.quantity
      entry.totalCost += tx.quantity * tx.price
    } else {
      const avgPrice = entry.qty > 0 ? entry.totalCost / entry.qty : 0
      entry.qty -= tx.quantity
      entry.totalCost -= tx.quantity * avgPrice
    }
    entry.txs.push(tx)
    map.set(tx.ticker, entry)
  }

  return Array.from(map.entries())
    .filter(([, { qty }]) => qty > 0)
    .map(([ticker, { qty, totalCost, txs }]) => ({
      ticker,
      quantity: qty,
      avgPrice: qty > 0 ? totalCost / qty : 0,
      totalInvested: totalCost,
      transactions: txs,
    }))
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      transactions: [],
      holdings: [],
      synced: false,

      // Busca dados da API (quando autenticado) e substitui estado local
      syncFromApi: async () => {
        try {
          const transactions = await api.fetchTransactions()
          set({ transactions, holdings: recalcHoldings(transactions), synced: true })
        } catch {
          // sem autenticação ou erro → mantém dados locais
          set({ synced: false })
        }
      },

      addTransaction: async (tx) => {
        const newTx: Transaction = { ...tx, id: uuid() }

        // Otimista: atualiza UI imediatamente
        const transactions = [...get().transactions, newTx]
        set({ transactions, holdings: recalcHoldings(transactions) })

        // Sincroniza com a API se disponível
        try {
          const { rowId } = await api.createTransaction(newTx)
          // Persiste o rowId para poder deletar depois
          set((s) => ({
            transactions: s.transactions.map((t) =>
              t.id === newTx.id ? { ...t, rowId } : t
            ),
          }))
        } catch {
          // offline ou não autenticado → fica só no localStorage
        }
      },

      removeTransaction: async (id) => {
        const tx = get().transactions.find((t) => t.id === id)

        // Remove da UI imediatamente
        const transactions = get().transactions.filter((t) => t.id !== id)
        set({ transactions, holdings: recalcHoldings(transactions) })

        // Remove da API se tiver rowId
        if (tx?.rowId) {
          try {
            await api.deleteTransaction(tx.rowId)
          } catch {
            // falha silenciosa — dado já foi removido localmente
          }
        }
      },

      getHolding: (ticker) => get().holdings.find((h) => h.ticker === ticker),
    }),
    { name: 'bovespa-portfolio' }
  )
)
