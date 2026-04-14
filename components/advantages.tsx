'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

const advantages = [
  {
    number: '1',
    title: 'Минимализм',
    description: 'Максимальная ясность. Каждый элемент имеет смысл. Это повышает конверсию и улучшает пользовательский опыт.',
  },
  {
    number: '2',
    title: 'Фокус на UX',
    description: 'Дизайн ради людей. Интуитивные интерфейсы. Гладкие взаимодействия. Сайты, которыми приятно пользоваться.',
  },
  {
    number: '3',
    title: 'Быстрая доставка',
    description: 'Работаем эффективно. Ваш проект готов в срок. Без задержек, с качеством, с вниманием к деталям.',
  },
  {
    number: '4',
    title: 'Постоянная поддержка',
    description: 'Проект не заканчивается на сдаче. Мы помогаем в улучшениях, обновлениях и развитии вашего сайта.',
  },
]

export default function Advantages() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 md:py-32 px-6 border-y border-border">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div
          className={`transform transition-all duration-1000 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-16 tracking-tight text-pretty">
            Почему выбирают нас
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex gap-8">
                <div className="flex-shrink-0">
                  <div className="text-5xl md:text-6xl font-bold text-muted-foreground opacity-40">
                    {advantage.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
