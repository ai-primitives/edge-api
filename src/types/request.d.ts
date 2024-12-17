import type { User } from '@auth/core/types'
import type { DatabaseProvider } from '@mdxdb/fetch'

// Cloudflare Workers environment interface
export interface Env {
  AUTH_SECRET: string
  // Add other environment variables as needed
}

// Extend the base Request type
export interface ExtendedRequest extends Request {
  params?: Record<string, string>
  query?: Record<string, string>
  user?: User
  db?: DatabaseProvider
}
