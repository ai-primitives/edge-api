import { Router, error, json, withParams } from 'itty-router'
import type { RequestHandler, RouterOptions } from 'itty-router'

export const API = () => {
  const router = Router({
    base: '',
    before: [withParams],
    catch: (err: any) => error(err?.status || 500, { error: err?.message || 'Internal Server Error' }),
    finally: [json],
  })
  return router
}

export { error }
