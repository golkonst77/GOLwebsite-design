'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-16 px-6 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-neon-green/5 blur-3xl rounded-full opacity-50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 tracking-[0.2em]">
              <span>G</span>
              <span className="text-neon-green text-glow-green">Ø</span>
              <span>L</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Веб-студия нового поколения. Сайты, которые конвертируют.
            </p>
            <div className="flex gap-4">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-neon-green/30 flex items-center justify-center hover:border-neon-green hover:bg-neon-green/10 transition-all duration-300"
              >
                <svg className="w-5 h-5 text-neon-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.013.103.03.336.017.519z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-neon-green">Услуги</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-neon-green transition-colors duration-300">
                  Лендинги
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-neon-green transition-colors duration-300">
                  Корпоративные сайты
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-neon-green transition-colors duration-300">
                  Редизайн
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-neon-green transition-colors duration-300">
                  Техническая поддержка
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-neon-blue">Компания</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#process" className="hover:text-neon-blue transition-colors duration-300">
                  Процесс
                </a>
              </li>
              <li>
                <a href="#cases" className="hover:text-neon-blue transition-colors duration-300">
                  Кейсы
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-neon-blue transition-colors duration-300">
                  Отзывы
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-foreground">Контакты</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-green transition-colors duration-300 flex items-center gap-2"
                >
                  <span className="text-neon-green">@</span>gol_studio
                </a>
              </li>
              <li>
                <a href="mailto:hello@gol.studio" className="hover:text-neon-green transition-colors duration-300">
                  hello@gol.studio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} GØL. Все права защищены.
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Сайты, которые </span>
            <span className="text-neon-green">конвертируют</span>
            <span className="text-muted-foreground">.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
