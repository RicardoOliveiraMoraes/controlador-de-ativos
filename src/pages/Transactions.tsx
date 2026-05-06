import { useState } from 'react'
import { Trash2, Plus, Filter } from 'lucide-react'
import { usePortfolioStore } from '../store/portfolioStore'
import { Button } from '../components/ui/Button'
import { AddTransactionModal } from '../components/Portfolio/AddTransactionModal'
import { formatCurrency, formatDate } from '../utils/format'
import type { TransactionType } from '../types'

export function Transactions() {
  const { transactions, removeTransaction } = usePortfolioStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL')
  const [filterTicker, setFilterTicker] = useState('')
  const [sortDesc, setSortDesc] = useState(true)

  const filtered = transactions
    .filter((t) => filterType === 'ALL' || t.type === filterType)
    .filter((t) => !filterTicker || t.ticker.includes(filterTicker.toUpperCase()))
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortDesc ? -diff : diff
    })

  const totalBuy = transactions.filter((t) => t.type === 'BUY').reduce((s, t) => s + t.quantity * t.price, 0)
  const totalSell = transactions.filter((t) => t.type === 'SELL').reduce((s, t) => s + t.quantity * t.price, 0)

  function exportCsv() {
    const rows = [
      ['Data', 'Tipo', 'Ticker', 'Quantidade', 'Preço', 'Total', 'Observação'],
      ...filtered.map((t) => [
        t.date, t.type === 'BUY' ? 'Compra' : 'Venda', t.ticker,
        t.quantity, t.price.toFixed(2), (t.quantity * t.price).toFixed(2), t.note ?? '',
      ]),
    ]
    const csv = rows.map((r) => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'transacoes.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transações</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Histórico completo de operações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCsv}>Exportar CSV</Button>
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Nova
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Comprado</p>
          <p className="text-xl font-bold text-gain mt-0.5">{formatCurrency(totalBuy)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Vendido</p>
          <p className="text-xl font-bold text-loss mt-0.5">{formatCurrency(totalSell)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-1">
            {(['ALL', 'BUY', 'SELL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === t
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {t === 'ALL' ? 'Todos' : t === 'BUY' ? 'Compras' : 'Vendas'}
              </button>
            ))}
          </div>
          <input
            value={filterTicker}
            onChange={(e) => setFilterTicker(e.target.value)}
            placeholder="Filtrar ticker..."
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="ml-auto text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Data {sortDesc ? '↓' : '↑'}
          </button>
        </div>

        {!filtered.length ? (
          <div className="text-center py-16 text-slate-400 text-sm">Nenhuma transação encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60">
                  {['Data', 'Tipo', 'Ticker', 'Qtd', 'Preço', 'Total', 'Observação', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        tx.type === 'BUY'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {tx.type === 'BUY' ? 'Compra' : 'Venda'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">{tx.ticker}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{tx.quantity}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(tx.price)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(tx.quantity * tx.price)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{tx.note ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
