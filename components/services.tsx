'use client'

import { useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

const services = [
  {
    title: 'Веб-дизайн',
    description: 'Уникальные визуальные решения, которые захватывают внимание и передают суть бренда.',
    tags: ['UI/UX', 'Брендинг', 'Прототипирование'],
  },
  {
    title: 'Разработка',
    description: 'Современные технологии, чистый код, безупречная производительность на любых устройствах.',
    tags: ['Next.js', 'React', 'Анимации'],
  },
  {
    title: 'Лендинги',
    description: 'Посадочные страницы с высокой конверсией. Продуманная структура, сильные офферы.',
    tags: ['Конверсия', 'A/B тесты', 'Аналитика'],
  },
  {
    title: 'Поддержка',
    description: 'Развитие и сопровождение проектов. Техническая поддержка, обновления, консультации.',
    tags: ['Мониторинг', 'Обновления', '24/7'],
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section 
      id="services" 
      className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <div 
          className={`mb-20 md:mb-32 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-sm tracking-[0.4em] uppercase text-gold mb-6">
            Услуги
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] max-w-3xl">
            <span className="text-foreground">Что мы</span>{' '}
            <span className="text-gradient-gold">создаём</span>
          </h2>
        </div>

        {/* Services list */}
        <div className="space-y-0">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative border-t border-border/50 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="py-10 md:py-16 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 cursor-pointer transition-all duration-500"
                style={{
                  transform: hoveredIndex === index ? 'translateX(20px)' : 'translateX(0)',
                }}
              >
                {/* Number */}
                <span className="text-sm text-muted-foreground font-mono w-12 flex-shrink-0">
                  0{index + 1}
                </span>

                {/* Title */}
                <h3 
                  className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] flex-1 text-foreground transition-colors duration-300"
                  style={{
                    color: hoveredIndex === index ? '#d4af37' : undefined,
                  }}
                >
                  {service.title}
                </h3>

                {/* Description - visible on hover */}
                <div 
                  className="md:max-w-sm transition-all duration-500"
                  style={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-3 py-1 text-xs border border-gold/30 text-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <svg 
                  className="w-8 h-8 text-gold transition-all duration-500 flex-shrink-0"
                  style={{
                    opacity: hoveredIndex === index ? 1 : 0.3,
                    transform: hoveredIndex === index ? 'translateX(10px)' : 'translateX(0)',
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Hover background */}
              <div 
                className="absolute inset-0 bg-gold/[0.03] pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
              />
            </div>
          ))}
          
          {/* Bottom border */}
          <div className="border-t border-border/50" />
        </div>
      </div>
    </section>
  )
}
