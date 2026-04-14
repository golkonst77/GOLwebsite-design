'use client'

import { useEffect, useState } from 'react'
import LeadForm from './lead-form'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-20 pb-12">
      {/* Subtle grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Subtle accent glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-neon-green/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-blue/[0.03] rounded-full blur-3xl" />

      <div className="relative z-10 w-full px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div
            className={`transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-sm tracking-[0.3em] mb-6 text-neon-green uppercase font-medium">
              Веб-студия GØL
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="text-balance block">Сайт, который</span>
              <span className="text-balance block">
                <span className="text-neon-green">приносит клиентов</span>
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Создаём лендинги и корпоративные сайты с фокусом на конверсию. 
              Средний рост заявок у наших клиентов — <span className="text-foreground font-medium">+45%</span>.
            </p>

            {/* Key benefits */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Готово за 2-3 недели</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Фиксированная цена</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Гарантия результата</span>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden">
              <a
                href="#contact"
                className="inline-block px-8 py-4 bg-neon-green text-background font-bold transition-all duration-300 tracking-wider uppercase text-sm"
              >
                Получить консультацию
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <div
            className={`transform transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="p-8 md:p-10 border border-border bg-card/50 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Бесплатная консультация
                </h2>
                <p className="text-muted-foreground text-sm">
                  Обсудим ваш проект и дадим честную оценку
                </p>
              </div>
              <LeadForm variant="compact" />
            </div>
          </div>
        </div>

        {/* Stats row - below main content */}
        <div
          className={`mt-16 pt-16 border-t border-border grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center lg:text-left">
            <div className="text-2xl md:text-3xl font-bold text-neon-green">50+</div>
            <div className="text-xs text-muted-foreground mt-1">Проектов</div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-2xl md:text-3xl font-bold text-neon-green">+45%</div>
            <div className="text-xs text-muted-foreground mt-1">Рост конверсии</div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-2xl md:text-3xl font-bold text-foreground">2 нед</div>
            <div className="text-xs text-muted-foreground mt-1">Средний срок</div>
          </div>
        </div>
      </div>
    </section>
  )
}
