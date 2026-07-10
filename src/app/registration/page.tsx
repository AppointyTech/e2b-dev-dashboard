import type { OryPageParams } from '@ory/nextjs/app'
import { getDashboardRegistrationFlow } from '@/core/server/auth/ory/app-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { RegistrationCard } from './registration-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryRegistrationPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getDashboardRegistrationFlow(props.searchParams)

  if (!flow) {
    return null
  }

  return <RegistrationCard flow={flow} config={config} />
}
