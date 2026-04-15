'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        })
      }
    }

    const section = sectionRef.current
    if (section) {
      section.addEventListener('mousemove', handleMouseMove)
      return () => section.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-12 overflow-hidden"
    >
      {/* Animated background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%),
            linear-gradient(180deg, var(--background) 0%, #0a0a15 100%)
          `,
        }}
      />

      {/* Large decorative text */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <span 
          className="text-[40vw] font-bold text-transparent leading-none select-none"
          style={{
            WebkitTextStroke: '1px rgba(212, 175, 55, 0.05)',
          }}
        >
          GØL
        </span>
      </div>

      <div className="max-w-[1000px] mx-auto relative z-10 text-center" ref={ref}>
        <div 
          className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <p className="text-sm tracking-[0.4em] uppercase text-gold mb-8">
            Начнём проект
          </p>

          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-[-0.02em] mb-8 leading-[0.95]">
            <span className="text-foreground">Готовы создать</span>
            <br />
            <span className="text-gradient">что-то особенное?</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-lg mx-auto mb-12">
            Расскажите о вашем проекте. Мы ответим в течение 24 часов.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="mailto:hello@gol.studio"
              className="group relative inline-flex items-center gap-4 px-12 py-6 border border-gold/30 hover:border-gold transition-all duration-500 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span className="relative z-10 text-sm tracking-[0.2em] uppercase text-foreground group-hover:text-background transition-colors duration-500">
                Написать на почту
              </span>
              <svg 
                className="relative z-10 w-5 h-5 text-gold group-hover:text-background transition-colors duration-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>

            <a
              href="https://t.me/gol_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 px-12 py-6 border border-muted/30 hover:border-muted-foreground transition-all duration-300"
            >
              <span className="text-sm tracking-[0.2em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                Telegram
              </span>
              <svg 
                className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.013.103.03.336.017.519z"/>
              </svg>
            </a>
          </div>

          {/* Email display */}
          <div className="mt-16">
            <a 
              href="mailto:hello@gol.studio"
              className="text-2xl md:text-3xl font-light text-muted-foreground hover:text-gold transition-colors duration-300"
            >
              hello@gol.studio
            </a>
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
