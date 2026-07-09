import { getLoginFlow, type OryPageParams } from '@ory/nextjs/app'
import { redirectToOryBrowserFlowIfMissing } from '@/core/server/auth/ory/browser-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { LoginCard } from './login-card'

// Dynamic: getLoginFlow reads per-request searchParams and headers.
export const dynamic = 'force-dynamic'

// Start the browser flow through our same-origin /self-service proxy; after
// Kratos redirects back with ?flow=, getLoginFlow renders that existing flow.
export default async function OryLoginPage(props: OryPageParams) {
  const searchParams = await redirectToOryBrowserFlowIfMissing(
    'login',
    props.searchParams
  )
  const config = await getOryConfigForRequest()
  const flow = await getLoginFlow(config, searchParams)

  // null only on unrecoverable error (getLoginFlow has already redirected).
  if (!flow) {
    return null
  }

  return <LoginCard flow={flow} config={config} />
}
