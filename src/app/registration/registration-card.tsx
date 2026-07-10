'use client'

import { Registration } from '@ory/elements-react/theme'
import type { ComponentProps } from 'react'
import { oryComponents } from '@/app/login/components'

type RegistrationProps = ComponentProps<typeof Registration>

type RegistrationCardProps = Pick<RegistrationProps, 'config'> & {
  flow: unknown
}

export function RegistrationCard({
  flow,
  config,
}: RegistrationCardProps) {
  return (
    <Registration
      flow={flow as RegistrationProps['flow']}
      config={config}
      components={oryComponents}
    />
  )
}
