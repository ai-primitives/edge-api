declare module 'itty-router' {
  import type { User } from '@auth/core/types'
  import type { DatabaseProvider } from '@mdxdb/fetch'
  import type { Env } from './request'

  export interface ExtendedRequest extends Request {
    params?: Record<string, string>
    user?: User
    db?: DatabaseProvider
  }

  export type RequestHandler = (
    request: ExtendedRequest,
    env: Env,
    ...args: unknown[]
  ) => Response | undefined | void | Promise<Response | undefined | void>

  export interface RouterOptions {
    base?: string
    before?: RequestHandler[]
    catch?: (error: unknown) => Response
    finally?: ((response: unknown) => Response)[]
  }

  export interface Router {
    handle: (request: Request, env: Env, ...args: unknown[]) => Promise<Response>
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
  export function withParams(request: ExtendedRequest, env: Env): void | Promise<void>
}
