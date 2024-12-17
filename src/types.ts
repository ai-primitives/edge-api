import type { FetchProvider } from '@mdxdb/fetch'
import type { User } from 'next-auth'

declare module 'itty-router' {
  export interface Request extends globalThis.Request {
    params?: Record<string, string>
    user?: User
    db?: FetchProvider
  }
}
