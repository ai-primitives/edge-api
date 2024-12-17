import { describe, it, expect } from 'vitest'
import { API } from './index'
import { json } from 'itty-router'

describe('API', () => {
  it('should create a router instance with middleware support', () => {
    const api = API()
    expect(api).toBeDefined()
    expect(typeof api.get).toBe('function')
    expect(typeof api.all).toBe('function')
  })

  it('should handle routes correctly', async () => {
    const api = API()
    api.get('/', () => json({ hello: 'api' }))

    const response = await api.handle(new Request('http://localhost/'), { AUTH_SECRET: 'test-secret' })
    const data = await response.json()
    expect(data).toEqual({ hello: 'api' })
  })
})
