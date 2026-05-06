import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '../types'

interface SettingsState extends Settings {
  setApiKey: (key: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      currency: 'BRL',
      theme: 'dark',

      setApiKey: (apiKey) => set({ apiKey }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'bovespa-settings' }
  )
)
