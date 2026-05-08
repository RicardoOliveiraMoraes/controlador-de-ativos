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

  check: async () => {
    try {
      const res = await fetch('/server/bovespa-api/api/me', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        const contentType = res.headers.get('content-type') ?? ''
        if (contentType.includes('application/json')) {
          const { data } = await res.json()
          set({ status: 'authenticated', user: data, error: null })
          return
        }
      }
      set({ status: 'unauthenticated', user: null })
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  login: () => {
    window.location.href = '/__catalyst/auth/login'
  },

  logout: () => {
    if (window.catalyst?.auth) {
      window.catalyst.auth.signOut('redirect', { redirect_url: window.location.origin })
    } else {
      window.location.href = '/__catalyst/auth/logout'
    }
  },

  clearError: () => set({ error: null }),
}))
