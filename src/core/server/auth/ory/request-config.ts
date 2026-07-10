import type { OryClientConfiguration } from '@ory/elements-react'
import { headers } from 'next/headers'
import oryConfig from '@/configs/ory'

// Returns oryConfig with sdk.url set to this request's origin, so the Elements
// client posts /self-service/* same-origin through the proxy. Mirrors
// @ory/nextjs's internal getPublicUrl() (host + x-forwarded-proto), which isn't
// exported. Server-only (reads next/headers); used by the flow pages.
export async function getOryConfigForRequest(): Promise<OryClientConfiguration> {
  const requestHeaders = await headers()
  const dashboardUrl = process.env.DASHBOARD_URL
  if (dashboardUrl) {
    return {
      ...oryConfig,
      sdk: { ...oryConfig.sdk, url: new URL(dashboardUrl).origin },
    }
  }

  const host = requestHeaders.get('host')
  if (!host) return oryConfig

  const proto = requestHeaders.get('x-forwarded-proto') ?? 'http'
  return { ...oryConfig, sdk: { ...oryConfig.sdk, url: `${proto}://${host}` } }
}
