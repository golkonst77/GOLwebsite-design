'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const services = [
  {
    icon: '→',
    title: 'Посадочные страницы',
    description: 'Высококонвертящие страницы для ваших кампаний. Минимализм + максимум результатов.',
  },
  {
    icon: '⚙',
    title: 'Бизнес-сайты',
    description: 'Профессиональные сайты, которые работают. Чистый дизайн, быстрая загрузка, отличный UX.',
  },
  {
    icon: '✦',
    title: 'Редизайн',
    description: 'Обновим ваш существующий сайт. Современный вид, улучшенная функциональность.',
  },
  {
    icon: '◇',
    title: 'Поддержка',
    description: 'Постоянная помощь. Обновления, улучшения, консультации. Мы здесь для вас.',
  },
]

export default function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="services" className="py-20 md:py-32 px-6 max-w-7xl mx-auto" ref={ref}>
      <div
        className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-12 tracking-tight text-pretty">
          Наши услуги
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group border border-border p-8 hover:border-foreground transition-all hover:shadow-lg hover:shadow-white/10 cursor-pointer"
            >
              <div className="text-4xl mb-6 group-hover:translate-x-2 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
