'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const cases = [
  {
    id: 1,
    title: 'E-commerce платформа',
    category: 'Интернет-магазин',
    description: 'Полный редизайн и оптимизация конверсии для онлайн-ритейлера.',
    metrics: [
      { label: 'Рост конверсии', value: '+67%', color: 'green' },
      { label: 'Снижение отказов', value: '-42%', color: 'blue' },
      { label: 'Срок разработки', value: '3 нед', color: 'white' },
    ],
  },
  {
    id: 2,
    title: 'SaaS Dashboard',
    category: 'B2B Продукт',
    description: 'Интуитивный интерфейс для сложной аналитической платформы.',
    metrics: [
      { label: 'Удержание', value: '+89%', color: 'green' },
      { label: 'NPS Score', value: '72', color: 'blue' },
      { label: 'Time to value', value: '-50%', color: 'white' },
    ],
  },
  {
    id: 3,
    title: 'Финтех лендинг',
    category: 'Посадочная страница',
    description: 'Высококонверсионный лендинг для запуска нового финансового продукта.',
    metrics: [
      { label: 'Конверсия', value: '12.4%', color: 'green' },
      { label: 'Заявок в день', value: '340+', color: 'blue' },
      { label: 'Скорость', value: '98/100', color: 'white' },
    ],
  },
]

export default function Cases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="cases" className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      {/* Background accent */}
      <div className="absolute top-1/2 right-0 w-1/2 h-1/2 bg-neon-green/5 blur-3xl rounded-full transform -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-neon-green text-sm tracking-[0.4em] uppercase mb-4 font-medium">
            Результаты
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Кейсы
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-16">
            Не просто портфолио — доказательства. Цифры говорят сами за себя.
          </p>

          <div className="space-y-8">
            {cases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="group border border-border bg-card/30 backdrop-blur-sm hover:border-neon-green/50 transition-all duration-500 overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="p-8 md:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    {/* Left content */}
                    <div className="flex-1">
                      <p className="text-xs tracking-[0.3em] text-neon-blue uppercase mb-4">
                        {caseItem.category}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-neon-green transition-colors duration-300">
                        {caseItem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-xl">
                        {caseItem.description}
                      </p>
                      
                      <button className="mt-6 flex items-center gap-2 text-neon-green opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        <span className="text-sm tracking-widest uppercase">Смотреть кейс</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-6">
                      {caseItem.metrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className={`p-4 md:p-6 border min-w-[120px] text-center ${
                            metric.color === 'green' 
                              ? 'border-neon-green/30 bg-neon-green/5' 
                              : metric.color === 'blue'
                              ? 'border-neon-blue/30 bg-neon-blue/5'
                              : 'border-border bg-card/50'
                          }`}
                        >
                          <div className={`text-2xl md:text-3xl font-bold mb-2 ${
                            metric.color === 'green' 
                              ? 'text-neon-green text-glow-green' 
                              : metric.color === 'blue'
                              ? 'text-neon-blue text-glow-blue'
                              : 'text-foreground'
                          }`}>
                            {metric.value}
                          </div>
                          <div className="text-xs tracking-widest text-muted-foreground uppercase">
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
            <button className="px-10 py-5 border-2 border-neon-green text-neon-green font-bold hover:bg-neon-green hover:text-background transition-all duration-300 tracking-widest uppercase text-sm hover:glow-green">
              Все кейсы
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
