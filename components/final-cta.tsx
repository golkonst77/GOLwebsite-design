'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 md:py-32 px-6 relative overflow-hidden">
      {/* Background Ø */}
      <div className="absolute inset-0 flex items-center justify-center opacity-3 pointer-events-none">
        <div className="text-[300px] md:text-[500px] font-bold">Ø</div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center" ref={ref}>
        <div
          className={`transform transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-7xl font-bold mb-8 tracking-tight text-pretty">
            Готовы к переменам?
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Пора создать дизайн, который работает. Минимализм, который привлекает. Решение, которое впечатляет.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-8 py-4 bg-foreground text-background font-medium hover:opacity-80 transition-all hover:shadow-lg hover:shadow-white/20 text-lg">
              Оставить заявку
            </button>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-all text-lg"
            >
              Написать в Telegram
            </a>
          </div>

          <p className="text-muted-foreground text-sm mt-8">
            Ответим в течение 24 часов
          </p>
        </div>
      </div>
    </section>
  )
}
