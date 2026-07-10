'use client'

import { Verification } from '@ory/elements-react/theme'
import type { ComponentProps } from 'react'
import { oryComponents } from '@/app/login/components'

type VerificationProps = ComponentProps<typeof Verification>

type VerificationCardProps = Pick<VerificationProps, 'config'> & {
  flow: unknown
}

export function VerificationCard({
  flow,
  config,
}: VerificationCardProps) {
  return (
    <Verification
      flow={flow as VerificationProps['flow']}
      config={config}
      components={oryComponents}
    />
  )
}
