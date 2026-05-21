export const CONSENT_STORAGE_KEY = 'gol_consent_v1'
export const CONSENT_POLICY_VERSION = '1.0'

export type GolConsent = {
  essential: boolean
  analytics: boolean
  timestamp: string
  version: string
}

export function readConsent(): GolConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GolConsent
    if (typeof parsed.essential !== 'boolean' || typeof parsed.analytics !== 'boolean') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeConsent(partial: Pick<GolConsent, 'essential' | 'analytics'>): GolConsent {
  const data: GolConsent = {
    essential: partial.essential,
    analytics: partial.analytics,
    timestamp: new Date().toISOString(),
    version: CONSENT_POLICY_VERSION,
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data))
  }
  return data
}
