import type { OryPageParams } from '@ory/nextjs/app'
import { getDashboardVerificationFlow } from '@/core/server/auth/ory/app-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { VerificationCard } from './verification-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryVerificationPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getDashboardVerificationFlow(props.searchParams)

  if (!flow) {
    return null
  }

  return <VerificationCard flow={flow} config={config} />
}
