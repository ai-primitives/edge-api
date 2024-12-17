import { Router, error, json, withParams } from 'itty-router'
import type { Router as RouterType } from 'itty-router'
import { APIError } from './types/errors'
import type { Env } from './types/request'

export const API = (): RouterType => {
  const router = Router({
    base: '',
    before: [(request, env) => withParams(request, env)],
    catch: (err: unknown) => {
      if (err instanceof APIError) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: err.status, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const message = err instanceof Error ? err.message : 'Internal Server Error'
      return new Response(
        JSON.stringify({ error: message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    },
    finally: [(response: unknown) => {
      if (response instanceof Response) return response
      if (response === undefined) {
        return new Response(null, { status: 200 })
      }
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }],
  })

  const originalHandle = router.handle
  router.handle = async (request: Request, env: Env, ...args: unknown[]) => {
    try {
      const response = await originalHandle.call(router, request, env, ...args)
      if (response instanceof Response) return response
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err) {
      if (err instanceof APIError) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: err.status, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return router
}

export { error }
export { withParams }
