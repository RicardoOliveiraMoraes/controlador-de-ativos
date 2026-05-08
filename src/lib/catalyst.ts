// Catalyst Web SDK — carregado via /__catalyst/init.js em produção.
// Tipo "Hosted": o login/cadastro ocorre na página hospedada pelo Catalyst.
// Após autenticação, o Catalyst redireciona de volta ao app com sessão ativa.

export interface CatalystUser {
  user_id: string
  email_id: string
  first_name: string
  last_name: string
  is_email_verified: boolean
}

interface CatalystAuth {
  // Com Hosted auth, signIn() redireciona para /__catalyst/auth/login
  signIn(): void
  // signOut() encerra a sessão e redireciona
  signOut(type?: 'redirect', config?: { redirect_url?: string }): void
  // Retorna o usuário autenticado ou false
  isUserAuthenticated(): Promise<CatalystUser | false>
}

declare global {
  interface Window {
    catalyst?: { auth: CatalystAuth }
  }
}

export function getCatalystAuth(): CatalystAuth {
  if (!window.catalyst?.auth) {
    throw new Error('Catalyst SDK não disponível.')
  }
  return window.catalyst.auth
}

export function isCatalystReady(): boolean {
  return typeof window !== 'undefined' && !!window.catalyst?.auth
}

// URL da página de login hospedada pelo Catalyst (fallback para redirect direto)
export const CATALYST_LOGIN_URL = '/__catalyst/auth/login'
