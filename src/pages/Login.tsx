import { TrendingUp, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { isCatalystReady } from '../lib/catalyst'

export function Login() {
  const login = useAuthStore((s) => s.login)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-brand-600/30">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bovespa Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gerenciador de Ativos B3</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-slate-300 text-sm">
              Faça login ou crie sua conta para acessar sua carteira e watchlist sincronizados.
            </p>
          </div>

          {!isCatalystReady() && (
            <div className="flex items-start gap-2 px-4 py-3 bg-amber-900/30 border border-amber-700/50 rounded-xl w-full">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Autenticação disponível apenas quando o app está deployado no Zoho Catalyst.
              </p>
            </div>
          )}

          <button
            onClick={login}
            disabled={!isCatalystReady()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Entrar / Criar conta
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          Autenticação gerenciada pelo Zoho Catalyst · Dados criptografados
        </p>
      </div>
    </div>
  )
}
