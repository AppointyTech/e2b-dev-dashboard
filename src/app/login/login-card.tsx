'use client'

import { Login } from '@ory/elements-react/theme'
import type { ComponentProps } from 'react'
import { oryComponents } from './components'

// Derive props from <Login>: two @ory/client-fetch copies are installed, so
// naming the LoginFlow type directly would mismatch.
type LoginProps = ComponentProps<typeof Login>

type LoginCardProps = Pick<LoginProps, 'config'> & {
  flow: unknown
}

export function LoginCard({
  flow,
  config,
}: LoginCardProps) {
  return (
    <Login
      flow={flow as LoginProps['flow']}
      config={config}
      components={oryComponents}
    />
  )
}
