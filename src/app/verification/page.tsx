import { getVerificationFlow, type OryPageParams } from '@ory/nextjs/app'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { VerificationCard } from './verification-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryVerificationPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getVerificationFlow(config, props.searchParams)

  if (!flow) {
    return null
  }

  return <VerificationCard flow={flow} config={config} />
}
