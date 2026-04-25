'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const stats: Array<{ value: string; label: string }> = []

const guarantees = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Работаем по договору',
    description: 'Фиксируем объём, этапы и сроки до старта.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Показываем процесс',
    description: 'На каждом этапе понятно, что происходит и что будет дальше.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Не пропадаем после запуска',
    description: 'Помогаем с правками и вопросами после запуска.',
  },
]

export default function Trust() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Stats */}
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 border border-border bg-card/30"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-neon-green mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Guarantees */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Работаем <span className="text-neon-green">прозрачно</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guarantees.map((guarantee, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 border border-border bg-card/30"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green">
                  {guarantee.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{guarantee.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {guarantee.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
