import { create } from 'zustand'
import type { AuthUser } from '../types'
import { fetchCurrentUser } from '../services/api'

// O Catalyst Web SDK é carregado via <script src="/__catalyst/init.js">
// e expõe window.catalyst. Só está disponível quando deployado no Catalyst.
declare global {
  interface Window {
    catalyst?: {
      auth: {
        signIn: () => void
        signOut: () => void
        isUserAuthenticated: () => Promise<boolean>
      }
    }
  }
}

export function isCatalystAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.catalyst
}

export function catalystSignIn() {
  window.catalyst?.auth.signIn()
}

export function catalystSignOut() {
  window.catalyst?.auth.signOut()
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  check: () => Promise<void>
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  check: async () => {
    // Sem Catalyst (dev local) → nunca autentica, usa localStorage
    if (!isCatalystAvailable()) {
      set({ status: 'unauthenticated', user: null })
      return
    }
    try {
      const user = await fetchCurrentUser()
      set({ status: 'authenticated', user })
    } catch {
      set({ status: 'unauthenticated', user: null })
    }
  },

  signOut: () => {
    set({ status: 'unauthenticated', user: null })
    catalystSignOut()
  },
}))
