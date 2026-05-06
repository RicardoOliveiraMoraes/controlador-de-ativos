import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sun, Moon, Menu, X, TrendingUp, LayoutDashboard, Briefcase, ArrowLeftRight, Star, Settings, LogOut, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useSettingsStore } from '../../store/settingsStore'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/portfolio', label: 'Carteira', icon: Briefcase },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/settings', label: 'Config', icon: Settings },
]

export function Header() {
  const { theme, toggleTheme } = useSettingsStore()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-600 rounded-lg">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Bovespa Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-400 p-2">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 p-2">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <nav className="relative bg-slate-900 border-r border-slate-800 w-60 min-h-full p-3 space-y-0.5 flex flex-col">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 truncate">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}

      <div className="hidden lg:flex fixed top-0 left-60 right-0 z-30 items-center justify-end gap-3 px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 h-14">
        <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-500 dark:text-slate-400">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-300 max-w-32 truncate">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-red-400 p-1.5" title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
