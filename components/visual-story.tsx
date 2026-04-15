'use client'

import { useRef, useEffect, useState } from 'react'

const stories = [
  {
    number: '01',
    title: 'Стратегия',
    description: 'Глубокое погружение в ваш бизнес. Анализ аудитории, конкурентов, целей.',
  },
  {
    number: '02', 
    title: 'Концепция',
    description: 'Уникальный визуальный язык и структура, которые выделят вас.',
  },
  {
    number: '03',
    title: 'Дизайн',
    description: 'Пиксель-перфект исполнение с вниманием к каждой детали.',
  },
  {
    number: '04',
    title: 'Разработка',
    description: 'Чистый код, плавные анимации, безупречная производительность.',
  },
]

export default function VisualStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)))
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)`,
        }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-24 md:mb-32">
          <p className="text-sm tracking-[0.4em] uppercase text-gold mb-6">
            Процесс
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em]">
            <span className="text-foreground">Как мы</span>
            <br />
            <span className="text-gradient-gold">работаем</span>
          </h2>
        </div>

        {/* Story blocks */}
        <div className="space-y-32 md:space-y-48">
          {stories.map((story, index) => {
            const isEven = index % 2 === 0
            const itemProgress = Math.max(0, Math.min(1, (scrollProgress - index * 0.15) * 2))
            
            return (
              <div 
                key={index}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}
                style={{
                  opacity: 0.3 + itemProgress * 0.7,
                  transform: `translateY(${(1 - itemProgress) * 50}px)`,
                  transition: 'opacity 0.1s ease-out',
                }}
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <span 
                    className="text-[20vw] md:text-[15vw] font-bold text-transparent leading-none"
                    style={{
                      WebkitTextStroke: '1px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    {story.number}
                  </span>
                </div>

                {/* Content */}
                <div className={`text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
                    {story.title}
                  </h3>
                  <p className="text-lg md:text-xl text-muted-foreground font-light max-w-md">
                    {story.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Decorative line */}
      <div 
        className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent hidden md:block"
        style={{
          transform: `scaleY(${scrollProgress})`,
          transformOrigin: 'top',
        }}
      />
    </section>
  )
}
