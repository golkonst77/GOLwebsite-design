'use client'

import { useConsent } from './consent-provider'

export function ConsentSettingsButton() {
  const { openSettings } = useConsent()
  return <button type="button" onClick={openSettings} className="min-h-11 text-left">Настройки cookies</button>
}
