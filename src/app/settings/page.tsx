import type { OryPageParams } from '@ory/nextjs/app'
import { getSettingsProfile } from '@/core/server/auth'
import { getDashboardSettingsFlow } from '@/core/server/auth/ory/app-flow'
import { getOryConfigForRequest } from '@/core/server/auth/ory/request-config'
import { SettingsCards } from './settings-cards'

export const dynamic = 'force-dynamic'

// Ory-driven settings page, intentionally separate from /dashboard/account.
// It needs only a Kratos session (getSettingsFlow + getSettingsProfile read the
// session/identity, not e2b_session) — so the post-recovery password reset works
// before any Hydra token exists, even for an identity not yet bootstrapped (no
// external_id). Name/e-mail are shown read-only for reference; editing the
// account profile stays on the gated /dashboard/account page.
export default async function SettingsPage(props: OryPageParams) {
  const config = await getOryConfigForRequest()
  const flow = await getDashboardSettingsFlow(props.searchParams)

  // getSettingsFlow has already redirected (created a flow / surfaced login).
  if (!flow) {
    return null
  }

  const profile = await getSettingsProfile()

  return (
    <SettingsCards
      flow={flow}
      config={config}
      name={profile?.name ?? null}
      email={profile?.email ?? null}
    />
  )
}
