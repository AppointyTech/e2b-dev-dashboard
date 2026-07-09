import 'server-only'

import type { NextRequest } from 'next/server'

export function getRequestOrigin(request: NextRequest): string {
  const configuredOrigin = process.env.DASHBOARD_URL?.replace(/\/$/, '')
  if (configuredOrigin) return configuredOrigin

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.headers.get('host')
  if (!host) return request.nextUrl.origin

  const proto =
    request.headers.get('x-forwarded-proto') ??
    (request.nextUrl.protocol
      ? request.nextUrl.protocol.replace(/:$/, '')
      : 'http')

  return `${proto}://${host}`
}
