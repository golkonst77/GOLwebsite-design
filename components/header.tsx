import Link from 'next/link'

interface HeaderProps {
  isScrolled: boolean
}

export default function Header({ isScrolled }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">
          GØL
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-sm hover:opacity-60 transition-opacity">
            Услуги
          </Link>
          <Link href="#portfolio" className="text-sm hover:opacity-60 transition-opacity">
            Портфолио
          </Link>
          <Link href="#testimonials" className="text-sm hover:opacity-60 transition-opacity">
            Отзывы
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            Telegram
          </a>
        </div>
      </nav>
    </header>
  )
}
