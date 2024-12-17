import { Router, error, json, withParams } from 'itty-router'
import type { Router as RouterType } from 'itty-router'
import { APIError } from './types/errors'

export const API = (): RouterType => {
  const router = Router({
    base: '',
    before: [withParams],
    catch: (err: unknown) => {
      if (err instanceof APIError) {
        return error(err.status, { error: err.message })
      }
      const message = err instanceof Error ? err.message : 'Internal Server Error'
      return error(500, { error: message })
    },
    finally: [json],
  })
  return router
}

export { error }
export { withParams }
