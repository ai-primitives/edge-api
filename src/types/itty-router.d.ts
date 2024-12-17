declare module 'itty-router' {
  import type { User } from '@auth/core/types'
  import type { DatabaseProvider } from '@mdxdb/fetch'

  export interface ExtendedRequest extends Request {
    params?: Record<string, string>
    user?: User
    db?: DatabaseProvider
  }

  export type RequestHandler = (request: ExtendedRequest, ...args: unknown[]) => unknown | Promise<unknown>

  export interface RouterOptions {
    base?: string
    before?: RequestHandler[]
    catch?: (error: Error) => Response
    finally?: ((response: unknown) => Response)[]
  }

  export interface Router {
    handle: (request: Request, ...args: unknown[]) => Promise<Response>
    all: (path: string, ...handlers: RequestHandler[]) => Router
    get: (path: string, ...handlers: RequestHandler[]) => Router
    post: (path: string, ...handlers: RequestHandler[]) => Router
    put: (path: string, ...handlers: RequestHandler[]) => Router
    patch: (path: string, ...handlers: RequestHandler[]) => Router
    delete: (path: string, ...handlers: RequestHandler[]) => Router
    options: (path: string, ...handlers: RequestHandler[]) => Router
  }

  export function Router(options?: RouterOptions): Router
  export function error(status?: number, body?: Record<string, unknown>): Response
  export function json(body: unknown): Response
  export function withParams(request: ExtendedRequest): void
}
