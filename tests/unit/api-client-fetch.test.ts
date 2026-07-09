import { afterEach, describe, expect, it, vi } from 'vitest'

describe('API clients', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('forwards openapi-fetch Request objects without rebuilding body streams', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (request: Request) => {
        expect(request).toBeInstanceOf(Request)
        expect(request.method).toBe('POST')
        expect(new URL(request.url).pathname).toBe('/admin/users/bootstrap')
        await expect(request.clone().json()).resolves.toMatchObject({
          oidc_issuer: 'https://ory.example.test',
          oidc_user_id: 'user-1',
        })

        return Response.json({ id: 'team-1', slug: 'team-1' })
      })
    )

    const { api } = await import('@/core/shared/clients/api')

    const result = await api.POST('/admin/users/bootstrap', {
      headers: { 'X-Admin-Token': 'admin-token' },
      body: {
        oidc_issuer: 'https://ory.example.test',
        oidc_user_id: 'user-1',
        oidc_user_email: 'ada@example.test',
        oidc_user_name: 'Ada',
      },
    })

    expect(result.data).toEqual({ id: 'team-1', slug: 'team-1' })
    expect(fetch).toHaveBeenCalledOnce()
  })
})
