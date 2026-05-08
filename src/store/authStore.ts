import { create } from 'zustand'
import type { AuthUser } from '../types'
import { getCatalystAuth, isCatalystReady } from '../lib/catalyst'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  check: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
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

function extractError(err: unknown): string {
  const e = err as { errorMessage?: string; message?: string; data?: { message?: string } }
  return e?.errorMessage ?? e?.data?.message ?? e?.message ?? 'Ocorreu um erro. Tente novamente.'
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  check: async () => {
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

  login: async (email, password) => {
    set({ error: null })
    try {
      const result = await getCatalystAuth().signIn('email_password', {
        email_id: email.trim().toLowerCase(),
        password,
      })
      set({ status: 'authenticated', user: toAuthUser(result), error: null })
    } catch (err) {
      const msg = extractError(err)
      set({ error: msg })
      throw new Error(msg)
    }
  },

  register: async (firstName, lastName, email, password) => {
    set({ error: null })
    try {
      const result = await getCatalystAuth().signUp({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email_id: email.trim().toLowerCase(),
        password,
        platform_type: 'web',
      })
      set({ status: 'authenticated', user: toAuthUser(result), error: null })
    } catch (err) {
      const msg = extractError(err)
      set({ error: msg })
      throw new Error(msg)
    }
  },

  logout: async () => {
    try {
      await getCatalystAuth().signOut()
    } finally {
      set({ status: 'unauthenticated', user: null, error: null })
    }
  },

  clearError: () => set({ error: null }),
}))
