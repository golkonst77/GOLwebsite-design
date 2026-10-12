'use client'

import { useRef, type ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { ConsentProvider, useConsent } from './consent-provider'
import { ConsentBanner } from './consent-banner'

function ConsentAnalytics() {
  const { consent } = useConsent()
  const allowed = useRef(false)
  allowed.current = consent?.analytics === true
  return process.env.NODE_ENV === 'production' && allowed.current
    ? <Analytics beforeSend={event => allowed.current ? event : null} />
    : null
}

export function ConsentShell({ children }: { children: ReactNode }) {
  return (
    <ConsentProvider>
      {children}
      <ConsentBanner />
      <ConsentAnalytics />
    </ConsentProvider>
  )
}
