import { describe, it, expect } from 'vitest'
import { API, error } from './index'

describe('API', () => {
  it('should create a router instance with middleware support', () => {
    const api = API()
    expect(api).toBeDefined()
    expect(typeof api.get).toBe('function')
    expect(typeof api.all).toBe('function')
  })

  it('should handle routes correctly', async () => {
    const api = API()
    api.get('/', () => ({ hello: 'api' }))

    const response = await api.handle(new Request('http://localhost/'))
    const data = await response.json()
    expect(data).toEqual({ hello: 'api' })
  })
})
