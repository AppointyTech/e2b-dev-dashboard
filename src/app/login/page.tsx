import type { OryPageParams } from '@ory/nextjs/app'
import { getDashboardLoginFlow } from '@/core/server/auth/ory/app-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { LoginCard } from './login-card'

// Dynamic: getLoginFlow reads per-request searchParams and headers.
export const dynamic = 'force-dynamic'

// getLoginFlow handles both legs of the OAuth2 login: a `login_challenge` from
// Hydra (creates the Kratos flow) and the resulting `?flow=` from Kratos.
export default async function OryLoginPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getDashboardLoginFlow(props.searchParams)

  // null only on unrecoverable error (getLoginFlow has already redirected).
  if (!flow) {
    return null
  }

  return <LoginCard flow={flow} config={config} />
}
