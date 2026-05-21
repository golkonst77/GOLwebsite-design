'use client'

import { useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

const testimonials = [
  {
    id: 1,
    quote: 'Они не просто создали сайт — они создали инструмент, который реально работает на бизнес.',
    author: 'Дмитрий В.',
    role: 'CEO, TechStart',
  },
  {
    id: 2,
    quote: 'Сайт получился аккуратным и понятным. Теперь видно, что мы делаем, и как с нами работать.',
    author: 'Анна С.',
    role: 'CMO, FinanceHub',
  },
  {
    id: 3,
    quote:
      'Обратились за сайтом, потому что старый вообще не работал — люди заходили и не понимали, чем мы отличаемся.\nСделали структуру, переписали смыслы и аккуратно оформили.\nСейчас сайт хотя бы объясняет, за что нам платят, и с него начали приходить нормальные обращения.',
    author: 'Максим П.',
    role: 'Андрей, бухгалтерская компания',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section 
      id="testimonials" 
      className="relative py-14 md:py-20 lg:py-24 px-6 md:px-12 overflow-hidden"
      ref={ref}
    >
      {/* Background accent */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/[0.02]" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Section header */}
        <div 
          className={`text-center mb-8 md:mb-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-sm tracking-[0.4em] uppercase text-gold mb-4">
            Отзывы
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em]">
            <span className="text-foreground">Слова</span>{' '}
            <span className="text-gradient-gold">клиентов</span>
          </h2>
        </div>

        {/* Main testimonial */}
        <div 
          className={`transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-8 md:mb-10">
            <blockquote className="text-2xl md:text-4xl lg:text-5xl font-light leading-tight text-foreground mb-8">
              &ldquo;{testimonials[activeIndex].quote}&rdquo;
            </blockquote>
            <div className="flex flex-col items-center gap-2">
              <span className="text-gold font-medium">{testimonials[activeIndex].author}</span>
              <span className="text-muted-foreground text-sm">{testimonials[activeIndex].role}</span>
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-gold w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
