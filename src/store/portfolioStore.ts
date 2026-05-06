import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction, Holding } from '../types'
import { v4 as uuid } from '../utils/uuid'

interface PortfolioState {
  transactions: Transaction[]
  holdings: Holding[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  getHolding: (ticker: string) => Holding | undefined
}

function recalcHoldings(transactions: Transaction[]): Holding[] {
  const map = new Map<string, { qty: number; totalCost: number; txs: Transaction[] }>()

  for (const tx of transactions) {
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

  const holdings: Holding[] = []
  for (const [ticker, { qty, totalCost, txs }] of map.entries()) {
    if (qty > 0) {
      holdings.push({
        ticker,
        quantity: qty,
        avgPrice: qty > 0 ? totalCost / qty : 0,
        totalInvested: totalCost,
        transactions: txs,
      })
    }
  }
  return holdings
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      transactions: [],
      holdings: [],

      addTransaction: (tx) => {
        const newTx: Transaction = { ...tx, id: uuid() }
        const transactions = [...get().transactions, newTx].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        set({ transactions, holdings: recalcHoldings(transactions) })
      },

      removeTransaction: (id) => {
        const transactions = get().transactions.filter((t) => t.id !== id)
        set({ transactions, holdings: recalcHoldings(transactions) })
      },

      getHolding: (ticker) => get().holdings.find((h) => h.ticker === ticker),
    }),
    { name: 'bovespa-portfolio' }
  )
)
