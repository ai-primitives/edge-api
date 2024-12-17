import type { ExtendedRequest, RequestHandler } from 'itty-router'
import { Auth } from '@auth/core'
import type { AuthConfig, AuthSession } from '@auth/core'
import type { Env } from '../types/request'

export const withUser = (async (request: ExtendedRequest, env: Env) => {
  try {
    const config: AuthConfig = {
      secret: env.AUTH_SECRET,
      trustHost: true,
      providers: [],
    }

    const response = await Auth(request as unknown as Request, config)

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const session = (await response.json()) as AuthSession
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    request.user = session.user
    return undefined
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
}) as RequestHandler
