'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'
import LeadForm from './lead-form'

const solutions = [
  {
    number: '01',
    title: 'Чёткая структура',
    description: 'Собираем страницу так, чтобы с первого экрана было ясно: что вы делаете, для кого и чем полезны.',
    metric: '+45% конверсии',
  },
  {
    number: '02',
    title: 'Понятные смыслы',
    description: 'Упаковываем ценность в тексты и блоки, чтобы человек понял “почему вы” и не ушёл сравнивать дальше.',
    metric: '14-21 день',
  },
  {
    number: '03',
    title: 'Спокойный визуал',
    description: 'Делаем аккуратно и без перегрузки: дизайн поддерживает смысл, а не отвлекает от решения.',
    metric: 'от 50 000 ₽',
  },
  {
    number: '04',
    title: 'Действие без давления',
    description: 'Ведём к следующему шагу спокойно: понятные CTA, доверие и ясные ожидания по процессу.',
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
              Сайт должен объяснять, почему выбрать вас. Мы собираем структуру, тексты и визуал так, чтобы человек
              понял ценность и сделал следующий шаг.
              <br />
              <br />
              Чёткая структура. Понятные смыслы. Спокойный визуал. Действие без давления.
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
