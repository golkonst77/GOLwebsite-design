'use client'

import type { ReactNode } from 'react'
import { ConsentProvider } from './consent-provider'
import { ConsentBanner } from './consent-banner'

export function ConsentShell({ children }: { children: ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <ConsentBanner />
    </ConsentProvider>
  )
}
