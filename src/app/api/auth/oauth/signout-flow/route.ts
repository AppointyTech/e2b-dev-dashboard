import 'server-only'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ORY_POST_LOGOUT_PATH } from '@/core/server/auth/ory/signout'
import { getRequestOrigin } from '@/core/server/request-origin'

export function GET(request: NextRequest) {
  const origin = getRequestOrigin(request)
  return NextResponse.redirect(new URL(ORY_POST_LOGOUT_PATH, origin))
}
