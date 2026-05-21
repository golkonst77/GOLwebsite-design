'use client'

import Link from 'next/link'
import { useConsent } from '@/components/consent/consent-provider'

export function FooterLegalLinks() {
  const { openSettings, hasStoredConsent } = useConsent()

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-start">
      <Link
        href="/privacy"
        className="text-sm text-white/40 transition-colors hover:text-gold/90"
      >
        Политика конфиденциальности
      </Link>
      {hasStoredConsent ? (
        <button
          type="button"
          onClick={openSettings}
          className="text-sm text-white/40 transition-colors hover:text-gold/90"
        >
          Настройки cookies
        </button>
      ) : null}
    </div>
  )
}
