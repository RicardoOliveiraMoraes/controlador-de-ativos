import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { usePortfolioStore } from '../../store/portfolioStore'
import { useQuotes } from '../../hooks/useQuotes'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AddTransactionModal } from './AddTransactionModal'
import { formatCurrency, formatPercent, formatNumber, pnlClass } from '../../utils/format'
import type { HoldingWithQuote } from '../../types'

export function HoldingsTable() {
  const holdings = usePortfolioStore((s) => s.holdings)
  const tickers = holdings.map((h) => h.ticker)
  const { quotes, loading, lastUpdated, refresh } = useQuotes(tickers)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState<string | undefined>()

  const enriched: HoldingWithQuote[] = holdings.map((h) => {
    const quote = quotes.get(h.ticker) ?? null
    const currentValue = quote ? h.quantity * quote.price : h.totalInvested
    const pnl = currentValue - h.totalInvested
    const pnlPercent = h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0
    return { ...h, quote, currentValue, pnl, pnlPercent }
  })

  const totalInvested = enriched.reduce((s, h) => s + h.totalInvested, 0)
  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0)
  const totalPnl = totalValue - totalInvested

  function openBuy(ticker?: string) {
    setSelectedTicker(ticker)
    setModalOpen(true)
  }

  if (!holdings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Carteira vazia</h3>
        <p className="text-sm text-slate-500 mb-6">Adicione sua primeira transação para começar.</p>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => openBuy()}>
          Adicionar Transação
        </Button>
        <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} defaultTicker={selectedTicker} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Atualizado {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={refresh} loading={loading} className="p-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openBuy()}>
          Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Investido', value: formatCurrency(totalInvested) },
          { label: 'Valor Atual', value: formatCurrency(totalValue) },
          {
            label: 'Resultado',
            value: formatCurrency(totalPnl),
            extra: formatPercent(totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0),
            gain: totalPnl >= 0,
          },
        ].map((item) => (
          <div key={item.label} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${item.gain !== undefined ? (item.gain ? 'text-gain' : 'text-loss') : 'text-slate-900 dark:text-white'}`}>
              {item.value}
            </p>
            {item.extra && (
              <p className={`text-xs font-medium ${item.gain ? 'text-gain' : 'text-loss'}`}>{item.extra}</p>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60">
              {['Ticker', 'Qtd', 'PM (R$)', 'Preço Atual', 'Investido', 'Valor Atual', 'P&L', 'P&L %', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {enriched.map((h) => (
              <tr key={h.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">{h.ticker}</span>
                    {h.quote?.name && <span className="text-xs text-slate-500 truncate max-w-32">{h.quote.name}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatNumber(h.quantity)}</td>
                <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(h.avgPrice)}</td>
                <td className="px-4 py-3">
                  {h.quote ? (
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(h.quote.price)}</span>
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${h.quote.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {h.quote.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercent(h.quote.changePercent)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(h.totalInvested)}</td>
                <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(h.currentValue)}</td>
                <td className={`px-4 py-3 font-mono font-semibold ${pnlClass(h.pnl)}`}>{formatCurrency(h.pnl)}</td>
                <td className="px-4 py-3">
                  <Badge variant={h.pnlPercent >= 0 ? 'gain' : 'loss'}>
                    {formatPercent(h.pnlPercent)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" onClick={() => openBuy(h.ticker)} className="p-1.5">
                    <Plus className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} defaultTicker={selectedTicker} />
    </div>
  )
}
