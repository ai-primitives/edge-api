import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ExtendedRequest } from '../types/request'
import type { User } from '@auth/core/types'
import type { Env } from '../types/request'
import type { AuthSession } from '@auth/core'

vi.mock('@auth/core')

describe('withUser middleware', () => {
  let mockEnv: Env
  const mockUser: User = { id: '123', name: 'Test User' }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockEnv = {
      AUTH_SECRET: 'test-secret',
    }
  })

  it('should attach user to request when authenticated', async () => {
    const { Auth } = await import('@auth/core')
    vi.mocked(Auth).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: () => Promise.resolve({ user: mockUser } as AuthSession),
    } as Response & { json(): Promise<AuthSession | null> })

    const { withUser } = await import('./withUser')
    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    const result = await withUser(mockRequest, mockEnv)
    expect(result).toBeUndefined()
    expect(mockRequest.user).toEqual(mockUser)
  })

  it('should return 401 when Auth.js returns not ok', async () => {
    const { Auth } = await import('@auth/core')
    vi.mocked(Auth).mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    } as Response)

    const { withUser } = await import('./withUser')
    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    const result = await withUser(mockRequest, mockEnv)
    expect(result).toBeInstanceOf(Response)
    if (result instanceof Response) {
      expect(result.status).toBe(401)
      const data = await result.json() as Record<string, string>
      expect(data.error).toBe('Unauthorized')
    }
  })

  it('should handle missing user in session', async () => {
    const { Auth } = await import('@auth/core')
    vi.mocked(Auth).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: () => Promise.resolve({ user: null }),
    } as Response & { json(): Promise<AuthSession | null> })

    const { withUser } = await import('./withUser')
    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    const result = await withUser(mockRequest, mockEnv)
    expect(result).toBeInstanceOf(Response)
    if (result instanceof Response) {
      expect(result.status).toBe(401)
      const data = await result.json() as Record<string, string>
      expect(data.error).toBe('Unauthorized')
    }
  })

  it('should handle Auth.js throwing an error', async () => {
    const { Auth } = await import('@auth/core')
    vi.mocked(Auth).mockRejectedValue(new Error('Auth failed'))

    const { withUser } = await import('./withUser')
    const mockRequest = Object.assign(new Request('https://example.com'), {
      params: {},
      query: {},
    }) as ExtendedRequest

    const result = await withUser(mockRequest, mockEnv)

    expect(result).toBeInstanceOf(Response)
    if (result instanceof Response) {
      expect(result.status).toBe(401)
      const data = await result.json() as Record<string, string>
      expect(data.error).toBe('Unauthorized')
    }
  })
})
