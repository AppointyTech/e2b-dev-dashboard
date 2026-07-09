import { getVerificationFlow, type OryPageParams } from '@ory/nextjs/app'
import { redirectToOryBrowserFlowIfMissing } from '@/core/server/auth/ory/browser-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { VerificationCard } from './verification-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryVerificationPage(props: OryPageParams) {
  const searchParams = await redirectToOryBrowserFlowIfMissing(
    'verification',
    props.searchParams
  )
  const config = await getOryConfigForRequest()
  const flow = await getVerificationFlow(config, searchParams)

  if (!flow) {
    return null
  }

  return <VerificationCard flow={flow} config={config} />
}
