'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-20">
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Animated Ø background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[300px] md:text-[500px] font-bold text-neon-green/5 animate-pulse-glow select-none">
          Ø
        </div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-sm tracking-[0.4em] mb-8 text-neon-green uppercase font-medium">
            Веб-студия нового поколения
          </p>
        </div>

        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 transform transition-all duration-1000 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="text-pretty block">Не просто сайт.</span>
          <span className="text-pretty block mt-2">
            Сайт, который{' '}
            <span className="text-neon-green text-glow-green">конвертирует</span>.
          </span>
        </h1>

        <p
          className={`text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-14 transform transition-all duration-1000 delay-200 leading-relaxed ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Мы создаём digital-продукты, которые не просто красивые — они работают. 
          Высокая конверсия. Чёткий результат. Никаких компромиссов.
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-6 justify-center transform transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <button className="group px-10 py-5 bg-neon-green text-background font-bold hover:glow-green transition-all duration-300 tracking-widest uppercase text-sm">
            <span className="group-hover:tracking-[0.3em] transition-all duration-300">
              Получить консультацию
            </span>
          </button>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-10 py-5 border-2 border-neon-blue text-neon-blue font-bold hover:bg-neon-blue hover:text-background transition-all duration-300 tracking-widest uppercase text-sm hover:glow-blue"
          >
            <span className="group-hover:tracking-[0.3em] transition-all duration-300">
              Telegram
            </span>
          </a>
        </div>

        {/* Stats row */}
        <div
          className={`mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto transform transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-neon-green text-glow-green">50+</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-2 uppercase">Проектов</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-neon-blue text-glow-blue">+45%</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-2 uppercase">Конверсии</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground">2 нед</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-2 uppercase">Срок</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-neon-green/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-neon-green rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
