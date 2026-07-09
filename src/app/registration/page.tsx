import { getRegistrationFlow, type OryPageParams } from '@ory/nextjs/app'
import { redirectToOryBrowserFlowIfMissing } from '@/core/server/auth/ory/browser-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { RegistrationCard } from './registration-card'

export const dynamic = 'force-dynamic'

// Mirrors /login; see src/app/login/page.tsx.
export default async function OryRegistrationPage(props: OryPageParams) {
  const searchParams = await redirectToOryBrowserFlowIfMissing(
    'registration',
    props.searchParams
  )
  const config = await getOryConfigForRequest()
  const flow = await getRegistrationFlow(config, searchParams)

  if (!flow) {
    return null
  }

  return <RegistrationCard flow={flow} config={config} />
}
