'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const cases = [
  {
    id: 1,
    title: 'Сайт для бухгалтерской компании',
    category: 'Сайт услуг',
    description:
      'Было: клиенты не понимали, в чём разница и почему выбрать компанию.\nСделали: пересобрали структуру, оффер и подачу услуг.\nРезультат: сайт стал понятным и начал вести человека к обращению.',
    result: 'Результат: стало понятнее, за что вы платите и что делать дальше.',
    metrics: [
      { label: 'Понимание услуги', value: 'выше' },
      { label: 'Ценность', value: 'яснее' },
      { label: 'Путь к заявке', value: 'понятнее' },
    ],
  },
  {
    id: 2,
    title: 'Сайт для локального бизнеса',
    category: 'Локальный бизнес',
    description:
      'Было: клиенты не понимали, в чём разница и почему выбрать компанию.\nСделали: пересобрали структуру, оффер и подачу услуг.\nРезультат: сайт стал понятным и начал вести человека к обращению.',
    result: 'Результат: проще разобраться и быстрее перейти к обращению.',
    metrics: [
      { label: 'Понимание услуги', value: 'выше' },
      { label: 'Ценность', value: 'яснее' },
      { label: 'Путь к заявке', value: 'понятнее' },
    ],
  },
  {
    id: 3,
    title: 'Сайт для услуг',
    category: 'Сайт услуг',
    description:
      'Было: клиенты не понимали, в чём разница и почему выбрать компанию.\nСделали: пересобрали структуру, оффер и подачу услуг.\nРезультат: сайт стал понятным и начал вести человека к обращению.',
    result: 'Результат: понятнее ценность и следующий шаг.',
    metrics: [
      { label: 'Понимание услуги', value: 'выше' },
      { label: 'Ценность', value: 'яснее' },
      { label: 'Путь к заявке', value: 'понятнее' },
    ],
  },
]

export default function Cases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="cases" className="py-14 md:py-20 lg:py-24 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-10 md:mb-12">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
              Результаты
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Кейсы клиентов
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
              Коротко: что было, что сделали и какой получился результат — без неподтверждённых цифр и обещаний.
            </p>
          </div>

          <div className="space-y-6">
            {cases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="group border border-border bg-card/30 hover:border-gold/30 transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Left content */}
                    <div className="flex-1">
                      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                        {caseItem.category}
                      </p>
                      <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground group-hover:text-gold transition-colors">
                        {caseItem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4 max-w-xl">
                        {caseItem.description}
                      </p>
                      <p className="text-sm text-gold font-medium">
                        {caseItem.result}
                      </p>
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-4">
                      {caseItem.metrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="p-4 border border-border bg-background/50 min-w-[100px] text-center"
                        >
                          <div className="text-xl md:text-2xl font-bold text-gold mb-1">
                            {metric.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border border-border bg-card/30 p-6 md:p-8">
            <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
              <div className="text-center md:text-left">
                <p className="text-lg font-semibold text-foreground">Похоже на вашу задачу?</p>
                <p className="mt-1 text-muted-foreground">
                  Разберём, какой сайт нужен именно вам.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#contact"
                  className="group relative inline-flex items-center gap-4 rounded-full bg-gold px-10 py-5 text-background shadow-[0_18px_50px_rgba(212,175,55,0.18)] transition-transform duration-500 ease-out overflow-hidden supports-[hover:hover]:hover:-translate-y-[1px] active:translate-y-0"
                >
                  <span className="absolute inset-0 bg-black/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <span className="relative z-10 text-sm tracking-[0.2em] uppercase">
                    Обсудить сайт
                  </span>
                </a>
                <p className="text-xs tracking-[0.14em] text-white/50">
                  Ответим в течение дня
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Есть задача по сайту?
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-4 border border-gold text-gold font-bold hover:bg-gold hover:text-background transition-all duration-300 tracking-wider uppercase text-sm"
            >
              Обсудить сайт
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
