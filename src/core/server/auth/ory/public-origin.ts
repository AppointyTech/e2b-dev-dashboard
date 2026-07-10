import type { NextRequest } from 'next/server'

export function getPublicOrigin(request: NextRequest): string {
  const dashboardUrl = process.env.DASHBOARD_URL
  if (dashboardUrl) {
    return new URL(dashboardUrl).origin
  }

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]
  const host = forwardedHost ?? request.headers.get('host')
  if (host) {
    const forwardedProto = request.headers
      .get('x-forwarded-proto')
      ?.split(',')[0]
    const proto = forwardedProto ?? request.nextUrl.protocol.replace(/:$/, '')
    return `${proto}://${host}`
  }

  return request.nextUrl.origin
}
