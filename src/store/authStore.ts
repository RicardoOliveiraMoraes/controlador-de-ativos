import { create } from 'zustand'
import type { AuthUser } from '../types'
import { getCatalystAuth, isCatalystReady } from '../lib/catalyst'

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

function toAuthUser(catalystUser: {
  user_id: string
  email_id: string
  first_name: string
  last_name: string
}): AuthUser {
  return {
    id: String(catalystUser.user_id),
    email: catalystUser.email_id,
    name: `${catalystUser.first_name} ${catalystUser.last_name}`.trim(),
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  check: async () => {
    // Wait up to 4s for /__catalyst/init.js to load and initialize
    for (let i = 0; i < 40; i++) {
      if (isCatalystReady()) break
      await new Promise((r) => setTimeout(r, 100))
    }

    if (!isCatalystReady()) {
      set({ status: 'unauthenticated' })
      return
    }
    try {
      const result = await getCatalystAuth().isUserAuthenticated()
      if (result) {
        set({ status: 'authenticated', user: toAuthUser(result), error: null })
      } else {
        set({ status: 'unauthenticated', user: null })
      }
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  // Redirects to Catalyst hosted login page (handles both login and signup)
  login: () => {
    if (isCatalystReady()) {
      getCatalystAuth().signIn()
    } else {
      window.location.href = '/__catalyst/auth/login'
    }
  },

  logout: () => {
    if (isCatalystReady()) {
      getCatalystAuth().signOut('redirect', { redirect_url: window.location.origin })
    } else {
      set({ status: 'unauthenticated', user: null, error: null })
    }
  },

  clearError: () => set({ error: null }),
}))
