'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  isScrolled: boolean
}

export default function Header({ isScrolled }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold tracking-[0.15em] group"
          >
            <span className="text-foreground group-hover:text-gold transition-colors duration-300">G</span>
            <span className="text-gold">Ø</span>
            <span className="text-foreground group-hover:text-gold transition-colors duration-300">L</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            <Link 
              href="#cases" 
              className="text-sm tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Работы
            </Link>
            <Link 
              href="#services" 
              className="text-sm tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Услуги
            </Link>
            <Link 
              href="#testimonials" 
              className="text-sm tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Отзывы
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-3 text-sm tracking-[0.1em] text-foreground"
            >
              <span className="relative">
                Связаться
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
              </span>
              <svg 
                className="w-4 h-4 text-gold transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-px bg-foreground transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`w-6 h-px bg-foreground transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div 
        className={`fixed inset-0 z-40 bg-background transition-all duration-500 md:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link 
            href="#cases" 
            className="text-3xl font-light text-foreground hover:text-gold transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Работы
          </Link>
          <Link 
            href="#services" 
            className="text-3xl font-light text-foreground hover:text-gold transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Услуги
          </Link>
          <Link 
            href="#testimonials" 
            className="text-3xl font-light text-foreground hover:text-gold transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Отзывы
          </Link>
          <Link 
            href="#contact" 
            className="text-3xl font-light text-gold"
            onClick={() => setIsMenuOpen(false)}
          >
            Связаться
          </Link>
        </div>
      </div>
    </>
  )
}
