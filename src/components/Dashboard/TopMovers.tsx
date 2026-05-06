import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCurrency, formatPercent } from '../../utils/format'
import type { HoldingWithQuote } from '../../types'

interface Props {
  holdings: HoldingWithQuote[]
}

export function TopMovers({ holdings }: Props) {
  const withQuotes = holdings.filter((h) => h.quote)
  const sorted = [...withQuotes].sort((a, b) => (b.quote?.changePercent ?? 0) - (a.quote?.changePercent ?? 0))
  const gainers = sorted.filter((h) => (h.quote?.changePercent ?? 0) > 0).slice(0, 3)
  const losers = [...sorted].reverse().filter((h) => (h.quote?.changePercent ?? 0) < 0).slice(0, 3)

  function Row({ h, isGain }: { h: HoldingWithQuote; isGain: boolean }) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isGain ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {isGain ? <TrendingUp className="h-3.5 w-3.5 text-gain" /> : <TrendingDown className="h-3.5 w-3.5 text-loss" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white font-mono">{h.ticker}</p>
            <p className="text-xs text-slate-500">{formatCurrency(h.quote!.price)}</p>
          </div>
        </div>
        <span className={`text-sm font-bold ${isGain ? 'text-gain' : 'text-loss'}`}>
          {formatPercent(h.quote!.changePercent)}
        </span>
      </div>
    )
  }

  if (!withQuotes.length) {
    return (
      <Card title="Maiores Variações" className="p-5">
        <p className="text-sm text-slate-400 text-center py-8">Sem cotações disponíveis</p>
      </Card>
    )
  }

  return (
    <Card title="Maiores Variações">
      <div className="px-5 pb-5">
        {gainers.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gain uppercase tracking-wide mt-4 mb-2">Maiores altas</p>
            {gainers.map((h) => <Row key={h.ticker} h={h} isGain />)}
          </>
        )}
        {losers.length > 0 && (
          <>
            <p className="text-xs font-semibold text-loss uppercase tracking-wide mt-4 mb-2">Maiores quedas</p>
            {losers.map((h) => <Row key={h.ticker} h={h} isGain={false} />)}
          </>
        )}
      </div>
    </Card>
  )
}
