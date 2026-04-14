'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'
import LeadForm from './lead-form'

const solutions = [
  {
    number: '01',
    title: 'Конверсионный дизайн',
    description: 'Не просто красиво — эффективно. Каждый элемент работает на результат: заявки, продажи, звонки.',
    metric: '+45% конверсии',
  },
  {
    number: '02',
    title: 'Быстрая разработка',
    description: 'От брифа до запуска за 2-3 недели. Чёткие сроки, прозрачный процесс, никаких сюрпризов.',
    metric: '14-21 день',
  },
  {
    number: '03',
    title: 'Понятная цена',
    description: 'Фиксированная стоимость без скрытых платежей. Знаете точно, сколько платите и за что.',
    metric: 'от 50 000 ₽',
  },
  {
    number: '04',
    title: 'Гарантия результата',
    description: 'Работаем до результата. Если что-то не так — исправляем бесплатно до полного согласования.',
    metric: '100% гарантия',
  },
]

export default function Solution() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <p className="text-neon-green text-sm tracking-[0.3em] uppercase mb-4">
              Решение
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Мы знаем, <span className="text-neon-green">как это работает</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
              50+ проектов. Средний рост конверсии — 45%. Это не магия. Это опыт и методология.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="group p-6 border border-border bg-card/30 hover:border-neon-green/30 transition-all duration-300"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-5">
                    <span className="text-2xl font-bold text-neon-green/30 group-hover:text-neon-green/60 transition-colors">
                      {solution.number}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-neon-green transition-colors">
                          {solution.title}
                        </h3>
                        <span className="text-xs tracking-wider text-neon-green border border-neon-green/30 px-2 py-1 uppercase whitespace-nowrap">
                          {solution.metric}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <div className="p-8 border border-neon-green/30 bg-card/50">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  Получите бесплатную консультацию
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Разберём ваш проект, дадим рекомендации и назовём точную стоимость.
                </p>
                <LeadForm variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
