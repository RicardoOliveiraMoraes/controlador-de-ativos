import { TrendingUp, LogIn, Cloud } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { catalystSignIn } from '../store/authStore'

export function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bovespa Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Gerenciador de Ativos B3</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1 text-center">Entrar na sua conta</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Faça login para sincronizar sua carteira em todos os navegadores e dispositivos.
          </p>

          <Button
            variant="primary"
            size="lg"
            icon={<LogIn className="h-5 w-5" />}
            onClick={catalystSignIn}
            className="w-full justify-center"
          >
            Entrar com Zoho
          </Button>

          <div className="mt-6 flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <Cloud className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Seus dados (carteira, transações, watchlist) ficam salvos na nuvem via{' '}
              <span className="text-brand-400">Zoho Catalyst</span> e sincronizam automaticamente
              entre todos os seus dispositivos.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Bovespa Manager · Powered by Zoho Catalyst
        </p>
      </div>
    </div>
  )
}
