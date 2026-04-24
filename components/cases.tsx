'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const cases = [
  {
    id: 1,
    title: 'Лендинг для финтех-стартапа',
    category: 'Посадочная страница',
    description: 'Создали лендинг для запуска нового финансового продукта. Фокус на доверии и простоте регистрации.',
    result: 'Конверсия 12.4% — в 3 раза выше среднего по нише.',
    metrics: [
      { label: 'Конверсия', value: '12.4%' },
      { label: 'Заявок/день', value: '340+' },
      { label: 'Срок', value: '10 дней' },
    ],
  },
  {
    id: 2,
    title: 'Редизайн интернет-магазина',
    category: 'E-commerce',
    description: 'Полный редизайн и оптимизация конверсионной воронки для онлайн-ритейлера одежды.',
    result: 'Рост конверсии на 67% за первый месяц после запуска.',
    metrics: [
      { label: 'Рост конверсии', value: '+67%' },
      { label: 'Снижение отказов', value: '-42%' },
      { label: 'Срок', value: '3 нед' },
    ],
  },
  {
    id: 3,
    title: 'Корпоративный сайт IT-компании',
    category: 'Корпоративный сайт',
    description: 'Многостраничный сайт для B2B компании в сфере IT-услуг с интеграцией CRM.',
    result: 'Рост органического трафика на 89% за 3 месяца.',
    metrics: [
      { label: 'Рост трафика', value: '+89%' },
      { label: 'Время на сайте', value: '+2.5 мин' },
      { label: 'Срок', value: '3 нед' },
    ],
  },
]

export default function Cases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="cases" className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
              Результаты
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Кейсы клиентов
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
              Не просто портфолио — реальные результаты. Цифры говорят сами за себя.
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

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Хотите такие же результаты?
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-4 border border-gold text-gold font-bold hover:bg-gold hover:text-background transition-all duration-300 tracking-wider uppercase text-sm"
            >
              Обсудить ваш проект
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
