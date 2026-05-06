import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'
import { formatCurrency, formatPercent } from '../../utils/format'
import type { Quote } from '../../types'
import type { HoldingWithQuote } from '../../types'

interface Props {
  holdings: HoldingWithQuote[]
  quotes: Map<string, Quote>
}

export function SummaryCards({ holdings }: Props) {
  const totalInvested = holdings.reduce((s, h) => s + h.totalInvested, 0)
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
  const totalPnl = totalValue - totalInvested
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0
  const gainers = holdings.filter((h) => h.pnl > 0).length
  const losers = holdings.filter((h) => h.pnl < 0).length

  const cards = [
    {
      label: 'Patrimônio Total',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'bg-brand-500',
      sub: `${holdings.length} ativo${holdings.length !== 1 ? 's' : ''}`,
    },
    {
      label: 'Total Investido',
      value: formatCurrency(totalInvested),
      icon: BarChart2,
      color: 'bg-purple-500',
      sub: 'Custo médio acumulado',
    },
    {
      label: 'Resultado (P&L)',
      value: formatCurrency(totalPnl),
      icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
      color: totalPnl >= 0 ? 'bg-green-500' : 'bg-red-500',
      sub: formatPercent(totalPnlPct),
      pnl: true,
      positive: totalPnl >= 0,
    },
    {
      label: 'Posições',
      value: `${gainers} ↑ / ${losers} ↓`,
      icon: BarChart2,
      color: 'bg-amber-500',
      sub: `${holdings.length - gainers - losers} neutras`,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 ${c.color} rounded-xl flex items-center justify-center`}>
            <c.icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className={`text-xl font-bold mt-0.5 truncate ${
              c.pnl ? (c.positive ? 'text-gain' : 'text-loss') : 'text-slate-900 dark:text-white'
            }`}>
              {c.value}
            </p>
            <p className={`text-xs mt-0.5 ${
              c.pnl ? (c.positive ? 'text-gain' : 'text-loss') : 'text-slate-500 dark:text-slate-400'
            }`}>
              {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
