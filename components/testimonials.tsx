'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const testimonials = [
  {
    id: 1,
    text: 'Конверсия выросла на 67% за первый месяц. Вложения окупились в 10 раз. Рекомендую всем, кто хочет результат, а не просто красивую картинку.',
    author: 'Дмитрий Волков',
    role: 'CEO, TechStart',
    company: 'IT-стартап',
  },
  {
    id: 2,
    text: 'За 2 недели получили сайт, который конкуренты делают за 2 месяца. И это без потери качества. Чёткий процесс, понятные сроки.',
    author: 'Анна Соколова',
    role: 'CMO, FinanceHub',
    company: 'Финтех',
  },
  {
    id: 3,
    text: 'До этого работали с тремя фрилансерами — каждый раз головная боль. Здесь всё было по-другому: профессионально, в срок, без нервов.',
    author: 'Максим Петренко',
    role: 'Основатель',
    company: 'E-commerce',
  },
  {
    id: 4,
    text: 'Минимализм, который продаёт. Убрали всё лишнее, добавили то, что работает. Заявки выросли с 5 до 20 в день.',
    author: 'Елена Краснова',
    role: 'Директор по маркетингу',
    company: 'Услуги',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="testimonials" className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <p className="text-neon-green text-sm tracking-[0.3em] uppercase mb-4">
              Отзывы
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Что говорят клиенты
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="group p-6 md:p-8 border border-border bg-card/30 hover:border-neon-green/30 transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-neon-green">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </p>
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
