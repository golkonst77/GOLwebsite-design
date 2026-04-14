'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const testimonials = [
  {
    id: 1,
    text: 'GØL преобразил наш сайт. Вид стал современным, а главное — конверсия выросла на 40%.',
    author: 'Александр Петров',
    role: 'Основатель StartUp',
  },
  {
    id: 2,
    text: 'Работать с их командой — одно удовольствие. Профессионально, пунктуально, с вниманием к деталям.',
    author: 'Наталья Сидорова',
    role: 'Директор маркетинга',
  },
  {
    id: 3,
    text: 'Минимализм их дизайна просто магнит для клиентов. Спасибо за такой результат!',
    author: 'Иван Иванов',
    role: 'Владелец онлайн-школы',
  },
  {
    id: 4,
    text: 'Лучший выбор для премиум-бренда. Каждый пиксель на месте, каждая линия имеет смысл.',
    author: 'Анна Кузнецова',
    role: 'CMO компании',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="testimonials" className="py-20 md:py-32 px-6 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto" ref={ref}>
        <div
          className={`transform transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tight text-pretty">
            Отзывы клиентов
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="border border-border p-8 hover:border-foreground transition-all hover:shadow-lg hover:shadow-white/5"
              >
                <p className="text-foreground mb-6 leading-relaxed text-lg">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
