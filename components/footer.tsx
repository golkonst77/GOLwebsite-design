'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4 tracking-[0.15em]">
              <span>G</span>
              <span className="text-neon-green">Ø</span>
              <span>L</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Веб-студия. Сайты, которые приносят клиентов.
            </p>
            <a
              href="https://t.me/gol_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neon-green hover:underline text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.013.103.03.336.017.519z"/>
              </svg>
              @gol_studio
            </a>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-foreground">Услуги</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Лендинги
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Корпоративные сайты
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Редизайн
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Поддержка
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-foreground">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#cases" className="hover:text-foreground transition-colors">
                  Кейсы
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-foreground transition-colors">
                  Отзывы
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-foreground transition-colors">
                  Процесс
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-foreground">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me/gol_studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a href="mailto:hello@gol.studio" className="hover:text-foreground transition-colors">
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
          <a
            href="#contact"
            className="text-sm text-neon-green hover:underline"
          >
            Обсудить проект
          </a>
        </div>
      </div>
    </footer>
  )
}
