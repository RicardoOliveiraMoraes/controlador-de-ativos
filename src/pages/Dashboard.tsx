import { useState } from 'react'
import { Plus } from 'lucide-react'
import { usePortfolioStore } from '../store/portfolioStore'
import { useQuotes } from '../hooks/useQuotes'
import { SummaryCards } from '../components/Dashboard/SummaryCards'
import { AllocationChart } from '../components/Dashboard/AllocationChart'
import { TopMovers } from '../components/Dashboard/TopMovers'
import { PerformanceChart } from '../components/Dashboard/PerformanceChart'
import { AddTransactionModal } from '../components/Portfolio/AddTransactionModal'
import { Button } from '../components/ui/Button'
import type { HoldingWithQuote } from '../types'

export function Dashboard() {
  const holdings = usePortfolioStore((s) => s.holdings)
  const tickers = holdings.map((h) => h.ticker)
  const { quotes } = useQuotes(tickers)
  const [modalOpen, setModalOpen] = useState(false)

  const enriched: HoldingWithQuote[] = holdings.map((h) => {
    const quote = quotes.get(h.ticker) ?? null
    const currentValue = quote ? h.quantity * quote.price : h.totalInvested
    const pnl = currentValue - h.totalInvested
    const pnlPercent = h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0
    return { ...h, quote, currentValue, pnl, pnlPercent }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Visão geral da sua carteira B3</p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Nova Transação
        </Button>
      </div>

      <SummaryCards holdings={enriched} quotes={quotes} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <TopMovers holdings={enriched} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart holdings={enriched} />
        <RecentTransactions />
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function RecentTransactions() {
  const transactions = usePortfolioStore((s) => s.transactions)
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-5 pt-5 pb-0">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Últimas Transações</h3>
      </div>
      <div className="px-5 pb-5 mt-4">
        {!recent.length ? (
          <p className="text-sm text-slate-400 text-center py-6">Nenhuma transação registrada</p>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tx.type === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                    {tx.type === 'BUY' ? 'C' : 'V'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white font-mono">{tx.ticker}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tx.quantity}x R$ {tx.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">= R$ {(tx.quantity * tx.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
