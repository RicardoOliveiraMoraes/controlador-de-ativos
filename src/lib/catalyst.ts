// Tipagem do Catalyst Web SDK (carregado via /__catalyst/init.js)
export interface CatalystUser {
  user_id: string
  email_id: string
  first_name: string
  last_name: string
  is_email_verified: boolean
}

interface CatalystAuth {
  signIn(type: 'email_password', config: { email_id: string; password: string }): Promise<CatalystUser>
  signUp(config: {
    first_name: string
    last_name: string
    email_id: string
    password: string
    platform_type?: string
  }): Promise<CatalystUser>
  signOut(): Promise<void>
  isUserAuthenticated(): Promise<CatalystUser | false>
}

declare global {
  interface Window {
    catalyst?: { auth: CatalystAuth }
  }
}

export function getCatalystAuth(): CatalystAuth {
  if (!window.catalyst?.auth) {
    throw new Error('Catalyst SDK não disponível. O app deve estar deployado no Catalyst.')
  }
  return window.catalyst.auth
}

export function isCatalystReady(): boolean {
  return !!window.catalyst?.auth
}
