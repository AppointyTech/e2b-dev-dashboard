import { getRecoveryFlow, type OryPageParams } from '@ory/nextjs/app'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { RecoveryCard } from './recovery-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryRecoveryPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getRecoveryFlow(config, props.searchParams)

  if (!flow) {
    return null
  }

  return <RecoveryCard flow={flow} config={config} />
}
