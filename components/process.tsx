'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Брифинг',
    description: 'Глубокое погружение в ваш бизнес. Цели, аудитория, конкуренты. Понимаем задачу на 100%.',
    duration: '1-2 дня',
  },
  {
    number: '02',
    title: 'Прототип',
    description: 'Структура и логика. Wireframes, которые показывают, как будет работать сайт.',
    duration: '2-3 дня',
  },
  {
    number: '03',
    title: 'Дизайн',
    description: 'Визуальная концепция. Уникальный стиль, который выделит вас среди конкурентов.',
    duration: '5-7 дней',
  },
  {
    number: '04',
    title: 'Разработка',
    description: 'Код, который работает. Быстрый, адаптивный, оптимизированный под SEO.',
    duration: '5-7 дней',
  },
  {
    number: '05',
    title: 'Запуск',
    description: 'Тестирование, правки, деплой. Ваш сайт готов к работе и приёму клиентов.',
    duration: '1-2 дня',
  },
]

export default function Process() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="process" className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-neon-blue/5 blur-3xl rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-neon-blue text-sm tracking-[0.4em] uppercase mb-4 font-medium">
            Как мы работаем
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Процесс
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-16">
            От идеи до запуска за 2-3 недели. Прозрачно, чётко, без сюрпризов.
          </p>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-[60px] top-0 bottom-0 w-px bg-gradient-to-b from-neon-green via-neon-blue to-transparent" />
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group flex gap-8 items-start"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Number circle */}
                  <div className="hidden md:flex flex-shrink-0 w-[120px] items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-neon-green/30 group-hover:border-neon-green flex items-center justify-center transition-all duration-500 group-hover:glow-green bg-background">
                      <span className="text-sm font-bold text-neon-green">{step.number}</span>
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <div className="flex-1 border border-border p-6 md:p-8 bg-card/30 backdrop-blur-sm group-hover:border-neon-green/30 transition-all duration-500">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="md:hidden text-neon-green font-bold">{step.number}</span>
                        <h3 className="text-xl md:text-2xl font-bold group-hover:text-neon-green transition-colors duration-300">
                          {step.title}
                        </h3>
                      </div>
                      <span className="text-xs tracking-widest text-neon-blue border border-neon-blue/30 px-3 py-1 uppercase w-fit">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total timeline */}
          <div className="mt-16 p-8 border border-neon-green/30 bg-neon-green/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm tracking-widest text-neon-green uppercase mb-2">Общий срок</p>
              <p className="text-3xl md:text-4xl font-bold">2-3 недели</p>
            </div>
            <button className="px-8 py-4 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-widest uppercase text-sm">
              Обсудить проект
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
