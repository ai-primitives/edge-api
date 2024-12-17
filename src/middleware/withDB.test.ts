import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ExtendedRequest } from '../types/request'
import type { Env } from '../types/request'
import type { User } from '@auth/core/types'
import type { AuthSession } from '@auth/core'

vi.mock('@auth/core')

describe('withDB middleware', () => {
  let mockEnv: Env
  const mockUser: User = { id: '123', name: 'Test User' }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockEnv = {
      AUTH_SECRET: 'test-secret',
    }
  })

  it('should attach database provider to request', async () => {
    const namespace = 'https://db.example.com'
    const { withDB } = await import('./withDB')
    const middleware = withDB({ ns: namespace })

    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    await middleware(mockRequest, mockEnv)
    expect(mockRequest.db).toBeDefined()
    expect(mockRequest.db?.namespace).toBe(namespace)
  })

  it('should pass through after attaching db', async () => {
    const { withDB } = await import('./withDB')
    const middleware = withDB({ ns: 'https://db.example.com' })
    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    const result = await middleware(mockRequest, mockEnv)
    expect(result).toBeUndefined()
  })

  it('should initialize database provider with correct options', async () => {
    const namespace = 'https://db.example.com'
    const { withDB } = await import('./withDB')
    const middleware = withDB({ ns: namespace })

    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    await middleware(mockRequest, mockEnv)
    expect(mockRequest.db?.namespace).toBe(namespace)
    expect(typeof mockRequest.db?.collection).toBe('function')
  })

  describe('integration with withUser', () => {
    const namespace = 'https://db.example.com'

    beforeEach(async () => {
      vi.resetModules()
      vi.clearAllMocks()
      const { Auth } = await import('@auth/core')
      vi.mocked(Auth).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: () => Promise.resolve({ user: mockUser } as AuthSession),
      } as Response & { json(): Promise<AuthSession | null> })
    })

    it('should work with withUser middleware (withUser first)', async () => {
      const { withDB } = await import('./withDB')
      const { withUser } = await import('./withUser')
      const dbMiddleware = withDB({ ns: namespace })
      const mockRequest = Object.assign(new Request('https://example.com'), {
        params: {},
        query: {},
      }) as ExtendedRequest

      const userResult = await withUser(mockRequest, mockEnv)
      expect(userResult).toBeUndefined()

      const dbResult = await dbMiddleware(mockRequest, mockEnv)
      expect(dbResult).toBeUndefined()

      expect(mockRequest.user).toEqual(mockUser)
      expect(mockRequest.db?.namespace).toBe(namespace)
    })

    it('should work with withUser middleware (withDB first)', async () => {
      const { withDB } = await import('./withDB')
      const { withUser } = await import('./withUser')
      const dbMiddleware = withDB({ ns: namespace })
      const mockRequest = Object.assign(new Request('https://example.com'), {
        params: {},
        query: {},
      }) as ExtendedRequest

      const dbResult = await dbMiddleware(mockRequest, mockEnv)
      expect(dbResult).toBeUndefined()

      const userResult = await withUser(mockRequest, mockEnv)
      expect(userResult).toBeUndefined()

      expect(mockRequest.user).toEqual(mockUser)
      expect(mockRequest.db?.namespace).toBe(namespace)
    })

    it('should handle withUser authentication failure', async () => {
      const { Auth } = await import('@auth/core')
      vi.mocked(Auth).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      } as Response)

      const { withDB } = await import('./withDB')
      const { withUser } = await import('./withUser')
      const dbMiddleware = withDB({ ns: namespace })
      const mockRequest = Object.assign(new Request('https://example.com'), {
        params: {},
        query: {},
      }) as ExtendedRequest

      const result = await withUser(mockRequest, mockEnv)
      expect(result).toBeInstanceOf(Response)
      if (result instanceof Response) {
        expect(result.status).toBe(401)
      }
    })
  })
})
