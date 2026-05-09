import axios from 'axios'
import type { CompanyListItem, CompanyFundamentals } from '../types'

const BASE_URL = 'https://brapi.dev/api'

const MOCK_COMPANIES: CompanyListItem[] = [
  { ticker: 'PETR4', name: 'Petróleo Brasileiro S.A. - Petrobras', sector: 'Petróleo, Gás e Biocombustíveis', marketCap: 458_000_000_000 },
  { ticker: 'VALE3', name: 'Vale S.A.', sector: 'Mineração', marketCap: 247_000_000_000 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco Holding S.A.', sector: 'Financeiro', marketCap: 290_000_000_000 },
  { ticker: 'BBDC4', name: 'Banco Bradesco S.A.', sector: 'Financeiro', marketCap: 130_000_000_000 },
  { ticker: 'ABEV3', name: 'Ambev S.A.', sector: 'Alimentos e Bebidas', marketCap: 195_000_000_000 },
  { ticker: 'WEGE3', name: 'WEG S.A.', sector: 'Industrial', marketCap: 165_000_000_000 },
  { ticker: 'BBAS3', name: 'Banco do Brasil S.A.', sector: 'Financeiro', marketCap: 125_000_000_000 },
  { ticker: 'LREN3', name: 'Lojas Renner S.A.', sector: 'Varejo', marketCap: 18_000_000_000 },
  { ticker: 'SUZB3', name: 'Suzano S.A.', sector: 'Papel e Celulose', marketCap: 71_000_000_000 },
  { ticker: 'RENT3', name: 'Localiza Rent a Car S.A.', sector: 'Locação de Veículos', marketCap: 39_000_000_000 },
  { ticker: 'RADL3', name: 'Raia Drogasil S.A.', sector: 'Saúde', marketCap: 36_000_000_000 },
  { ticker: 'EGIE3', name: 'Engie Brasil Energia S.A.', sector: 'Energia Elétrica', marketCap: 20_000_000_000 },
  { ticker: 'TAEE11', name: 'Taesa - Transmissora Aliança de Energia Elétrica', sector: 'Energia Elétrica', marketCap: 10_500_000_000 },
  { ticker: 'CPLE6', name: 'Copel - Companhia Paranaense de Energia', sector: 'Energia Elétrica', marketCap: 12_000_000_000 },
  { ticker: 'VIVT3', name: 'Telefônica Brasil S.A. - Vivo', sector: 'Telecomunicações', marketCap: 60_000_000_000 },
  { ticker: 'TOTS3', name: 'TOTVS S.A.', sector: 'Tecnologia', marketCap: 16_000_000_000 },
  { ticker: 'HAPV3', name: 'Hapvida NotreDame Intermédica S.A.', sector: 'Saúde', marketCap: 22_000_000_000 },
  { ticker: 'RDOR3', name: 'Rede D\'Or São Luiz S.A.', sector: 'Saúde', marketCap: 48_000_000_000 },
  { ticker: 'SBSP3', name: 'Companhia de Saneamento Básico do Estado de São Paulo - Sabesp', sector: 'Saneamento', marketCap: 51_000_000_000 },
  { ticker: 'CCRO3', name: 'CCR S.A.', sector: 'Transportes', marketCap: 18_000_000_000 },
  { ticker: 'KLBN11', name: 'Klabin S.A.', sector: 'Papel e Celulose', marketCap: 23_000_000_000 },
  { ticker: 'GGBR4', name: 'Gerdau S.A.', sector: 'Siderurgia e Metalurgia', marketCap: 39_000_000_000 },
  { ticker: 'CSAN3', name: 'Cosan S.A.', sector: 'Petróleo, Gás e Biocombustíveis', marketCap: 21_000_000_000 },
  { ticker: 'PRIO3', name: 'PetroRecôncavo S.A. (PRIO)', sector: 'Petróleo, Gás e Biocombustíveis', marketCap: 29_000_000_000 },
  { ticker: 'JBSS3', name: 'JBS S.A.', sector: 'Alimentos e Bebidas', marketCap: 56_000_000_000 },
  { ticker: 'BRFS3', name: 'BRF S.A.', sector: 'Alimentos e Bebidas', marketCap: 21_000_000_000 },
  { ticker: 'HYPE3', name: 'Hypera Pharma S.A.', sector: 'Saúde', marketCap: 12_000_000_000 },
  { ticker: 'EMBR3', name: 'Embraer S.A.', sector: 'Aeronáutica', marketCap: 25_000_000_000 },
  { ticker: 'MRVE3', name: 'MRV Engenharia e Participações S.A.', sector: 'Construção Civil', marketCap: 5_500_000_000 },
  { ticker: 'MGLU3', name: 'Magazine Luiza S.A.', sector: 'Varejo', marketCap: 9_000_000_000 },
]

const MOCK_FUNDAMENTALS: Record<string, Omit<CompanyFundamentals, 'ticker' | 'name' | 'sector'>> = {
  PETR4: { priceEarnings: 5.8, priceToBook: 1.7, dividendYield: 12.4, roe: 31.2, roa: 11.3, netMargin: 22.1, grossMargin: 45.0, debtToEquity: 0.85, revenue: 558_000_000_000, netIncome: 124_600_000_000, ebitda: 280_000_000_000, marketCap: 458_000_000_000 },
  VALE3: { priceEarnings: 6.2, priceToBook: 1.9, dividendYield: 9.8, roe: 29.5, roa: 14.2, netMargin: 19.8, grossMargin: 38.5, debtToEquity: 0.42, revenue: 268_000_000_000, netIncome: 53_100_000_000, ebitda: 117_000_000_000, marketCap: 247_000_000_000 },
  ITUB4: { priceEarnings: 8.4, priceToBook: 1.8, dividendYield: 5.6, roe: 22.1, roa: 2.1, netMargin: 27.4, grossMargin: 65.2, debtToEquity: 3.2, revenue: 125_000_000_000, netIncome: 34_200_000_000, marketCap: 290_000_000_000 },
  BBDC4: { priceEarnings: 7.1, priceToBook: 1.1, dividendYield: 8.2, roe: 14.8, roa: 1.3, netMargin: 18.9, grossMargin: 58.4, debtToEquity: 4.1, revenue: 95_000_000_000, netIncome: 17_900_000_000, marketCap: 130_000_000_000 },
  ABEV3: { priceEarnings: 16.2, priceToBook: 2.1, dividendYield: 6.1, roe: 13.2, roa: 8.5, netMargin: 14.8, grossMargin: 51.3, debtToEquity: 0.28, revenue: 96_700_000_000, netIncome: 14_300_000_000, ebitda: 26_800_000_000, marketCap: 195_000_000_000 },
  WEGE3: { priceEarnings: 32.5, priceToBook: 7.8, dividendYield: 1.9, roe: 25.4, roa: 15.1, netMargin: 15.8, grossMargin: 33.2, debtToEquity: 0.18, revenue: 33_100_000_000, netIncome: 5_230_000_000, ebitda: 7_100_000_000, marketCap: 165_000_000_000 },
  BBAS3: { priceEarnings: 4.9, priceToBook: 0.9, dividendYield: 10.4, roe: 19.8, roa: 1.7, netMargin: 22.5, grossMargin: 61.3, debtToEquity: 4.8, revenue: 115_000_000_000, netIncome: 25_900_000_000, marketCap: 125_000_000_000 },
  LREN3: { priceEarnings: 18.2, priceToBook: 2.9, dividendYield: 3.1, roe: 16.4, roa: 6.8, netMargin: 6.2, grossMargin: 55.0, debtToEquity: 0.65, revenue: 21_500_000_000, netIncome: 1_330_000_000, ebitda: 3_800_000_000, marketCap: 18_000_000_000 },
  SUZB3: { priceEarnings: 14.8, priceToBook: 2.4, dividendYield: 2.8, roe: 17.3, roa: 6.5, netMargin: 18.6, grossMargin: 42.1, debtToEquity: 1.85, revenue: 30_800_000_000, netIncome: 5_730_000_000, ebitda: 16_400_000_000, marketCap: 71_000_000_000 },
  RENT3: { priceEarnings: 22.1, priceToBook: 3.1, dividendYield: 1.4, roe: 14.2, roa: 4.3, netMargin: 7.8, grossMargin: 42.5, debtToEquity: 1.95, revenue: 20_100_000_000, netIncome: 1_570_000_000, ebitda: 4_200_000_000, marketCap: 39_000_000_000 },
  RADL3: { priceEarnings: 28.4, priceToBook: 4.6, dividendYield: 1.8, roe: 17.2, roa: 8.9, netMargin: 4.2, grossMargin: 28.3, debtToEquity: 0.42, revenue: 35_200_000_000, netIncome: 1_480_000_000, ebitda: 3_100_000_000, marketCap: 36_000_000_000 },
  VIVT3: { priceEarnings: 14.5, priceToBook: 2.2, dividendYield: 6.8, roe: 15.8, roa: 7.2, netMargin: 11.4, grossMargin: 39.6, debtToEquity: 0.55, revenue: 51_200_000_000, netIncome: 5_840_000_000, ebitda: 18_300_000_000, marketCap: 60_000_000_000 },
  TOTS3: { priceEarnings: 35.8, priceToBook: 8.2, dividendYield: 1.4, roe: 24.1, roa: 11.5, netMargin: 12.8, grossMargin: 68.5, debtToEquity: 0.32, revenue: 5_010_000_000, netIncome: 641_000_000, ebitda: 1_300_000_000, marketCap: 16_000_000_000 },
  RDOR3: { priceEarnings: 42.1, priceToBook: 3.8, dividendYield: 0.6, roe: 9.2, roa: 2.8, netMargin: 5.6, grossMargin: 28.4, debtToEquity: 1.52, revenue: 31_500_000_000, netIncome: 1_760_000_000, ebitda: 6_800_000_000, marketCap: 48_000_000_000 },
  SBSP3: { priceEarnings: 18.5, priceToBook: 3.2, dividendYield: 2.1, roe: 18.6, roa: 7.4, netMargin: 16.8, grossMargin: 45.2, debtToEquity: 0.98, revenue: 24_600_000_000, netIncome: 4_130_000_000, ebitda: 9_800_000_000, marketCap: 51_000_000_000 },
  EMBR3: { priceEarnings: 28.6, priceToBook: 4.1, dividendYield: 0.8, roe: 15.3, roa: 4.8, netMargin: 5.9, grossMargin: 21.5, debtToEquity: 1.22, revenue: 28_900_000_000, netIncome: 1_700_000_000, ebitda: 4_100_000_000, marketCap: 25_000_000_000 },
  JBSS3: { priceEarnings: 7.8, priceToBook: 2.1, dividendYield: 4.2, roe: 27.4, roa: 8.1, netMargin: 3.8, grossMargin: 12.4, debtToEquity: 1.35, revenue: 378_000_000_000, netIncome: 14_400_000_000, ebitda: 32_100_000_000, marketCap: 56_000_000_000 },
  PRIO3: { priceEarnings: 8.4, priceToBook: 3.2, dividendYield: 0.9, roe: 42.1, roa: 21.3, netMargin: 31.6, grossMargin: 62.3, debtToEquity: 0.68, revenue: 11_200_000_000, netIncome: 3_540_000_000, ebitda: 6_200_000_000, marketCap: 29_000_000_000 },
  GGBR4: { priceEarnings: 5.9, priceToBook: 1.2, dividendYield: 7.8, roe: 21.5, roa: 9.2, netMargin: 9.1, grossMargin: 24.8, debtToEquity: 0.52, revenue: 81_600_000_000, netIncome: 7_430_000_000, ebitda: 19_800_000_000, marketCap: 39_000_000_000 },
  HYPE3: { priceEarnings: 11.2, priceToBook: 3.4, dividendYield: 5.2, roe: 31.4, roa: 12.8, netMargin: 14.2, grossMargin: 65.1, debtToEquity: 0.88, revenue: 10_200_000_000, netIncome: 1_450_000_000, ebitda: 2_800_000_000, marketCap: 12_000_000_000 },
  MGLU3: { priceEarnings: null as unknown as number, priceToBook: 1.8, dividendYield: 0.0, roe: -8.4, roa: -2.1, netMargin: -2.8, grossMargin: 22.1, debtToEquity: 2.15, revenue: 41_200_000_000, netIncome: -1_150_000_000, ebitda: 800_000_000, marketCap: 9_000_000_000 },
}

export const ALL_SECTORS = [
  'Financeiro', 'Petróleo, Gás e Biocombustíveis', 'Mineração', 'Energia Elétrica',
  'Alimentos e Bebidas', 'Industrial', 'Varejo', 'Saúde', 'Telecomunicações',
  'Tecnologia', 'Papel e Celulose', 'Saneamento', 'Transportes', 'Locação de Veículos',
  'Siderurgia e Metalurgia', 'Construção Civil', 'Aeronáutica',
]

function mapCompanyFromApi(s: Record<string, unknown>): CompanyListItem {
  return {
    ticker: String(s.stock ?? ''),
    name: String(s.name ?? s.stock ?? ''),
    sector: String(s.sector ?? ''),
    logo: s.logo ? String(s.logo) : undefined,
    price: s.close ? Number(s.close) : undefined,
    change: s.change ? Number(s.change) : undefined,
    marketCap: s.market_cap ? Number(s.market_cap) : undefined,
  }
}

function mapFundamentalsFromApi(ticker: string, r: Record<string, unknown>): CompanyFundamentals {
  return {
    ticker,
    name: String(r.longName ?? r.shortName ?? ticker),
    sector: r.sector ? String(r.sector) : undefined,
    priceEarnings: r.priceEarnings ? Number(r.priceEarnings) : undefined,
    priceToBook: r.priceToBook ? Number(r.priceToBook) : undefined,
    dividendYield: r.dividendYield ? Number(r.dividendYield) * 100 : undefined,
    earningsPerShare: r.earningsPerShare ? Number(r.earningsPerShare) : undefined,
    roe: r.returnOnEquity ? Number(r.returnOnEquity) * 100 : undefined,
    roa: r.returnOnAssets ? Number(r.returnOnAssets) * 100 : undefined,
    netMargin: r.profitMargins ? Number(r.profitMargins) * 100 : undefined,
    debtToEquity: r.debtToEquity ? Number(r.debtToEquity) / 100 : undefined,
    currentRatio: r.currentRatio ? Number(r.currentRatio) : undefined,
    revenue: r.revenue ? Number(r.revenue) : undefined,
    netIncome: r.netIncome ? Number(r.netIncome) : undefined,
    ebitda: r.ebitda ? Number(r.ebitda) : undefined,
    totalAssets: r.totalAssets ? Number(r.totalAssets) : undefined,
    totalEquity: r.totalStockholdersEquity ? Number(r.totalStockholdersEquity) : undefined,
    marketCap: r.marketCap ? Number(r.marketCap) : undefined,
  }
}

export async function fetchCompanyList(search: string, apiKey?: string): Promise<CompanyListItem[]> {
  const query = search.trim().toUpperCase()

  const mockFiltered = MOCK_COMPANIES.filter(
    (c) => c.ticker.includes(query) || c.name.toUpperCase().includes(query) || c.sector.toUpperCase().includes(query)
  )

  if (!apiKey) return mockFiltered

  try {
    const { data } = await axios.get(`${BASE_URL}/quote/list`, {
      params: { search: query || undefined, limit: 50, token: apiKey },
      timeout: 10_000,
    })
    const stocks: CompanyListItem[] = (data.stocks ?? []).map(mapCompanyFromApi)
    return stocks.length ? stocks : mockFiltered
  } catch {
    return mockFiltered
  }
}

export async function fetchCompanyFundamentals(ticker: string, apiKey?: string): Promise<CompanyFundamentals> {
  const company = MOCK_COMPANIES.find((c) => c.ticker === ticker.toUpperCase())
  const mockFund = MOCK_FUNDAMENTALS[ticker.toUpperCase()] ?? {}
  const mockResult: CompanyFundamentals = {
    ticker: ticker.toUpperCase(),
    name: company?.name ?? ticker,
    sector: company?.sector,
    ...mockFund,
  }

  if (!apiKey) return mockResult

  try {
    const { data } = await axios.get(`${BASE_URL}/quote/${ticker}`, {
      params: { token: apiKey, fundamental: true, modules: 'defaultKeyStatistics,financialData,incomeStatementHistory' },
      timeout: 10_000,
    })
    const result = data.results?.[0]
    if (!result) return mockResult
    return mapFundamentalsFromApi(ticker, result)
  } catch {
    return mockResult
  }
}

export function buildExternalLinks(ticker: string) {
  const t = ticker.toLowerCase()
  return [
    { label: 'Status Invest', url: `https://statusinvest.com.br/acoes/${t}`, description: 'Indicadores, dividendos e relatórios' },
    { label: 'Fundamentus', url: `https://www.fundamentus.com.br/detalhes.php?papel=${ticker}`, description: 'Dados fundamentalistas detalhados' },
    { label: 'Investidor10', url: `https://investidor10.com.br/acoes/${t}`, description: 'Análise e histórico de proventos' },
    { label: 'B3 – Empresa', url: `https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/empresas-listadas.htm`, description: 'Página oficial na bolsa B3' },
    { label: 'CVM – Documentos', url: `https://www.rad.cvm.gov.br/ENET/frmConsultaExternaCVM.aspx`, description: 'DFP, ITR, FRE e fatos relevantes' },
  ]
}
