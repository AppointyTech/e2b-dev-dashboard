'use client'

import { Recovery } from '@ory/elements-react/theme'
import type { ComponentProps } from 'react'
import { oryComponents } from '@/app/login/components'

type RecoveryProps = ComponentProps<typeof Recovery>

type RecoveryCardProps = Pick<RecoveryProps, 'config'> & {
  flow: unknown
}

export function RecoveryCard({
  flow,
  config,
}: RecoveryCardProps) {
  return (
    <Recovery
      flow={flow as RecoveryProps['flow']}
      config={config}
      components={oryComponents}
    />
  )
}
