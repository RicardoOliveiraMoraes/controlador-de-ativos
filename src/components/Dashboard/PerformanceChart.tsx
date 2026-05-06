import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/format'
import { usePortfolioStore } from '../../store/portfolioStore'

export function PerformanceChart() {
  const transactions = usePortfolioStore((s) => s.transactions)

  const data = useMemo(() => {
    if (!transactions.length) return []

    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let invested = 0
    const points: { date: string; investido: number }[] = []

    for (const tx of sorted) {
      if (tx.type === 'BUY') invested += tx.quantity * tx.price
      else invested -= tx.quantity * tx.price
      const label = new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      const existing = points.find((p) => p.date === label)
      if (existing) existing.investido = invested
      else points.push({ date: label, investido: Math.max(0, invested) })
    }

    return points
  }, [transactions])

  if (!data.length) {
    return (
      <Card title="Evolução do Capital Investido">
        <div className="h-52 flex items-center justify-center text-slate-400 text-sm px-5 pb-5">
          Registre transações para visualizar o gráfico
        </div>
      </Card>
    )
  }

  return (
    <Card title="Evolução do Capital Investido">
      <div className="px-2 pb-5 mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Investido']}
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area type="monotone" dataKey="investido" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorInvestido)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
