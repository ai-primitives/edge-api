declare module '@auth/core' {
  import type { User } from '@auth/core/types'

  export interface AuthConfig {
    secret: string | undefined
    trustHost?: boolean
    providers?: Array<unknown>
  }

  export interface AuthSession {
    user?: User
  }

  export function Auth(request: Request, config: AuthConfig): Promise<Response & { json(): Promise<AuthSession | null> }>
}
