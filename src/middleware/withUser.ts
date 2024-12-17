import { error } from 'itty-router'
import type { ExtendedRequest, RequestHandler } from 'itty-router'
import { Auth } from '@auth/core'
import type { Session, User } from '@auth/core/types'
import { APIError } from '../types/errors'

export const withUser: RequestHandler = async (request: ExtendedRequest) => {
  try {
    // Create a new Request object for Auth.js
    const authRequest = new Request(request.url, {
      headers: request.headers,
      method: request.method,
      body: request.body,
    })

    // Call Auth.js with the request
    const response = await Auth(authRequest, {
      secret: process.env.AUTH_SECRET,
      trustHost: true,
      providers: [], // Auth.js requires at least an empty array
    })

    if (!response.ok) {
      throw new APIError('Unauthorized', 401)
    }

    const session = (await response.json()) as { user?: User } | null
    if (!session?.user) {
      throw new APIError('Unauthorized', 401)
    }

    request.user = session.user
    return
  } catch (err: unknown) {
    if (err instanceof APIError) {
      return error(err.status, { error: err.message })
    }
    return error(401, { error: 'Authentication failed' })
  }
}
