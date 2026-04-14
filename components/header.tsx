'use client'

import Link from 'next/link'

interface HeaderProps {
  isScrolled: boolean
}

export default function Header({ isScrolled }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-neon-green/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-[0.3em] hover:text-neon-green transition-colors duration-300 group"
        >
          <span className="group-hover:text-glow-green">G</span>
          <span className="text-neon-green text-glow-green animate-pulse-glow inline-block">Ø</span>
          <span className="group-hover:text-glow-green">L</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link 
            href="#services" 
            className="text-sm tracking-widest uppercase text-muted-foreground hover:text-neon-green transition-all duration-300 hover:tracking-[0.2em]"
          >
            Услуги
          </Link>
          <Link 
            href="#process" 
            className="text-sm tracking-widest uppercase text-muted-foreground hover:text-neon-green transition-all duration-300 hover:tracking-[0.2em]"
          >
            Процесс
          </Link>
          <Link 
            href="#cases" 
            className="text-sm tracking-widest uppercase text-muted-foreground hover:text-neon-green transition-all duration-300 hover:tracking-[0.2em]"
          >
            Кейсы
          </Link>
          <Link 
            href="#testimonials" 
            className="text-sm tracking-widest uppercase text-muted-foreground hover:text-neon-green transition-all duration-300 hover:tracking-[0.2em]"
          >
            Отзывы
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-6 py-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-background transition-all duration-300 hover:glow-green tracking-widest uppercase font-medium"
          >
            Telegram
          </a>
        </div>
      </nav>
    </header>
  )
}
