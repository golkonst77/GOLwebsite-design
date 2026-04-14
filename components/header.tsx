'use client'

import Link from 'next/link'

interface HeaderProps {
  isScrolled: boolean
}

export default function Header({ isScrolled }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-xl font-bold tracking-[0.2em] hover:text-neon-green transition-colors"
        >
          <span>G</span>
          <span className="text-neon-green">Ø</span>
          <span>L</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="#services" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Услуги
          </Link>
          <Link 
            href="#cases" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Кейсы
          </Link>
          <Link 
            href="#testimonials" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Отзывы
          </Link>
          <Link 
            href="#process" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Процесс
          </Link>
        </div>

        <a
          href="#contact"
          className="px-5 py-2.5 bg-neon-green text-background font-medium transition-all duration-300 text-sm"
        >
          Связаться
        </a>
      </nav>
    </header>
  )
}
