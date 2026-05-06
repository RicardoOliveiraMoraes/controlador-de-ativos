import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '../ui/Card'
import { formatCurrency, formatPercent } from '../../utils/format'
import type { HoldingWithQuote } from '../../types'

const COLORS = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

interface Props {
  holdings: HoldingWithQuote[]
}

export function AllocationChart({ holdings }: Props) {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0)
  const data = holdings
    .map((h) => ({ name: h.ticker, value: h.currentValue, pct: total > 0 ? (h.currentValue / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)

  if (!data.length) {
    return (
      <Card title="Alocação da Carteira" className="p-5">
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Sem dados para exibir
        </div>
      </Card>
    )
  }

  return (
    <Card title="Alocação da Carteira">
      <div className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Valor']}
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
            />
            <Legend
              formatter={(value: string) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-2">
          {data.slice(0, 5).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 font-mono">{item.name}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: COLORS[i % COLORS.length] }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right">{formatPercent(item.pct).replace('+', '')}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
