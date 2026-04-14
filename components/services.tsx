'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const services = [
  {
    icon: '01',
    title: 'Лендинги',
    description: 'Страницы, которые продают. Не просто красивая картинка — конверсионная машина с чёткой структурой и призывом к действию.',
    highlight: '+45% конверсии',
  },
  {
    icon: '02',
    title: 'Корпоративные сайты',
    description: 'Ваш бизнес заслуживает большего. Профессиональный сайт, который внушает доверие и работает 24/7.',
    highlight: 'Полный цикл',
  },
  {
    icon: '03',
    title: 'Редизайн',
    description: 'Старый сайт тянет вниз? Обновим до стандартов 2026 года. Современный вид, улучшенный UX, рост метрик.',
    highlight: '+30% трафика',
  },
  {
    icon: '04',
    title: 'Техническая поддержка',
    description: 'Не бросаем после сдачи. Обновления, правки, консультации. Ваш сайт всегда в форме.',
    highlight: '24/7 поддержка',
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="services" className="py-24 md:py-40 px-6 relative overflow-hidden" ref={ref}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-neon-green/5 blur-3xl rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-neon-green text-sm tracking-[0.4em] uppercase mb-4 font-medium">
            Что мы делаем
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Услуги
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-16">
            Каждый проект — это инвестиция. Мы делаем так, чтобы она окупилась.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative border border-border p-8 md:p-10 hover:border-neon-green/50 transition-all duration-500 bg-card/50 backdrop-blur-sm overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold text-neon-green/20 group-hover:text-neon-green/40 transition-colors duration-500">
                      {service.icon}
                    </span>
                    <span className="text-xs tracking-widest text-neon-green border border-neon-green/30 px-3 py-1 uppercase">
                      {service.highlight}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-neon-green transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 text-neon-green opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-sm tracking-widest uppercase">Подробнее</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
