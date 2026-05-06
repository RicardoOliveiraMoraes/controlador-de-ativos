import { create } from 'zustand'
import type { AuthUser } from '../types'
import { fetchCurrentUser, signIn as apiSignIn, signUp as apiSignUp } from '../services/api'

const TOKEN_KEY = 'bovespa-token'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  error: string | null
  check: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  error: null,

  // Valida o token salvo no localStorage ao abrir o app
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      set({ status: 'unauthenticated' })
      return
    }
    try {
      const user = await fetchCurrentUser()
      set({ status: 'authenticated', user, error: null })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ status: 'unauthenticated', user: null })
    }
  },

  login: async (email, password) => {
    set({ error: null })
    try {
      const { token, user } = await apiSignIn(email, password)
      localStorage.setItem(TOKEN_KEY, token)
      set({ status: 'authenticated', user, error: null })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao fazer login. Tente novamente.'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  register: async (name, email, password) => {
    set({ error: null })
    try {
      const { token, user } = await apiSignUp(name, email, password)
      localStorage.setItem(TOKEN_KEY, token)
      set({ status: 'authenticated', user, error: null })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao criar conta. Tente novamente.'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ status: 'unauthenticated', user: null, error: null })
  },
}))
