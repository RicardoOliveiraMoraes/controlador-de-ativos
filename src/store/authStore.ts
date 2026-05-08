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
      console.log('[auth] checking /server/bovespa-api/api/me ...')
      const res = await fetch('https://newppp-766202007.development.catalystserverless.com/server/bovespa-api/api/me', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      console.log('[auth] status:', res.status, '| url:', res.url, '| content-type:', res.headers.get('content-type'))
      const text = await res.text()
      console.log('[auth] body:', text.slice(0, 300))
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const json = JSON.parse(text)
        if (json.data) {
          set({ status: 'authenticated', user: json.data, error: null })
          return
        }
      }
      set({ status: 'unauthenticated', user: null })
    } catch (err) {
      console.error('[auth] error:', err)
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
