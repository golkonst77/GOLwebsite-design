'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)

  const allHeroCards = [
    {
      src: '/01.avif',
      title: 'GØL',
      subtitle: 'Brand system',
    },
    {
      src: '/02.avif',
      title: 'Web Design',
      subtitle: 'Clean structure',
    },
    {
      src: '/03.avif',
      title: 'Digital Identity',
      subtitle: 'Strong result',
    },
    {
      src: '/04.avif',
      title: 'Premium Layout',
      subtitle: 'Visual direction',
    },
    {
      src: '/05.avif',
      title: 'Local Business',
      subtitle: 'Website concept',
    },
  ] as const

  const [selectedCards, setSelectedCards] = useState<
    readonly (typeof allHeroCards)[number][]
  >(() => allHeroCards.slice(0, 3))

  useEffect(() => {
    // Client-only randomization to avoid hydration mismatch.
    const cards = [...allHeroCards]
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    setSelectedCards(cards.slice(0, 3))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <div className="grid grid-cols-1 items-center gap-12 pt-20 pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:pt-24">
          {/* Left: keep as-is */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
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
              className={`text-[12vw] md:text-[10vw] lg:text-[72px] font-bold leading-[0.9] tracking-[-0.03em] mb-8 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
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
                href="#cases"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: premium preview-card (lighter, high-contrast) */}
          <div
            className={`${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.55s' }}
          >
            <div className="group relative ml-auto w-full max-w-[680px]">
              {/* wrapper: relative; cards: absolute */}
              <div className="relative h-[520px] w-full overflow-visible lg:h-[560px]">
                {/* card-back-1 */}
                <div className="absolute left-0 top-[20px] z-20 h-[520px] w-[78%] origin-center overflow-hidden rounded-[34px] border border-white/15 shadow-[0_48px_160px_rgba(0,0,0,0.62)] opacity-90 transform-gpu will-change-transform rotate-[-7deg] scale-[0.96] transition-transform transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:-translate-x-16 lg:group-hover:-translate-y-10 lg:group-hover:rotate-[-28deg] lg:group-hover:scale-[1] lg:group-hover:opacity-100">
                  <Image
                    src={selectedCards[1]?.src ?? allHeroCards[1].src}
                    alt={`${selectedCards[1]?.title ?? allHeroCards[1].title} — ${
                      selectedCards[1]?.subtitle ?? allHeroCards[1].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 520px, 80vw"
                    className="object-cover"
                    priority
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.28)_40%,rgba(0,0,0,0.55)_100%)]"
                  />
                  <div className="pointer-events-none absolute left-6 top-6 inline-flex items-center rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-white/90 uppercase">
                    {selectedCards[1]?.title ?? allHeroCards[1].title}
                  </div>
                  <div className="pointer-events-none absolute bottom-6 left-6">
                    <div className="text-[22px] font-semibold tracking-[-0.02em] text-white">
                      {selectedCards[1]?.title ?? allHeroCards[1].title}
                    </div>
                    <div className="mt-1 text-xs font-medium tracking-[0.16em] text-white/80 uppercase">
                      {selectedCards[1]?.subtitle ?? allHeroCards[1].subtitle}
                    </div>
                  </div>
                </div>

                {/* card-back-2 */}
                <div className="absolute bottom-[30px] right-0 z-10 h-[520px] w-[78%] origin-center overflow-hidden rounded-[34px] border border-white/15 shadow-[0_44px_150px_rgba(0,0,0,0.60)] opacity-80 transform-gpu will-change-transform rotate-[7deg] scale-[0.94] transition-transform transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:translate-x-16 lg:group-hover:translate-y-10 lg:group-hover:rotate-[28deg] lg:group-hover:scale-[1] lg:group-hover:opacity-100">
                  <Image
                    src={selectedCards[2]?.src ?? allHeroCards[2].src}
                    alt={`${selectedCards[2]?.title ?? allHeroCards[2].title} — ${
                      selectedCards[2]?.subtitle ?? allHeroCards[2].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 520px, 80vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.22)_40%,rgba(0,0,0,0.60)_100%)]"
                  />
                  <div className="pointer-events-none absolute bottom-6 left-6">
                    <div className="text-[22px] font-semibold tracking-[-0.02em] text-white">
                      {selectedCards[2]?.title ?? allHeroCards[2].title}
                    </div>
                    <div className="mt-1 text-xs font-medium tracking-[0.16em] text-white/80 uppercase">
                      {selectedCards[2]?.subtitle ?? allHeroCards[2].subtitle}
                    </div>
                  </div>
                </div>

                {/* card-main */}
                <div className="absolute left-[8%] top-[60px] z-30 h-[520px] w-[84%] overflow-hidden rounded-[34px] border border-white/16 shadow-[0_58px_190px_rgba(0,0,0,0.58)] origin-center transform-gpu will-change-transform transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:-translate-y-2 lg:group-hover:scale-[1.01]">
                  <Image
                    src={selectedCards[0]?.src ?? allHeroCards[0].src}
                    alt={`${selectedCards[0]?.title ?? allHeroCards[0].title} — ${
                      selectedCards[0]?.subtitle ?? allHeroCards[0].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 560px, 86vw"
                    className="object-cover"
                    priority
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.40)_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.62)_100%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(850px_circle_at_20%_0%,rgba(212,175,55,0.14),transparent_62%)]"
                  />

                  <div className="pointer-events-none absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-white/90 uppercase">
                    <span className="size-1.5 rounded-full bg-gold/90" />
                    Featured
                  </div>

                  <div className="pointer-events-none absolute bottom-7 left-7">
                    <div className="text-[28px] font-semibold tracking-[-0.02em] text-white">
                      {selectedCards[0]?.title ?? allHeroCards[0].title}
                    </div>
                    <div className="mt-1 text-xs font-medium tracking-[0.16em] text-white/80 uppercase">
                      {selectedCards[0]?.subtitle ?? allHeroCards[0].subtitle}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
