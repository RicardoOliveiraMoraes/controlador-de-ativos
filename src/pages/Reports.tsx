import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ExternalLink, ChevronDown, ChevronUp, RefreshCw, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { fetchCompanyList, fetchCompanyFundamentals, buildExternalLinks, ALL_SECTORS } from '../services/reportsApi'
import type { CompanyListItem, CompanyFundamentals } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | undefined, decimals = 2): string {
  if (n === undefined || n === null || isNaN(n)) return '–'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtBRL(n: number | undefined): string {
  if (n === undefined || n === null || isNaN(n)) return '–'
  if (Math.abs(n) >= 1e12) return `R$ ${(n / 1e12).toFixed(2)} tri`
  if (Math.abs(n) >= 1e9) return `R$ ${(n / 1e9).toFixed(2)} bi`
  if (Math.abs(n) >= 1e6) return `R$ ${(n / 1e6).toFixed(2)} mi`
  return `R$ ${n.toLocaleString('pt-BR')}`
}

function pct(n: number | undefined): string {
  if (n === undefined || n === null || isNaN(n)) return '–'
  return `${fmt(n)}%`
}

function colorClass(n: number | undefined, invert = false) {
  if (n === undefined || n === null || isNaN(n)) return 'text-slate-400'
  const positive = invert ? n < 0 : n > 0
  const negative = invert ? n > 0 : n < 0
  if (positive) return 'text-emerald-500'
  if (negative) return 'text-red-500'
  return 'text-slate-400'
}

// ─── sub-components ──────────────────────────────────────────────────────────

function MetricBox({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 leading-tight">{label}</p>
      <p className={`text-sm font-semibold ${color ?? 'text-slate-800 dark:text-white'}`}>
        {value}{unit && <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{children}</div>
    </div>
  )
}

interface DetailPanelProps {
  ticker: string
  company: CompanyListItem
  apiKey: string
  onClose: () => void
}

function DetailPanel({ ticker, company, apiKey, onClose }: DetailPanelProps) {
  const [fund, setFund] = useState<CompanyFundamentals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchCompanyFundamentals(ticker, apiKey || undefined)
      .then(setFund)
      .finally(() => setLoading(false))
  }, [ticker, apiKey])

  const links = buildExternalLinks(ticker)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        {/* header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
                {ticker}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                {company.sector}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white leading-snug mt-1">{company.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-3 flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 text-brand-500 animate-spin" />
            </div>
          ) : fund ? (
            <>
              {/* valuation */}
              <Section title="Valuation">
                <MetricBox label="P/L" value={fmt(fund.priceEarnings, 1)} />
                <MetricBox label="P/VP" value={fmt(fund.priceToBook, 1)} />
                <MetricBox label="Div. Yield" value={pct(fund.dividendYield)} color={fund.dividendYield && fund.dividendYield > 0 ? 'text-emerald-500' : undefined} />
                <MetricBox label="EPS (LPA)" value={fund.earningsPerShare !== undefined ? `R$ ${fmt(fund.earningsPerShare)}` : '–'} />
                <MetricBox label="Valor de Mercado" value={fmtBRL(fund.marketCap)} />
              </Section>

              {/* rentabilidade */}
              <Section title="Rentabilidade">
                <MetricBox label="ROE" value={pct(fund.roe)} color={colorClass(fund.roe)} />
                <MetricBox label="ROA" value={pct(fund.roa)} color={colorClass(fund.roa)} />
                <MetricBox label="Margem Líquida" value={pct(fund.netMargin)} color={colorClass(fund.netMargin)} />
                <MetricBox label="Margem Bruta" value={pct(fund.grossMargin)} color={colorClass(fund.grossMargin)} />
              </Section>

              {/* financeiro */}
              <Section title="Resultado Financeiro">
                <MetricBox label="Receita Líquida" value={fmtBRL(fund.revenue)} />
                <MetricBox label="Lucro Líquido" value={fmtBRL(fund.netIncome)} color={colorClass(fund.netIncome)} />
                <MetricBox label="EBITDA" value={fmtBRL(fund.ebitda)} />
                <MetricBox label="Ativo Total" value={fmtBRL(fund.totalAssets)} />
                <MetricBox label="Patrimônio Líq." value={fmtBRL(fund.totalEquity)} />
              </Section>

              {/* endividamento */}
              <Section title="Endividamento">
                <MetricBox label="Dív. / PL" value={fmt(fund.debtToEquity, 2)} color={fund.debtToEquity !== undefined ? (fund.debtToEquity > 2 ? 'text-red-500' : fund.debtToEquity > 1 ? 'text-amber-500' : 'text-emerald-500') : undefined} />
                <MetricBox label="Liquidez Corrente" value={fmt(fund.currentRatio, 2)} />
                <MetricBox label="Dív. Líq. / EBITDA" value={fmt(fund.netDebtEbitda, 2)} />
              </Section>
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Dados não disponíveis</p>
          )}

          {/* external links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Relatórios e Documentos</h4>
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300">{link.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{link.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand-500 flex-shrink-0" />
                </a>
              ))}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
              Para documentos oficiais (DFP, ITR, FRE), acesse o portal <strong>CVM – Documentos</strong> e busque pelo nome da empresa ou CNPJ.
              Relatórios trimestrais e anuais também estão disponíveis na seção de RI (Relações com Investidores) do site de cada companhia.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── column sorting ──────────────────────────────────────────────────────────

type SortKey = 'ticker' | 'name' | 'sector' | 'marketCap'

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <Minus className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100" />
  return dir === 'asc' ? <ChevronUp className="h-3 w-3 text-brand-500" /> : <ChevronDown className="h-3 w-3 text-brand-500" />
}

// ─── main page ───────────────────────────────────────────────────────────────

export function Reports() {
  const apiKey = useSettingsStore((s) => s.apiKey)

  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompanyListItem | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('marketCap')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const load = useCallback(
    async (q: string) => {
      setLoading(true)
      try {
        const result = await fetchCompanyList(q, apiKey || undefined)
        setCompanies(result)
      } finally {
        setLoading(false)
      }
    },
    [apiKey]
  )

  useEffect(() => {
    const t = setTimeout(() => load(search), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, load])

  const filtered = companies.filter((c) => !sector || c.sector === sector)

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = 0
    let bv: string | number = 0
    if (sortKey === 'ticker') { av = a.ticker; bv = b.ticker }
    else if (sortKey === 'name') { av = a.name; bv = b.name }
    else if (sortKey === 'sector') { av = a.sector; bv = b.sector }
    else if (sortKey === 'marketCap') { av = a.marketCap ?? 0; bv = b.marketCap ?? 0 }

    if (typeof av === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    }
    return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sectorCounts = companies.reduce<Record<string, number>>((acc, c) => {
    acc[c.sector] = (acc[c.sector] ?? 0) + 1
    return acc
  }, {})

  const availableSectors = ALL_SECTORS.filter((s) => sectorCounts[s] !== undefined)

  const th = 'text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-3 cursor-pointer select-none group whitespace-nowrap'
  const td = 'py-3 px-2 text-sm'

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios B3</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Indicadores fundamentalistas e acesso a relatórios oficiais das empresas listadas na Bovespa
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ticker ou nome da empresa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none min-w-[180px]"
          >
            <option value="">Todos os setores</option>
            {availableSectors.map((s) => (
              <option key={s} value={s}>{s} ({sectorCounts[s]})</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => load(search)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-brand-500' : 'text-slate-400'}`} />
          Atualizar
        </button>
      </div>

      {/* stats bar */}
      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span>
          <strong className="text-slate-800 dark:text-white">{sorted.length}</strong> empresa{sorted.length !== 1 ? 's' : ''}
          {sector ? ` em ${sector}` : ' listadas'}
        </span>
        {!apiKey && (
          <span className="text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded px-2 py-0.5">
            Dados simulados · configure sua chave brapi.dev em Configurações para dados reais
          </span>
        )}
      </div>

      {/* table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className={`${th} pl-5`} onClick={() => toggleSort('ticker')}>
                  <span className="flex items-center gap-1">Ticker <SortIcon active={sortKey === 'ticker'} dir={sortDir} /></span>
                </th>
                <th className={`${th} px-2`} onClick={() => toggleSort('name')}>
                  <span className="flex items-center gap-1">Empresa <SortIcon active={sortKey === 'name'} dir={sortDir} /></span>
                </th>
                <th className={`${th} px-2 hidden md:table-cell`} onClick={() => toggleSort('sector')}>
                  <span className="flex items-center gap-1">Setor <SortIcon active={sortKey === 'sector'} dir={sortDir} /></span>
                </th>
                <th className={`${th} px-2 hidden lg:table-cell`} onClick={() => toggleSort('marketCap')}>
                  <span className="flex items-center gap-1">Valor de Mercado <SortIcon active={sortKey === 'marketCap'} dir={sortDir} /></span>
                </th>
                <th className={`${th} pr-5 text-right`}>Relatórios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[5, 40, 20, 15, 10].map((w, j) => (
                      <td key={j} className={`${td} ${j === 0 ? 'pl-5' : 'px-2'} ${j === 4 ? 'pr-5' : ''}`}>
                        <div className={`h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-${w}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
                    Nenhuma empresa encontrada para "{search}"
                  </td>
                </tr>
              ) : (
                sorted.map((company) => (
                  <tr
                    key={company.ticker}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(company)}
                  >
                    <td className={`${td} pl-5`}>
                      <span className="font-mono font-semibold text-slate-800 dark:text-white text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {company.ticker}
                      </span>
                    </td>
                    <td className={`${td} px-2`}>
                      <p className="text-sm text-slate-800 dark:text-white font-medium leading-snug line-clamp-1">{company.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{company.sector}</p>
                    </td>
                    <td className={`${td} px-2 hidden md:table-cell`}>
                      <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {company.sector}
                      </span>
                    </td>
                    <td className={`${td} px-2 hidden lg:table-cell font-mono text-slate-700 dark:text-slate-300`}>
                      {fmtBRL(company.marketCap)}
                    </td>
                    <td className={`${td} pr-5 text-right`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(company) }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                      >
                        Ver
                        <TrendingUp className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
            title: 'DFP – Demonstrações Financeiras Padronizadas',
            desc: 'Relatório anual obrigatório com balanço patrimonial, DRE, fluxo de caixa e notas explicativas. Disponível no portal CVM.',
          },
          {
            icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
            title: 'ITR – Informações Trimestrais',
            desc: 'Relatório trimestral com resultados financeiros intermediários. Publicado em até 45 dias após o encerramento do trimestre.',
          },
          {
            icon: <ExternalLink className="h-5 w-5 text-purple-500" />,
            title: 'FRE – Formulário de Referência',
            desc: 'Documento com informações completas sobre a companhia: negócios, riscos, governança, remuneração e histórico financeiro.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* detail modal */}
      {selected && (
        <DetailPanel
          ticker={selected.ticker}
          company={selected}
          apiKey={apiKey}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
