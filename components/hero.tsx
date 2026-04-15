'use client'

import { useEffect, useState, useRef } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-gradient"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
            linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #050510 100%)
          `,
        }}
      />

      {/* Floating shapes */}
      <div 
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-float opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div 
        className="absolute bottom-1/3 left-1/5 w-[300px] h-[300px] rounded-full animate-float opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Tagline */}
          <div
            className={`overflow-hidden mb-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <p className="text-sm md:text-base tracking-[0.4em] uppercase text-gold font-light">
              Digital Design Studio
            </p>
          </div>

          {/* Main headline */}
          <h1 
            className={`text-[12vw] md:text-[10vw] lg:text-[8vw] font-bold leading-[0.9] tracking-[-0.03em] mb-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <span className="block text-foreground">Чистый дизайн.</span>
            <span className="block text-gradient">Сильный результат.</span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl font-light leading-relaxed mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            Четкая структура. Ясная подача.
            <br className="hidden md:block" />
            Ты показываешь ценность и получаешь результат.
          </p>

          {/* CTA */}
          <div 
            className={`${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.8s' }}
          >
            <a
              href="#work"
              className="group relative inline-flex items-center gap-4 px-10 py-5 border border-gold/30 hover:border-gold transition-all duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10 text-sm tracking-[0.2em] uppercase text-foreground group-hover:text-background transition-colors duration-500">
                Смотреть кейсы
              </span>
              <svg 
                className="relative z-10 w-5 h-5 text-gold group-hover:text-background transition-colors duration-500 transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
          style={{ animationDelay: '1.2s' }}
        >
          <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </div>

      {/* Large Ø watermark */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[40vw] font-bold text-white/[0.02] leading-none pointer-events-none select-none"
        style={{
          transform: `translate(20%, -50%) rotate(${mousePosition.x * 5 - 2.5}deg)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        Ø
      </div>
    </section>
  )
}
