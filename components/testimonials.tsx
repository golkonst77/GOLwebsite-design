'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const testimonials = [
  {
    id: 1,
    text: 'Конверсия выросла на 67% за первый месяц. Это не дизайн — это инвестиция, которая окупилась в 10 раз.',
    author: 'Дмитрий Волков',
    role: 'CEO, TechStart',
    metric: '+67% конверсии',
  },
  {
    id: 2,
    text: 'Работа с GØL — это совершенно другой уровень. Понимают бизнес, а не просто рисуют красивые картинки.',
    author: 'Анна Соколова',
    role: 'CMO, FinanceHub',
    metric: 'ROI 1200%',
  },
  {
    id: 3,
    text: 'За 2 недели получили сайт, который конкуренты делают за 2 месяца. И это без потери качества.',
    author: 'Максим Петренко',
    role: 'Founder, E-Shop',
    metric: '14 дней',
  },
  {
    id: 4,
    text: 'Минимализм, который продаёт. Каждый элемент работает на результат. Рекомендую всем.',
    author: 'Елена Краснова',
    role: 'Marketing Director',
    metric: '+340 лидов/мес',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="testimonials" className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/5 blur-3xl rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-neon-blue text-sm tracking-[0.4em] uppercase mb-4 font-medium">
            Отзывы
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Клиенты говорят
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-16">
            Не верьте нам на слово. Вот что говорят те, кто уже работал с нами.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="group border border-border p-8 md:p-10 bg-card/30 backdrop-blur-sm hover:border-neon-blue/50 transition-all duration-500 relative overflow-hidden"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Metric badge */}
                  <div className="inline-block text-xs tracking-widest text-neon-green border border-neon-green/30 px-3 py-1 uppercase mb-6">
                    {testimonial.metric}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-lg md:text-xl text-foreground mb-8 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 flex items-center justify-center border border-neon-green/30">
                      <span className="text-lg font-bold text-neon-green">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
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
