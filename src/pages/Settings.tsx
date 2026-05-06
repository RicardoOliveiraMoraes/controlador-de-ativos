import { useState } from 'react'
import { Key, Palette, Info, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { usePortfolioStore } from '../store/portfolioStore'
import { useWatchlistStore } from '../store/watchlistStore'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Settings() {
  const { apiKey, setApiKey, theme, toggleTheme } = useSettingsStore()
  const [localKey, setLocalKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const transactionCount = usePortfolioStore((s) => s.transactions.length)
  const holdingCount = usePortfolioStore((s) => s.holdings.length)
  const watchlistCount = useWatchlistStore((s) => s.items.length)

  function saveKey() {
    setApiKey(localKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function clearAll() {
    if (!confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) return
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Personalize o gerenciador de ativos</p>
      </div>

      <Card>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-4 w-4 text-brand-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">API Key – brapi.dev</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure sua chave da <a href="https://brapi.dev" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">brapi.dev</a> para obter cotações em tempo real da B3.
            Sem a chave, dados de demonstração são utilizados.
          </p>
          <div className="flex gap-2">
            <Input
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="Sua API Key da brapi.dev"
              type="password"
              className="flex-1"
            />
            <Button variant="primary" onClick={saveKey} icon={saved ? <CheckCircle className="h-4 w-4" /> : undefined}>
              {saved ? 'Salvo!' : 'Salvar'}
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            A chave é armazenada apenas no seu navegador (localStorage).
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-4 w-4 text-purple-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Aparência</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Tema</p>
              <p className="text-xs text-slate-500">Alterna entre modo claro e escuro</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400">Modo atual: <strong>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong></p>
        </div>
      </Card>

      <Card>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Dados Locais</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Transações', value: transactionCount },
              { label: 'Ativos', value: holdingCount },
              { label: 'Watchlist', value: watchlistCount },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Todos os dados são armazenados localmente no navegador. Nenhuma informação é enviada para servidores externos.
          </p>
          <Button variant="danger" size="sm" onClick={clearAll} className="mt-2">
            Limpar todos os dados
          </Button>
        </div>
      </Card>

      <Card>
        <div className="p-5">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Sobre</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bovespa Manager · v1.0.0<br />
            Gerenciador de ações da B3 (Bolsa de Valores Brasileira).<br />
            Desenvolvido para deploy no Zoho Catalyst Slate (hospedagem estática).
          </p>
        </div>
      </Card>
    </div>
  )
}
