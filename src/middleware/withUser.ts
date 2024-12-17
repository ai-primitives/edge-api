import { error } from 'itty-router'
import type { ExtendedRequest, RequestHandler } from 'itty-router'
import { getToken } from 'next-auth/jwt'

export const withUser: RequestHandler = async (request: ExtendedRequest) => {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    })

    if (!token) return error(401)
    request.user = token
    return
  } catch (err) {
    return error(401, { error: 'Authentication failed' })
  }
}
