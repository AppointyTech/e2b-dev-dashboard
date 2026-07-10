import { type NextRequest, NextResponse } from 'next/server'
import { PROTECTED_URLS } from '@/configs/urls'
import { getPublicOrigin } from '@/core/server/auth/ory/public-origin'

export function GET(request: NextRequest) {
  const redirectUrl = new URL(PROTECTED_URLS.DASHBOARD, getPublicOrigin(request))
  redirectUrl.search = request.nextUrl.search
  redirectUrl.searchParams.set('tab', 'terminal')

  return NextResponse.redirect(redirectUrl)
}
