import axios from 'axios'
import type { Quote } from '../types'

const BASE_URL = 'https://brapi.dev/api'

const MOCK_QUOTES: Record<string, Quote> = {
  PETR4: { ticker: 'PETR4', name: 'Petrobras PN', price: 38.72, change: 0.54, changePercent: 1.41, open: 38.18, high: 38.95, low: 38.05, volume: 42_800_000, sector: 'Energia', updatedAt: new Date().toISOString() },
  VALE3: { ticker: 'VALE3', name: 'Vale ON', price: 62.10, change: -0.88, changePercent: -1.40, open: 62.98, high: 63.20, low: 61.85, volume: 31_200_000, sector: 'Mineração', updatedAt: new Date().toISOString() },
  ITUB4: { ticker: 'ITUB4', name: 'Itaú Unibanco PN', price: 35.48, change: 0.22, changePercent: 0.62, open: 35.26, high: 35.65, low: 35.10, volume: 28_900_000, sector: 'Financeiro', updatedAt: new Date().toISOString() },
  BBDC4: { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.82, change: -0.18, changePercent: -1.20, open: 15.00, high: 15.05, low: 14.75, volume: 35_600_000, sector: 'Financeiro', updatedAt: new Date().toISOString() },
  ABEV3: { ticker: 'ABEV3', name: 'Ambev ON', price: 12.35, change: 0.05, changePercent: 0.41, open: 12.30, high: 12.50, low: 12.25, volume: 18_400_000, sector: 'Bebidas', updatedAt: new Date().toISOString() },
  WEGE3: { ticker: 'WEGE3', name: 'WEG ON', price: 52.88, change: 0.98, changePercent: 1.89, open: 51.90, high: 53.10, low: 51.80, volume: 9_800_000, sector: 'Industrial', updatedAt: new Date().toISOString() },
  MGLU3: { ticker: 'MGLU3', name: 'Magazine Luiza ON', price: 8.42, change: -0.35, changePercent: -3.99, open: 8.77, high: 8.80, low: 8.38, volume: 52_100_000, sector: 'Varejo', updatedAt: new Date().toISOString() },
  BBAS3: { ticker: 'BBAS3', name: 'Banco do Brasil ON', price: 27.60, change: 0.40, changePercent: 1.47, open: 27.20, high: 27.75, low: 27.15, volume: 22_300_000, sector: 'Financeiro', updatedAt: new Date().toISOString() },
  LREN3: { ticker: 'LREN3', name: 'Lojas Renner ON', price: 18.95, change: -0.25, changePercent: -1.30, open: 19.20, high: 19.30, low: 18.90, volume: 11_500_000, sector: 'Varejo', updatedAt: new Date().toISOString() },
  SUZB3: { ticker: 'SUZB3', name: 'Suzano ON', price: 57.42, change: 1.12, changePercent: 1.99, open: 56.30, high: 57.65, low: 56.20, volume: 7_800_000, sector: 'Papel e Celulose', updatedAt: new Date().toISOString() },
  RENT3: { ticker: 'RENT3', name: 'Localiza ON', price: 44.18, change: 0.68, changePercent: 1.56, open: 43.50, high: 44.35, low: 43.45, volume: 6_200_000, sector: 'Locação de Veículos', updatedAt: new Date().toISOString() },
  RADL3: { ticker: 'RADL3', name: 'Raia Drogasil ON', price: 22.75, change: -0.10, changePercent: -0.44, open: 22.85, high: 22.90, low: 22.60, volume: 8_900_000, sector: 'Saúde', updatedAt: new Date().toISOString() },
  EGIE3: { ticker: 'EGIE3', name: 'Engie Brasil ON', price: 42.30, change: 0.30, changePercent: 0.71, open: 42.00, high: 42.50, low: 41.90, volume: 3_400_000, sector: 'Energia Elétrica', updatedAt: new Date().toISOString() },
  TAEE11: { ticker: 'TAEE11', name: 'Taesa UNT', price: 11.42, change: 0.12, changePercent: 1.06, open: 11.30, high: 11.50, low: 11.25, volume: 5_600_000, sector: 'Energia Elétrica', updatedAt: new Date().toISOString() },
  CPLE6: { ticker: 'CPLE6', name: 'Copel PNB', price: 8.95, change: -0.05, changePercent: -0.56, open: 9.00, high: 9.05, low: 8.90, volume: 4_200_000, sector: 'Energia Elétrica', updatedAt: new Date().toISOString() },
}

export const POPULAR_STOCKS = Object.keys(MOCK_QUOTES)

const CACHE_TTL_MS = 30_000
const REQUEST_DELAY_MS = 400
const MAX_RETRIES = 3

const quoteCache = new Map<string, { quote: Quote; expiresAt: number }>()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function mockQuote(ticker: string): Quote {
  const mock = MOCK_QUOTES[ticker.toUpperCase()]
  if (mock) return { ...mock, updatedAt: new Date().toISOString() }
  return {
    ticker: ticker.toUpperCase(),
    name: ticker.toUpperCase(),
    price: 0, change: 0, changePercent: 0,
    open: 0, high: 0, low: 0, volume: 0,
    updatedAt: new Date().toISOString(),
  }
}

function mapResult(r: Record<string, unknown>): Quote {
  return {
    ticker: String(r.symbol ?? ''),
    name: String(r.longName ?? r.shortName ?? r.symbol ?? ''),
    price: Number(r.regularMarketPrice ?? 0),
    change: Number(r.regularMarketChange ?? 0),
    changePercent: Number(r.regularMarketChangePercent ?? 0),
    open: Number(r.regularMarketOpen ?? 0),
    high: Number(r.regularMarketDayHigh ?? 0),
    low: Number(r.regularMarketDayLow ?? 0),
    volume: Number(r.regularMarketVolume ?? 0),
    marketCap: r.marketCap ? Number(r.marketCap) : undefined,
    sector: String(r.sector ?? ''),
    updatedAt: new Date().toISOString(),
  }
}

async function fetchOneWithRetry(ticker: string, apiKey: string): Promise<Quote | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = await axios.get(`${BASE_URL}/quote/${ticker}`, {
        params: { token: apiKey, fundamental: false },
        timeout: 10_000,
      })
      const result = data.results?.[0]
      return result ? mapResult(result) : null
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const isRateLimit = status === 429 || status === 503
      if (isRateLimit && attempt < MAX_RETRIES) {
        // backoff exponencial: 1s, 2s, 4s
        await sleep(1000 * 2 ** attempt)
        continue
      }
      return null
    }
  }
  return null
}

export async function fetchQuotes(tickers: string[], apiKey?: string): Promise<Quote[]> {
  if (!tickers.length) return []

  if (!apiKey) {
    return tickers.map(mockQuote)
  }

  const now = Date.now()
  const results: Quote[] = []
  const toFetch: string[] = []

  for (const ticker of tickers) {
    const cached = quoteCache.get(ticker.toUpperCase())
    if (cached && cached.expiresAt > now) {
      results.push(cached.quote)
    } else {
      toFetch.push(ticker)
    }
  }

  // requisições sequenciais com delay para respeitar o rate limit
  for (let i = 0; i < toFetch.length; i++) {
    const ticker = toFetch[i]
    const quote = (await fetchOneWithRetry(ticker, apiKey)) ?? mockQuote(ticker)
    quoteCache.set(ticker.toUpperCase(), {
      quote,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })
    results.push(quote)
    if (i < toFetch.length - 1) await sleep(REQUEST_DELAY_MS)
  }

  return results
}

export async function searchStocks(query: string, apiKey?: string): Promise<Stock[]> {
  const q = query.toUpperCase().trim()
  const mockResults = Object.entries(MOCK_QUOTES)
    .filter(([ticker, q2]) => ticker.includes(q) || q2.name.toUpperCase().includes(q))
    .map(([ticker, q2]) => ({ ticker, name: q2.name, sector: q2.sector }))

  if (!apiKey || mockResults.length) return mockResults

  try {
    const { data } = await axios.get(`${BASE_URL}/quote/list`, {
      params: { search: query, token: apiKey },
      timeout: 10_000,
    })
    return (data.stocks ?? []).slice(0, 10).map((s: Record<string, unknown>) => ({
      ticker: String(s.stock ?? ''),
      name: String(s.name ?? ''),
      sector: String(s.sector ?? ''),
    }))
  } catch {
    return mockResults
  }
}

interface Stock {
  ticker: string
  name: string
  sector?: string
}
