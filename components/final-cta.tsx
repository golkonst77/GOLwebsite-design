'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'
import LeadForm from './lead-form'

const TELEGRAM_URL = 'https://t.me/teodor77'
const EMAIL = 'golwebstudio@mail.ru'

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.013.103.03.336.017.519z" />
    </svg>
  )
}

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener('mousemove', handleMouseMove)
      return () => section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-x-hidden px-6 py-14 md:px-12 md:py-20 lg:py-24"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
            linear-gradient(180deg, var(--background) 0%, #0a0a15 100%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span
          className="text-[40vw] font-bold leading-none text-transparent select-none"
          style={{
            WebkitTextStroke: '1px rgba(212, 175, 55, 0.05)',
          }}
        >
          GØL
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl" ref={ref}>
        <div
          className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
            <div className="text-center lg:text-left">
              <p className="mb-5 text-sm tracking-[0.4em] uppercase text-gold">Связаться</p>

              <h2 className="mb-5 text-3xl font-bold leading-[0.95] tracking-[-0.02em] text-foreground md:text-5xl lg:text-[2.75rem] lg:leading-[0.95] xl:text-6xl">
                Есть задача по сайту?
              </h2>

              <p className="mx-auto mb-8 max-w-md text-base font-light text-muted-foreground md:text-lg lg:mx-0">
                Напишите пару слов о задаче —
                <br className="hidden sm:block" />
                ответим и подскажем, с чего лучше начать.
              </p>

              <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 lg:mx-0 lg:max-w-sm lg:items-stretch">
                <a
                  href="#contact-form"
                  className="group relative inline-flex w-full items-center justify-center gap-3 rounded-full bg-gold px-10 py-5 text-background shadow-[0_18px_50px_rgba(212,175,55,0.18)] transition-transform duration-500 ease-out supports-[hover:hover]:hover:-translate-y-[1px] active:translate-y-0"
                >
                  <span className="text-sm tracking-[0.2em] uppercase">Обсудить сайт</span>
                </a>

                <div className="flex w-full flex-col items-center lg:items-stretch">
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.08] lg:justify-start"
                  >
                    <TelegramIcon className="h-4 w-4 shrink-0 text-gold/90 transition-colors group-hover:text-gold" />
                    <span className="font-medium tracking-wide text-white/90 group-hover:text-gold">@teodor77</span>
                  </a>
                  <p className="mt-2 text-center text-xs text-white/45 lg:text-left">
                    Быстрее всего отвечаем именно там.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1.5 lg:items-start">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex min-h-[44px] items-center text-sm text-white/60 transition-colors duration-300 hover:text-gold/90"
                  >
                    {EMAIL}
                  </a>

                  <p className="text-center text-xs tracking-[0.12em] text-white/45 lg:text-left">
                    Ответим в течение дня · работаем по договору
                  </p>
                </div>
              </div>
            </div>

            <div id="contact-form" className="w-full scroll-mt-24 text-left lg:pt-1">
              <LeadForm variant="contact" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
