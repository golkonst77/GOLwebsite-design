'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const projects = [
  {
    id: 1,
    title: 'Минималистичный портал',
    category: 'Посадочная страница',
    description: 'Чистый дизайн, высокая конверсия. Результат: +45% конверсии через 3 месяца.',
  },
  {
    id: 2,
    title: 'SaaS платформа',
    category: 'Бизнес-сайт',
    description: 'Интуитивный интерфейс для сложного продукта. Пользователи говорят: "Это так просто!"',
  },
  {
    id: 3,
    title: 'Кейс: Редизайн портала',
    category: 'Редизайн',
    description: 'Обновили устаревший сайт. Современный вид, +30% трафика из поисковых систем.',
  },
]

export default function Portfolio() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="portfolio" className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div
          className={`transform transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-pretty">
            Портфолио
          </h2>
          <p className="text-muted-foreground mb-16 text-lg">
            Проекты, которыми мы гордимся
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group border border-border p-8 hover:border-foreground transition-all cursor-pointer overflow-hidden"
              >
                {/* Placeholder for image */}
                <div className="w-full h-48 bg-gradient-to-br from-muted to-muted-foreground/30 rounded mb-6 group-hover:opacity-80 transition-opacity" />

                <p className="text-xs tracking-widest text-muted-foreground mb-3 uppercase">
                  {project.category}
                </p>
                <h3 className="text-xl font-bold mb-3 group-hover:translate-x-2 transition-transform">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button className="px-8 py-4 border border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-all">
              Смотреть все проекты
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
