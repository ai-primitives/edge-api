import type { ExtendedRequest, RequestHandler } from 'itty-router'
import { FetchProvider } from '@mdxdb/fetch'

interface WithDBOptions {
  ns: string
}

export const withDB = (options: WithDBOptions): RequestHandler => {
  const provider = new FetchProvider({
    namespace: options.ns,
    baseUrl: options.ns
  })

  return async (request: ExtendedRequest) => {
    request.db = provider
  }
}
