export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR')
}

export function pnlClass(value: number): string {
  if (value > 0) return 'text-gain'
  if (value < 0) return 'text-loss'
  return 'text-slate-400'
}
