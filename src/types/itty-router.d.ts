declare module 'itty-router' {
  export interface ExtendedRequest extends Request {
    params?: Record<string, string>
    user?: any
    db?: any
  }

  export interface RequestHandler {
    (request: ExtendedRequest): Response | Promise<Response> | void | Promise<void> | any | Promise<any>
  }

  export interface RouterOptions {
    base?: string
    before?: RequestHandler[]
    catch?: RequestHandler
    finally?: RequestHandler[]
  }

  export interface Router {
    handle: (request: Request) => Promise<Response>
    all: (path: string, ...handlers: RequestHandler[]) => Router
    get: (path: string, ...handlers: RequestHandler[]) => Router
    post: (path: string, ...handlers: RequestHandler[]) => Router
    put: (path: string, ...handlers: RequestHandler[]) => Router
    patch: (path: string, ...handlers: RequestHandler[]) => Router
    delete: (path: string, ...handlers: RequestHandler[]) => Router
    options: (path: string, ...handlers: RequestHandler[]) => Router
  }

  export function Router(options?: RouterOptions): Router
  export function error(status?: number, body?: any): Response
  export function json(body: any): Response
  export function withParams(request: ExtendedRequest): void
}
