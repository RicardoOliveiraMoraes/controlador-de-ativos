import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { usePortfolioStore } from '../../store/portfolioStore'
import { searchStocks } from '../../services/stockApi'
import { useSettingsStore } from '../../store/settingsStore'
import { formatCurrency } from '../../utils/format'
import { Search } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  defaultTicker?: string
}

export function AddTransactionModal({ open, onClose, defaultTicker }: Props) {
  const addTransaction = usePortfolioStore((s) => s.addTransaction)
  const apiKey = useSettingsStore((s) => s.apiKey)

  const [ticker, setTicker] = useState(defaultTicker ?? '')
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [suggestions, setSuggestions] = useState<{ ticker: string; name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (defaultTicker) setTicker(defaultTicker)
  }, [defaultTicker])

  useEffect(() => {
    if (!open) {
      setTicker(defaultTicker ?? '')
      setType('BUY')
      setQuantity('')
      setPrice('')
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')
      setSuggestions([])
      setErrors({})
    }
  }, [open, defaultTicker])

  async function handleTickerChange(value: string) {
    setTicker(value.toUpperCase())
    if (value.length >= 2) {
      const results = await searchStocks(value, apiKey || undefined)
      setSuggestions(results.slice(0, 6))
    } else {
      setSuggestions([])
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!ticker.trim()) errs.ticker = 'Ticker obrigatório'
    if (!quantity || Number(quantity) <= 0) errs.quantity = 'Quantidade inválida'
    if (!price || Number(price) <= 0) errs.price = 'Preço inválido'
    if (!date) errs.date = 'Data obrigatória'
    setErrors(errs)
    return !Object.keys(errs).length
  }

  function handleSubmit() {
    if (!validate()) return
    addTransaction({
      ticker: ticker.trim().toUpperCase(),
      type,
      quantity: Number(quantity),
      price: Number(price),
      date,
      note: note.trim() || undefined,
    })
    onClose()
  }

  const total = Number(quantity) * Number(price)

  return (
    <Modal open={open} onClose={onClose} title="Nova Transação">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['BUY', 'SELL'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === t
                  ? t === 'BUY'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t === 'BUY' ? 'Compra' : 'Venda'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Input
            label="Ticker"
            value={ticker}
            onChange={(e) => handleTickerChange(e.target.value)}
            placeholder="Ex: PETR4"
            error={errors.ticker}
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.ticker}
                  onClick={() => { setTicker(s.ticker); setSuggestions([]) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                >
                  <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{s.ticker}</span>
                  <span className="text-xs text-slate-500 truncate">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantidade"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
            error={errors.quantity}
          />
          <Input
            label="Preço (R$)"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="38.50"
            error={errors.price}
          />
        </div>

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          error={errors.date}
        />

        <Input
          label="Observação (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: Dividendos reinvestidos"
        />

        {total > 0 && (
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total da operação</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(total)}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} className="flex-1">
            {type === 'BUY' ? 'Registrar Compra' : 'Registrar Venda'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
