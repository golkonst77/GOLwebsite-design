export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-lg font-bold mb-4">GØL</h3>
            <p className="text-muted-foreground text-sm">Студия премиум веб-дизайна</p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Услуги</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Посадочные страницы
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-foreground transition-colors">
                  Бизнес-сайты
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
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#portfolio" className="hover:text-foreground transition-colors">
                  Портфолио
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-foreground transition-colors">
                  Отзывы
                </a>
              </li>
              <li>
                <a href="/" className="hover:text-foreground transition-colors">
                  О нас
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a href="mailto:hello@gol.design" className="hover:text-foreground transition-colors">
                  hello@gol.design
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} GØL. Все права защищены.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Чистый дизайн. Сильный результат.
          </p>
        </div>
      </div>
    </footer>
  )
}
