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
    // Poll up to 5s for Catalyst SDK to initialize
    let attempts = 0
    while (!window.catalyst?.auth && attempts < 50) {
      await new Promise((r) => setTimeout(r, 100))
      attempts++
    }

    if (!window.catalyst?.auth) {
      set({ status: 'unauthenticated', user: null })
      return
    }

    try {
      const result = await window.catalyst.auth.isUserAuthenticated()
      if (result) {
        set({
          status: 'authenticated',
          user: {
            id: String(result.user_id),
            email: result.email_id,
            name: `${result.first_name} ${result.last_name}`.trim(),
          },
          error: null,
        })
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
    if (window.catalyst?.auth) {
      window.catalyst.auth.signOut('redirect', { redirect_url: window.location.origin })
    } else {
      window.location.href = '/__catalyst/auth/logout'
    }
  },

  clearError: () => set({ error: null }),
}))
