import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Layout/Sidebar'
import { Header } from './components/Layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Portfolio } from './pages/Portfolio'
import { Transactions } from './pages/Transactions'
import { Watchlist } from './pages/Watchlist'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { useSettingsStore } from './store/settingsStore'
import { useAuthStore } from './store/authStore'
import { usePortfolioStore } from './store/portfolioStore'
import { useWatchlistStore } from './store/watchlistStore'
import { TrendingUp } from 'lucide-react'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)
  const { status, check, logout: _logout } = useAuthStore()
  const syncPortfolio = usePortfolioStore((s) => s.syncFromApi)
  const syncWatchlist = useWatchlistStore((s) => s.syncFromApi)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    check().then(() => {
      if (useAuthStore.getState().status === 'authenticated') {
        syncPortfolio()
        syncWatchlist()
      }
    })
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center animate-pulse">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <div className={theme === 'dark' ? 'dark' : ''}><Login /></div>
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <Sidebar />
        <Header />
        <main className="lg:ml-60 pt-14 lg:pt-14 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  )
}
