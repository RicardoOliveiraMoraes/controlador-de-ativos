import { useState } from 'react'
import { Star, StarOff, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useWatchlistStore } from '../store/watchlistStore'
import { useQuotes } from '../hooks/useQuotes'
import { Button } from '../components/ui/Button'
import { AddTransactionModal } from '../components/Portfolio/AddTransactionModal'
import { formatCurrency, formatPercent } from '../utils/format'
import { searchStocks } from '../services/stockApi'
import { useSettingsStore } from '../store/settingsStore'

export function Watchlist() {
  const { items, addItem, removeItem } = useWatchlistStore()
  const apiKey = useSettingsStore((s) => s.apiKey)
  const tickers = items.map((i) => i.ticker)
  const { quotes, loading, refresh } = useQuotes(tickers)

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<{ ticker: string; name: string }[]>([])
  const [buyTicker, setBuyTicker] = useState<string | undefined>()
  const [buyModalOpen, setBuyModalOpen] = useState(false)

  async function handleSearch(value: string) {
    setSearch(value)
    if (value.length >= 2) {
      const results = await searchStocks(value, apiKey || undefined)
      setSuggestions(results.filter((s) => !items.find((i) => i.ticker === s.ticker)).slice(0, 6))
    } else {
      setSuggestions([])
    }
  }

  function add(ticker: string) {
    addItem(ticker)
    setSearch('')
    setSuggestions([])
  }

  function openBuy(ticker: string) {
    setBuyTicker(ticker)
    setBuyModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Watchlist</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Acompanhe ações sem precisar ter posição</p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} loading={loading}>Atualizar</Button>
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar ticker (ex: PETR4, VALE3)..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {search && (
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => add(search.toUpperCase())}>
              Adicionar
            </Button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.ticker}
                onClick={() => add(s.ticker)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left border-b border-slate-100 dark:border-slate-700/50 last:border-0"
              >
                <Star className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-sm text-slate-800 dark:text-white font-mono">{s.ticker}</span>
                <span className="text-sm text-slate-500 truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!items.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Star className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-1">Watchlist vazia</h3>
          <p className="text-sm text-slate-400">Use a busca acima para adicionar ações que deseja acompanhar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const quote = quotes.get(item.ticker)
            return (
              <div key={item.ticker} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white font-mono text-lg">{item.ticker}</p>
                    <p className="text-xs text-slate-500 truncate max-w-40">{quote?.name ?? '—'}</p>
                    {quote?.sector && <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">{quote.sector}</p>}
                  </div>
                  <button onClick={() => removeItem(item.ticker)} className="text-slate-300 hover:text-amber-400 transition-colors">
                    <StarOff className="h-5 w-5" />
                  </button>
                </div>

                {quote ? (
                  <>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(quote.price)}</p>
                    <div className={`flex items-center gap-1.5 mb-3 ${quote.change >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {quote.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-sm font-semibold">{formatPercent(quote.changePercent)}</span>
                      <span className="text-sm">({formatCurrency(Math.abs(quote.change))})</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 dark:border-slate-700 pt-3">
                      <div>
                        <p className="text-slate-400">Abertura</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(quote.open)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Máxima</p>
                        <p className="font-semibold text-gain">{formatCurrency(quote.high)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Mínima</p>
                        <p className="font-semibold text-loss">{formatCurrency(quote.low)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-16 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => openBuy(item.ticker)}
                  className="w-full mt-3"
                >
                  Comprar
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <AddTransactionModal open={buyModalOpen} onClose={() => setBuyModalOpen(false)} defaultTicker={buyTicker} />
    </div>
  )
}
