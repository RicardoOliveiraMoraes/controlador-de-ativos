import axios from 'axios'
import type { Transaction, WatchlistItem, AuthUser } from '../types'

// Em produção (Catalyst), as funções ficam em /server/{nome-da-function}/
// O Catalyst injeta os cookies de sessão automaticamente (withCredentials)
const http = axios.create({
  baseURL: '/server/bovespa-api',
  withCredentials: true,   // envia os cookies de sessão do Catalyst
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await http.get<{ success: boolean; data: AuthUser }>('/api/me')
  return data.data
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await http.get<{ success: boolean; data: Transaction[] }>('/api/transactions')
  return data.data
}

export async function createTransaction(tx: Transaction): Promise<{ rowId: string }> {
  const { data } = await http.post<{ success: boolean; data: { rowId: string; id: string } }>(
    '/api/transactions',
    tx
  )
  return data.data
}

export async function deleteTransaction(rowId: string): Promise<void> {
  await http.delete(`/api/transactions/${rowId}`)
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const { data } = await http.get<{ success: boolean; data: WatchlistItem[] }>('/api/watchlist')
  return data.data
}

export async function createWatchlistItem(
  ticker: string,
  note?: string
): Promise<{ rowId: string; ticker: string; addedAt: string }> {
  const { data } = await http.post<{
    success: boolean
    data: { rowId: string; ticker: string; addedAt: string }
  }>('/api/watchlist', { ticker, note })
  return data.data
}

export async function deleteWatchlistItem(rowId: string): Promise<void> {
  await http.delete(`/api/watchlist/${rowId}`)
}
