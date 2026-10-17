'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ConsentProvider } from './consent-provider'
import { ConsentBanner } from './consent-banner'

export function ConsentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ConsentProvider>
      {children}
      {pathname !== "/" && <ConsentBanner />}
    </ConsentProvider>
  )
}
