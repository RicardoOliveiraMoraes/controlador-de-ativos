import { HoldingsTable } from '../components/Portfolio/HoldingsTable'

export function Portfolio() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Carteira</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Suas posições na B3</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <HoldingsTable />
      </div>
    </div>
  )
}
