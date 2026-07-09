import { describe, expect, it } from 'vitest'
import { buildOryBrowserFlowPath } from '@/core/server/auth/ory/browser-flow'

describe('Ory browser flow URLs', () => {
  it('starts browser flows through the same-origin proxy', () => {
    expect(
      buildOryBrowserFlowPath('login', {
        login_challenge: 'challenge-1',
        return_to: '/dashboard',
      })
    ).toBe(
      '/self-service/login/browser?login_challenge=challenge-1&return_to=%2Fdashboard'
    )
  })

  it('preserves repeated query parameters', () => {
    expect(
      buildOryBrowserFlowPath('registration', {
        traits: ['email', 'name'],
      })
    ).toBe('/self-service/registration/browser?traits=email&traits=name')
  })
})
