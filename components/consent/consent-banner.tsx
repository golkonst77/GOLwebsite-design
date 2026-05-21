'use client'

import Link from 'next/link'
import { useConsent } from './consent-provider'

export function ConsentBanner() {
  const {
    showBanner,
    showSettings,
    pendingAnalytics,
    setPendingAnalytics,
    acceptAll,
    rejectAnalytics,
    saveSettings,
    openSettings,
    closeSettings,
  } = useConsent()

  if (!showBanner) return null

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 pt-2 pointer-events-none"
        role="dialog"
        aria-label="Настройки cookies"
      >
        <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0b0b14]/95 p-4 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-5">
          {!showSettings ? (
            <>
              <p className="text-sm font-semibold tracking-wide text-foreground">Cookies и аналитика</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Мы используем необходимые cookies для работы сайта. Аналитику подключаем только с вашего
                согласия.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-[44px] rounded-full border border-gold/50 bg-gold px-5 text-sm font-semibold text-black transition-colors hover:bg-[#e4c55e]"
                >
                  Принять
                </button>
                <button
                  type="button"
                  onClick={rejectAnalytics}
                  className="min-h-[44px] rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:text-foreground"
                >
                  Только необходимые
                </button>
                <button
                  type="button"
                  onClick={openSettings}
                  className="min-h-[44px] rounded-full border border-white/10 px-5 text-sm font-medium text-white/60 transition-colors hover:text-gold/90"
                >
                  Настройки
                </button>
                <Link
                  href="/privacy"
                  className="inline-flex min-h-[44px] items-center justify-center px-2 text-sm text-white/50 transition-colors hover:text-gold/90"
                >
                  Политика
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <p className="text-sm font-semibold text-foreground">Настройки cookies</p>
                <button
                  type="button"
                  onClick={closeSettings}
                  className="text-xl leading-none text-white/40 transition-colors hover:text-foreground"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-sm font-medium text-foreground">Необходимые cookies</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    Обеспечивают работу сайта и формы заявки. Всегда активны.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Аналитика</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/50">
                        Статистика посещений — только после вашего согласия.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pendingAnalytics}
                      onChange={(e) => setPendingAnalytics(e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded border-white/20 accent-[#d4af37]"
                    />
                  </label>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                Отозвать согласие:{' '}
                <a
                  href="mailto:golwebstudio@mail.ru"
                  className="text-gold/80 hover:text-gold underline underline-offset-2"
                >
                  golwebstudio@mail.ru
                </a>
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="min-h-[44px] flex-1 rounded-full border border-gold/50 bg-gold px-5 text-sm font-semibold text-black hover:bg-[#e4c55e]"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={rejectAnalytics}
                  className="min-h-[44px] flex-1 rounded-full border border-white/15 px-5 text-sm font-medium text-white/70 hover:text-foreground"
                >
                  Только необходимые
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
