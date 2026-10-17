'use client'

import { Analytics } from '@vercel/analytics/next'
import { readConsent } from '@/lib/consent-storage'
import { useConsent } from './consent-provider'

export function ConsentAnalytics() {
  const { consent } = useConsent()
  return consent?.analytics ? <Analytics beforeSend={event => readConsent()?.analytics ? event : null} /> : null
}
