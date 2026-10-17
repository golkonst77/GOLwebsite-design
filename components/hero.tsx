'use client'

import { useEffect, useState, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import LexradarLink from './lexradar-link'
import './hero.css'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLElement>(null)
  const cardsWrapRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const finePointerRef = useRef(false)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const selectedKeyRef = useRef('')

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
    {
      src: '/06.avif',
      title: 'Editorial Echo',
      subtitle: 'Visual storytelling',
    },
    {
      src: '/07.avif',
      title: 'Studio Grid',
      subtitle: 'Digital presentation',
    },
    {
      src: '/08.avif',
      title: 'Brand Layer',
      subtitle: 'Premium concept',
    },
  ] as const

  type HeroCard = (typeof allHeroCards)[number]
  const selectedCardsRef = useRef<readonly HeroCard[]>(allHeroCards.slice(0, 3))

  const [selectedCards, setSelectedCards] = useState<
    readonly HeroCard[]
  >(() => allHeroCards.slice(0, 3))

  const [previousCardsByIndex, setPreviousCardsByIndex] = useState<
    readonly (HeroCard | null)[]
  >(() => [null, null, null])
  const [crossfadeInByIndex, setCrossfadeInByIndex] = useState<
    readonly boolean[]
  >(() => [false, false, false])

  useEffect(() => {
    selectedKeyRef.current = selectedCards.map((c) => c.src).join('|')
    selectedCardsRef.current = selectedCards
  }, [selectedCards])

  useEffect(() => {
    finePointerRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches === true

    const pick3 = (avoidKey?: string) => {
      for (let attempt = 0; attempt < 6; attempt++) {
        const cards = [...allHeroCards]
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[cards[i], cards[j]] = [cards[j], cards[i]]
        }
        const next = cards.slice(0, 3)
        const key = next.map((c) => c.src).join('|')
        if (!avoidKey || key !== avoidKey) return next
      }
      return allHeroCards.slice(0, 3)
    }

    // Client-only randomization to avoid hydration mismatch.
    setSelectedCards(pick3())

    const timeouts = new Set<number>()

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id)
        fn()
      }, ms)
      timeouts.add(id)
    }

    const beginCrossfadeAtIndex = (idx: 0 | 1 | 2, nextCard: HeroCard) => {
      setPreviousCardsByIndex((prev) => {
        const copy = [...prev]
        copy[idx] = selectedCardsRef.current[idx] ?? null
        return copy
      })
      setCrossfadeInByIndex((prev) => {
        const copy = [...prev]
        copy[idx] = false
        return copy
      })
      setSelectedCards((prev) => {
        const copy = [...prev]
        copy[idx] = nextCard
        return copy
      })

      // allow paint, then fade in current / fade out previous
      schedule(() => {
        setCrossfadeInByIndex((prev) => {
          const copy = [...prev]
          copy[idx] = true
          return copy
        })
      }, 20)

      // clear previous layer after fade
      schedule(() => {
        setPreviousCardsByIndex((prev) => {
          const copy = [...prev]
          copy[idx] = null
          return copy
        })
        setCrossfadeInByIndex((prev) => {
          const copy = [...prev]
          copy[idx] = false
          return copy
        })
      }, 860)
    }

    const intervalId = window.setInterval(() => {
      const next = pick3(selectedKeyRef.current)
      // staggered wave: left(back-1 idx=1) -> center(main idx=0) -> right(back-2 idx=2)
      ;(Array.from(timeouts) as number[]).forEach((id) => window.clearTimeout(id))
      timeouts.clear()

      beginCrossfadeAtIndex(1, next[1])
      schedule(() => beginCrossfadeAtIndex(0, next[0]), 150)
      schedule(() => beginCrossfadeAtIndex(2, next[2]), 300)
    }, 5000)

    return () => {
      if (intervalId) window.clearInterval(intervalId)
      ;(Array.from(timeouts) as number[]).forEach((id) => window.clearTimeout(id))
      timeouts.clear()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCardsMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!finePointerRef.current) return
    if (!cardsWrapRef.current) return

    const rect = cardsWrapRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const dx = px - 0.5
    const dy = py - 0.5

    const maxX = 3
    const maxY = 4
    const rx = Math.max(-maxX, Math.min(maxX, -dy * (maxX * 2)))
    const ry = Math.max(-maxY, Math.min(maxY, dx * (maxY * 2)))

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setTilt({ rx, ry }))
  }

  const handleCardsMouseLeave = () => {
    if (!finePointerRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setTilt({ rx: 0, ry: 0 })
  }

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
      className="gol-hero relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      aria-labelledby="home-heading"
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

      {/* Two directions share one composition; the portfolio keeps its own column. */}
      <div className="hero-layout relative z-10">
        <div className="hero-grid">
          <div className="hero-copy">
            <p
              className={`hero-eyebrow ${isVisible ? "animate-fade-up" : "opacity-0"}`}
            >
              Digital Design Studio
            </p>
            <h1
              id="home-heading"
              className={`hero-heading ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: "0.15s" }}
            >
              <span className="block text-foreground">
                Сайты для малого бизнеса,
              </span>{" "}
              <span className="block text-gradient-gold">
                которые приводят заявки
              </span>
            </h1>
            <p
              className={`hero-description ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: "0.25s" }}
            >
              Чёткая структура, понятный оффер и путь к обращению.{" "}
              <br className="hidden xl:block" />
              Без перегрузки и дизайна ради дизайна.
            </p>
            <div
              className={`hero-actions ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: "0.35s" }}
            >
              <a href="#contact" className="hero-primary">
                Обсудить сайт <ArrowUpRight aria-hidden="true" size={17} />
              </a>
              <a href="#cases" className="hero-secondary">
                Смотреть кейсы
              </a>
            </div>
            <p className="hero-note">
              Запуск за 2–3 недели · фиксируем в договоре · не пропадаем после
              запуска
            </p>
          </div>

          <section
            className={`hero-legal ${isVisible ? "animate-fade-up" : "opacity-0"}`}
            aria-labelledby="hero-legal-heading"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="hero-legal-copy">
              <p className="hero-legal-label">02 / Юридическая проверка · РФ</p>
              <h2 id="hero-legal-heading">
                Сайт может работать — и <span>нарушать закон</span>
              </h2>
              <p className="hero-legal-description">
                Проверьте персональные данные, согласия и обязательные
                документы.{" "}
                <span className="hero-legal-offer">
                  Бесплатная предварительная проверка LexRadar.
                </span>
              </p>
            </div>
            <LexradarLink className="hero-legal-cta">
              Проверить сайт бесплатно{" "}
              <ArrowUpRight aria-hidden="true" size={17} />
            </LexradarLink>
          </section>

          {/* Right: premium preview-card (lighter, high-contrast) */}
          <div
            className={`hero-visual ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}
          >
            <div
              ref={cardsWrapRef}
              className="group relative ml-auto w-full max-w-[680px]"
              onMouseMove={handleCardsMouseMove}
              onMouseLeave={handleCardsMouseLeave}
              style={{
                transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* wrapper: relative; cards: absolute */}
              <div className="hero-cards-stage relative w-full overflow-visible">
                {/* card-back-1 */}
                <div className="absolute left-0 top-[20px] z-20 h-[520px] w-[78%] origin-center overflow-hidden rounded-[34px] border border-white/15 shadow-[0_48px_160px_rgba(0,0,0,0.62)] opacity-90 transform-gpu will-change-transform rotate-[-7deg] scale-[0.96] transition-transform transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:-translate-x-4 lg:group-hover:-translate-y-4 lg:group-hover:rotate-[-10deg] lg:group-hover:scale-[1] lg:group-hover:opacity-100">
                  {previousCardsByIndex[1]?.src ? (
                    <Image
                      key={`prev-${previousCardsByIndex[1].src}`}
                      src={previousCardsByIndex[1].src}
                      alt={`${previousCardsByIndex[1].title} — ${previousCardsByIndex[1].subtitle}`}
                      fill
                      sizes="(min-width: 1024px) 520px, 80vw"
                      className={`object-cover transition-opacity duration-[860ms] ease-out ${
                        crossfadeInByIndex[1] ? 'opacity-0' : 'opacity-100'
                      }`}
                      priority
                    />
                  ) : null}
                  <Image
                    key={`cur-${selectedCards[1]?.src ?? allHeroCards[1].src}`}
                    src={selectedCards[1]?.src ?? allHeroCards[1].src}
                    alt={`${selectedCards[1]?.title ?? allHeroCards[1].title} — ${
                      selectedCards[1]?.subtitle ?? allHeroCards[1].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 520px, 80vw"
                    className={`object-cover transition-opacity duration-[860ms] ease-out ${
                      previousCardsByIndex[1]
                        ? crossfadeInByIndex[1]
                          ? 'opacity-100'
                          : 'opacity-0'
                        : 'opacity-100'
                    }`}
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
                <div className="absolute bottom-[30px] right-0 z-10 h-[520px] w-[78%] origin-center overflow-hidden rounded-[34px] border border-white/15 shadow-[0_44px_150px_rgba(0,0,0,0.60)] opacity-80 transform-gpu will-change-transform rotate-[7deg] scale-[0.94] transition-transform transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:translate-x-4 lg:group-hover:translate-y-4 lg:group-hover:rotate-[10deg] lg:group-hover:scale-[1] lg:group-hover:opacity-100">
                  {previousCardsByIndex[2]?.src ? (
                    <Image
                      key={`prev-${previousCardsByIndex[2].src}`}
                      src={previousCardsByIndex[2].src}
                      alt={`${previousCardsByIndex[2].title} — ${previousCardsByIndex[2].subtitle}`}
                      fill
                      sizes="(min-width: 1024px) 520px, 80vw"
                      className={`object-cover transition-opacity duration-[860ms] ease-out ${
                        crossfadeInByIndex[2] ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  ) : null}
                  <Image
                    key={`cur-${selectedCards[2]?.src ?? allHeroCards[2].src}`}
                    src={selectedCards[2]?.src ?? allHeroCards[2].src}
                    alt={`${selectedCards[2]?.title ?? allHeroCards[2].title} — ${
                      selectedCards[2]?.subtitle ?? allHeroCards[2].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 520px, 80vw"
                    className={`object-cover transition-opacity duration-[860ms] ease-out ${
                      previousCardsByIndex[2]
                        ? crossfadeInByIndex[2]
                          ? 'opacity-100'
                          : 'opacity-0'
                        : 'opacity-100'
                    }`}
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
                  {previousCardsByIndex[0]?.src ? (
                    <Image
                      key={`prev-${previousCardsByIndex[0].src}`}
                      src={previousCardsByIndex[0].src}
                      alt={`${previousCardsByIndex[0].title} — ${previousCardsByIndex[0].subtitle}`}
                      fill
                      sizes="(min-width: 1024px) 560px, 86vw"
                      className={`object-cover transition-opacity duration-[860ms] ease-out ${
                        crossfadeInByIndex[0] ? 'opacity-0' : 'opacity-100'
                      }`}
                      priority
                    />
                  ) : null}
                  <Image
                    key={`cur-${selectedCards[0]?.src ?? allHeroCards[0].src}`}
                    src={selectedCards[0]?.src ?? allHeroCards[0].src}
                    alt={`${selectedCards[0]?.title ?? allHeroCards[0].title} — ${
                      selectedCards[0]?.subtitle ?? allHeroCards[0].subtitle
                    }`}
                    fill
                    sizes="(min-width: 1024px) 560px, 86vw"
                    className={`object-cover transition-opacity duration-[860ms] ease-out ${
                      previousCardsByIndex[0]
                        ? crossfadeInByIndex[0]
                          ? 'opacity-100'
                          : 'opacity-0'
                        : 'opacity-100'
                    }`}
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
