'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Брифинг',
    description: 'Созваниваемся, обсуждаем задачи, цели, аудиторию. Понимаем, что вам нужно.',
    duration: '1-2 дня',
  },
  {
    number: '02',
    title: 'Прототип',
    description: 'Создаём структуру и логику сайта. Вы видите, как всё будет работать.',
    duration: '2-3 дня',
  },
  {
    number: '03',
    title: 'Дизайн',
    description: 'Разрабатываем визуал. Уникальный стиль, который выделит вас.',
    duration: '5-7 дней',
  },
  {
    number: '04',
    title: 'Разработка',
    description: 'Верстаем и программируем. Быстрый, адаптивный, SEO-оптимизированный код.',
    duration: '5-7 дней',
  },
  {
    number: '05',
    title: 'Запуск',
    description: 'Тестируем, вносим правки, запускаем. Ваш сайт готов к работе.',
    duration: '1-2 дня',
  },
]

export default function Process() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="process" className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
              Как мы работаем
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Процесс
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto">
              От первого звонка до запуска — 2-3 недели. Прозрачно и без сюрпризов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group p-6 border border-border bg-card/30 hover:border-gold/30 transition-all duration-300 text-center"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-gold/25 group-hover:text-gold/60 transition-colors mb-3">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-gold transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {step.description}
                </p>
                <span className="text-xs text-gold">
                  {step.duration}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 border border-gold/20 bg-gold/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Общий срок</p>
              <p className="text-2xl font-bold text-foreground">2-3 недели</p>
            </div>
            <a
              href="#contact"
              className="px-6 py-3 bg-gold text-background font-bold transition-all duration-300 tracking-wider uppercase text-sm"
            >
              Обсудить проект
            </a>
          </div>

          <p className="mt-6 text-sm text-white/60 text-center">
            От первого контакта до запуска — обычно 2–3 недели. Без спешки. Без лишнего.
          </p>
        </div>
      </div>
    </section>
  )
}
