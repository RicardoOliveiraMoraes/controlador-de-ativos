import axios from 'axios'
import type { Transaction, WatchlistItem, AuthUser } from '../types'

const BASE = '/server/bovespa-api'

const http = axios.create({ baseURL: BASE })

// Injeta o JWT em todas as requisições automaticamente
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('bovespa-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface AuthResponse {
  success: boolean
  token: string
  user: AuthUser
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/signup', { name, email, password })
  return data
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/api/auth/signin', { email, password })
  return data
}

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
