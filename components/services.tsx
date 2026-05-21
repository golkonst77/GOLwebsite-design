'use client'

import { useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

const services = [
  {
    number: '01',
    title: 'Веб-дизайн',
    description:
      'Структура, оффер и визуальная подача, чтобы с первого экрана было понятно, почему выбрать вас.',
    tags: ['Структура', 'Оффер', 'Визуал'],
    result: 'Сайт становится понятнее и быстрее ведёт к обращению.',
  },
  {
    number: '02',
    title: 'Разработка',
    description:
      'Быстрый современный сайт на Next.js: адаптив, скорость, аккуратная реализация и чистый код.',
    tags: ['Next.js', 'Адаптив', 'Скорость'],
    result: 'Сайт работает стабильно на desktop и mobile.',
  },
  {
    number: '03',
    title: 'Лендинги',
    description:
      'Одностраничные сайты под конкретную услугу, запуск, рекламу или тестирование спроса.',
    tags: ['Услуга', 'Заявки', 'Запуск'],
    result: 'Пользователь быстро понимает предложение и следующий шаг.',
  },
  {
    number: '04',
    title: 'Поддержка',
    description:
      'Не пропадаем после запуска: помогаем с правками, текстами, блоками и развитием сайта.',
    tags: ['Правки', 'Контент', 'Развитие'],
    result: 'Сайт можно спокойно улучшать после публикации.',
  },
] as const

type Service = (typeof services)[number]

function ServicePreview({ service }: { service: Service }) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-white/[0.025] p-8 shadow-[0_0_80px_rgba(212,175,55,0.08)] transition-all duration-500 md:p-10">
      <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-gold/80">
        {service.number}
      </p>
      <h3 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-gold md:text-3xl">
        {service.title}
      </h3>
      <p className="mb-6 text-base leading-relaxed text-white/70">{service.description}</p>
      <div className="mb-8 flex flex-wrap gap-2">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-xs tracking-wide text-gold"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="border-t border-white/10 pt-6">
        <p className="mb-2 text-xs font-medium tracking-[0.14em] uppercase text-white/45">
          Что получает клиент
        </p>
        <p className="text-sm leading-relaxed text-white/80 md:text-base">{service.result}</p>
      </div>
    </div>
  )
}

function ServiceArrow({ active }: { active: boolean }) {
  return (
    <svg
      className={`h-6 w-6 shrink-0 transition-all duration-500 md:h-7 md:w-7 ${
        active
          ? 'translate-x-1 text-gold'
          : 'text-white/35 group-hover:translate-x-0.5 group-hover:text-gold/80'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [activeIndex, setActiveIndex] = useState(0)

  const activeService = services[activeIndex]

  return (
    <section
      id="services"
      className="relative overflow-hidden px-6 pt-8 pb-8 md:px-12 md:pt-12 md:pb-12 lg:pt-16 lg:pb-14"
      ref={ref}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div
          className={`mb-6 transition-all duration-1000 md:mb-8 lg:mb-8 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <p className="mb-3 text-sm tracking-[0.4em] uppercase text-gold md:mb-4">Услуги</p>
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.02em] md:text-6xl lg:text-7xl">
            <span className="text-foreground">Что мы</span>{' '}
            <span className="text-gradient-gold">создаём</span>
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 gap-8 transition-all duration-1000 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-12 ${
            isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Список услуг */}
          <div className="border-t border-border/50">
            {services.map((service, index) => {
              const isActive = activeIndex === index

              return (
                <div
                  key={service.number}
                  className={`group border-b border-border/50 transition-colors duration-500 ${
                    isActive ? 'bg-white/[0.025]' : 'hover:bg-white/[0.015]'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <button
                    type="button"
                    className={`flex w-full items-start gap-4 border-l-2 py-5 text-left transition-colors duration-500 md:gap-6 md:py-6 ${
                      isActive ? 'border-gold' : 'border-transparent'
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={isActive}
                  >
                    <span
                      className={`w-10 shrink-0 pt-1 font-mono text-sm transition-colors duration-500 ${
                        isActive ? 'text-gold/90' : 'text-white/40'
                      }`}
                    >
                      {service.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-2xl font-bold tracking-[-0.02em] transition-colors duration-500 md:text-4xl lg:text-[2.5rem] lg:leading-[1.05] ${
                          isActive
                            ? 'text-gold'
                            : 'text-white/60 group-hover:text-white/85'
                        }`}
                      >
                        {service.title}
                      </h3>
                      <p
                        className={`mt-2 max-w-xl text-sm leading-relaxed transition-colors duration-500 md:text-base ${
                          isActive
                            ? 'text-white/70'
                            : 'text-white/45 group-hover:text-white/60'
                        }`}
                      >
                        {service.description}
                      </p>
                    </div>

                    <ServiceArrow active={isActive} />
                  </button>

                  {/* Mobile / tablet: детали под строкой */}
                  <div className="pb-5 pl-14 pr-2 lg:hidden">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-xs text-gold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="mb-1 text-xs font-medium tracking-[0.12em] uppercase text-white/45">
                        Что получает клиент
                      </p>
                      <p className="text-sm leading-relaxed text-white/80">{service.result}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: sticky preview */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ServicePreview service={activeService} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
