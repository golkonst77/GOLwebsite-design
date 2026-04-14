'use client'

import { useInView } from '@/hooks/use-in-view'
import { useRef } from 'react'

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-24 md:py-40 px-6 relative overflow-hidden border-t border-border" ref={ref}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Background Ø */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[400px] md:text-[600px] font-bold text-neon-green/5 animate-pulse-glow select-none">
          Ø
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        <div
          className={`transform transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-neon-green text-sm tracking-[0.4em] uppercase mb-6 font-medium">
            Готовы начать?
          </p>
          
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-8 tracking-tight">
            Хватит откладывать.
            <br />
            <span className="text-neon-green text-glow-green">Пора действовать.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-14 max-w-2xl mx-auto leading-relaxed">
            Ваши конкуренты уже обновляют свои сайты. Не дайте им уйти вперёд. 
            Бесплатная консультация — первый шаг к результату.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button className="group px-12 py-6 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-widest uppercase">
              <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                Получить консультацию
              </span>
            </button>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-12 py-6 border-2 border-neon-blue text-neon-blue font-bold hover:bg-neon-blue hover:text-background transition-all duration-300 tracking-widest uppercase hover:glow-blue"
            >
              <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                Написать в Telegram
              </span>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Ответ за 2 часа</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Без предоплаты</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Гарантия результата</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
