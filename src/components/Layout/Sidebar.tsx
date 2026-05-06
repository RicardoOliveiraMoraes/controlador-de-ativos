import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Briefcase, ArrowLeftRight, Star, Settings, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portfolio', label: 'Carteira', icon: Briefcase },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-900 border-r border-slate-800 fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 bg-brand-600 rounded-xl">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Bovespa</p>
          <p className="text-xs text-slate-400">Gerenciador de Ativos</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-5">
        <p className="text-xs text-slate-600">v1.0.0 · B3 / Bovespa</p>
      </div>
    </aside>
  )
}
