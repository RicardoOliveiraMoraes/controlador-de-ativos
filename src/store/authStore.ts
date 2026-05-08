import { create } from 'zustand'
import type { AuthUser } from '../types'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  check: () => Promise<void>
  login: () => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  // Check auth by calling /api/me — works via Catalyst session cookie
  check: async () => {
    try {
      const res = await fetch('/server/bovespa-api/api/me', { credentials: 'include' })
      if (res.ok) {
        const { data } = await res.json()
        set({ status: 'authenticated', user: data, error: null })
      } else {
        set({ status: 'unauthenticated', user: null })
      }
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  login: () => {
    window.location.href = '/__catalyst/auth/login'
  },

  logout: () => {
    window.location.href = '/__catalyst/auth/logout'
  },

  clearError: () => set({ error: null }),
}))
