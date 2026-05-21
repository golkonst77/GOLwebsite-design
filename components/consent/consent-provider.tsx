'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readConsent, writeConsent, type GolConsent } from '@/lib/consent-storage'

type ConsentContextValue = {
  consent: GolConsent | null
  hasStoredConsent: boolean
  showBanner: boolean
  showSettings: boolean
  pendingAnalytics: boolean
  setPendingAnalytics: (value: boolean) => void
  acceptAll: () => void
  rejectAnalytics: () => void
  saveSettings: () => void
  openSettings: () => void
  closeSettings: () => void
  dismissBanner: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return ctx
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<GolConsent | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [pendingAnalytics, setPendingAnalytics] = useState(false)

  useEffect(() => {
    const stored = readConsent()
    setConsent(stored)
    setShowBanner(!stored)
    if (stored) {
      setPendingAnalytics(stored.analytics)
    }
    setHydrated(true)
  }, [])

  const persist = useCallback((essential: boolean, analytics: boolean) => {
    const saved = writeConsent({ essential, analytics })
    setConsent(saved)
    setPendingAnalytics(analytics)
    setShowBanner(false)
    setShowSettings(false)
  }, [])

  const acceptAll = useCallback(() => {
    persist(true, true)
  }, [persist])

  const rejectAnalytics = useCallback(() => {
    persist(true, false)
  }, [persist])

  const saveSettings = useCallback(() => {
    persist(true, pendingAnalytics)
  }, [persist, pendingAnalytics])

  const openSettings = useCallback(() => {
    const stored = readConsent()
    setPendingAnalytics(stored?.analytics ?? false)
    setShowSettings(true)
    setShowBanner(true)
  }, [])

  const closeSettings = useCallback(() => {
    setShowSettings(false)
    if (consent) {
      setShowBanner(false)
    }
  }, [consent])

  const dismissBanner = useCallback(() => {
    setShowBanner(false)
    setShowSettings(false)
  }, [])

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasStoredConsent: hydrated && consent !== null,
      showBanner: hydrated && showBanner,
      showSettings,
      pendingAnalytics,
      setPendingAnalytics,
      acceptAll,
      rejectAnalytics,
      saveSettings,
      openSettings,
      closeSettings,
      dismissBanner,
    }),
    [
      consent,
      hydrated,
      showBanner,
      showSettings,
      pendingAnalytics,
      acceptAll,
      rejectAnalytics,
      saveSettings,
      openSettings,
      closeSettings,
      dismissBanner,
    ],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
