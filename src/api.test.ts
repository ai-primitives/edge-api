import { describe, it, expect, vi, beforeEach } from 'vitest'
import { API } from './api'
import { withDB } from './middleware/withDB'
import { error, json } from 'itty-router'
import type { Env } from './types/request'
import type { User } from '@auth/core/types'
import type { AuthSession } from '@auth/core'

describe('API', () => {
  let mockEnv: Env
  const mockUser: User = { id: '123', name: 'Test User' }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockEnv = {
      AUTH_SECRET: 'test-secret',
    }
  })

  it('should create a router instance', () => {
    const api = API()
    expect(api).toBeDefined()
    expect(typeof api.get).toBe('function')
    expect(typeof api.post).toBe('function')
    expect(typeof api.all).toBe('function')
  })

  it('should handle routes with middleware', async () => {
    vi.doMock('@auth/core', () => ({
      Auth: vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: () => Promise.resolve({ user: mockUser } as AuthSession),
        } as Response & { json(): Promise<AuthSession | null> }),
      ),
    }))

    const { withUser } = await import('./middleware/withUser')
    const api = API()
    const mockRequest = new Request('https://example.com/test')

    api.all('*', withUser, withDB({ ns: 'https://db.example.com' })).get('/test', () => json({ success: true }))

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ success: true })
    }
  })

  it('should handle route parameters', async () => {
    const api = API()
    const mockRequest = new Request('https://example.com/users/123')

    api.get('/users/:id', ({ params = {} }) => json({ id: params.id ?? 'unknown' }))

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ id: '123' })
    }
  })

  it('should handle nested route parameters', async () => {
    const api = API()
    const mockRequest = new Request('https://example.com/posts/123/comments/456')

    api.get('/posts/:postId/comments/:commentId', ({ params = {} }) =>
      json({
        postId: params.postId ?? 'unknown',
        commentId: params.commentId ?? 'unknown',
      }),
    )

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ postId: '123', commentId: '456' })
    }
  })

  it('should handle wildcard route parameters', async () => {
    const api = API()
    const mockRequest = new Request('https://example.com/files/path/to/file.txt')

    api.get('/files/:path+', ({ params = {} }) =>
      json({
        path: params.path ?? '',
      }),
    )

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ path: 'path/to/file.txt' })
    }
  })

  it('should handle 404 errors', async () => {
    const api = API()
    const mockRequest = new Request('https://example.com/nonexistent')

    api.all('*', () => error(404))

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(404)
    }
  })

  it('should handle middleware errors', async () => {
    vi.doMock('@auth/core', () => ({
      Auth: vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        } as Response & { json(): Promise<AuthSession | null> }),
      ),
    }))

    const { withUser } = await import('./middleware/withUser')
    const api = API()
    const mockRequest = new Request('https://example.com/test')

    api.all('*', withUser).get('/test', () => json({ success: true }))

    const response = await api.handle(mockRequest, mockEnv)
    expect(response).toBeInstanceOf(Response)
    if (response instanceof Response) {
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    }
  })
})
