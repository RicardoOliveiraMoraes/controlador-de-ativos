export interface Stock {
  ticker: string
  name: string
  sector?: string
}

export type TransactionType = 'BUY' | 'SELL'

export interface Transaction {
  id: string
  rowId?: string   // Catalyst Data Store ROWID (disponível quando autenticado)
  ticker: string
  type: TransactionType
  quantity: number
  price: number
  date: string
  note?: string
}

export interface Holding {
  ticker: string
  quantity: number
  avgPrice: number
  totalInvested: number
  transactions: Transaction[]
}

export interface Quote {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  marketCap?: number
  sector?: string
  updatedAt: string
}

export interface WatchlistItem {
  ticker: string
  addedAt: string
  note?: string
  rowId?: string   // Catalyst Data Store ROWID (disponível quando autenticado)
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalPnl: number
  totalPnlPercent: number
  holdings: HoldingWithQuote[]
}

export interface HoldingWithQuote extends Holding {
  quote: Quote | null
  currentValue: number
  pnl: number
  pnlPercent: number
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface Settings {
  apiKey: string
  currency: 'BRL'
  theme: 'light' | 'dark'
}
