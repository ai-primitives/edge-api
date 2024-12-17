import type { ExtendedRequest, RequestHandler } from 'itty-router'
import { FetchProvider } from '@mdxdb/fetch'

interface WithDBOptions {
  ns: string
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
}

export const withDB = (options: WithDBOptions): RequestHandler => {
  const provider = new FetchProvider({
    namespace: options.ns,
    baseUrl: options.ns,
    headers: options.headers,
    timeout: options.timeout,
    retries: options.retries,
    retryDelay: options.retryDelay,
  })

  return async (request: ExtendedRequest) => {
    request.db = provider
    await provider.connect()
  }
}
