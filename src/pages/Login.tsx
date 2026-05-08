import { useState } from 'react'
import { TrendingUp, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePortfolioStore } from '../store/portfolioStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { isCatalystReady } from '../lib/catalyst'

type Tab = 'login' | 'register'

export function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const { login, register, error, clearError } = useAuthStore()
  const syncPortfolio = usePortfolioStore((s) => s.syncFromApi)
  const syncWatchlist = useWatchlistStore((s) => s.syncFromApi)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  function switchTab(t: Tab) {
    setTab(t)
    setLocalError('')
    clearError()
    setFirstName(''); setLastName(''); setEmail('')
    setPassword(''); setConfirmPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (tab === 'register') {
      if (!firstName.trim() || !lastName.trim()) {
        setLocalError('Nome e sobrenome são obrigatórios.')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('As senhas não coincidem.')
        return
      }
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(firstName, lastName, email, password)
      }
      await Promise.all([syncPortfolio(), syncWatchlist()])
    } catch (err: unknown) {
      setLocalError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-brand-600/30">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bovespa Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerenciador de Ativos B3</p>
        </div>

        {/* Aviso se o SDK não estiver disponível */}
        {!isCatalystReady() && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-900/30 border border-amber-700/50 rounded-xl mb-4">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Autenticação disponível apenas quando o app está deployado no Zoho Catalyst.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Abas */}
          <div className="flex border-b border-slate-700">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-white border-b-2 border-brand-500'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tab === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="João"
                    required
                    autoComplete="given-name"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Sobrenome</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Silva"
                    required
                    autoComplete="family-name"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                  required
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirmar senha
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            )}

            {displayError && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-900/40 border border-red-700/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isCatalystReady()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors mt-1"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? tab === 'login' ? 'Entrando...' : 'Criando conta...'
                : tab === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Autenticação gerenciada pelo Zoho Catalyst · Dados criptografados
        </p>
      </div>
    </div>
  )
}
