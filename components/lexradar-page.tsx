import Link from 'next/link'
import type { ReactNode } from 'react'

const telegram = 'https://t.me/teodor77'
const law = 'https://www.consultant.ru/document/cons_doc_LAW_34661/1f421640c6775ff67079ebde06a7d2f6d17b96db/'
const container = 'mx-auto max-w-[1400px] px-6 md:px-12'
const section = 'scroll-mt-36 border-t border-border py-14 md:py-20 lg:py-24'
const eyebrow = 'mb-4 text-xs leading-relaxed tracking-[0.3em] uppercase text-gold md:text-sm'
const heading = 'max-w-4xl text-3xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl'
const body = 'text-base leading-relaxed text-white/70 md:text-lg'
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold'

const navigation = [
  ['Что проверяем', '#check'],
  ['Что получите', '#result'],
  ['Документы', '#documents'],
  ['Обсудить', '#contact'],
] as const

const risks = [
  ['Документ есть — содержание не подходит', 'Политика могла быть скопирована с другого сайта, содержать чужие реквизиты или описывать процессы, которых у вашей организации нет.'],
  ['Форма работает — вопросы остаются', 'Важно определить, какие данные собираются, для чего используются и на каком основании обрабатываются.'],
  ['Сервисы подключены — их роль неясна', 'Аналитика, виджеты и внешние формы могут участвовать в обработке данных. Нужно учитывать фактическую работу сервисов.'],
  ['Сайт новый — требования могли не учесть', 'Техническая разработка и юридическая подготовка сайта требуют разных компетенций. Сам факт недавнего запуска не подтверждает соответствие требованиям.'],
] as const

const checks = [
  ['Политика обработки персональных данных', 'Доступность документа, сведения об операторе и соответствие содержания обнаруженным на сайте процессам.'],
  ['Формы заявок и записи', 'Поля, пояснения, ссылки на документы и доступные посетителю условия обработки данных.'],
  ['Согласия', 'Формулировки и способ получения согласий с учётом назначения формы и применимых требований.'],
  ['Сведения о компании', 'Реквизиты, контакты и согласованность сведений о лицах, от имени которых работает сайт.'],
  ['Сторонние сервисы', 'Доступные признаки использования аналитики, виджетов и внешних инструментов обработки данных.'],
  ['Отраслевые сведения', 'Документы и информация, необходимые с учётом деятельности организации, например медицинских или образовательных услуг.'],
] as const

const results = [
  'Что обнаружено и на какой странице.',
  'Почему это может иметь значение для бизнеса.',
  'Какие нормы относятся к выявленным обстоятельствам.',
  'Что подтверждено, а что требует уточнения.',
  'Какие документы или дальнейшая работа могут понадобиться.',
] as const

const statuses = [
  'Подтверждённое несоответствие.',
  'Признаки возможного нарушения.',
  'Требует дополнительной проверки.',
] as const

const documents = [
  ['Индивидуальные документы', 'Политика, согласия и другие документы — в составе, необходимом для конкретного сайта.'],
  ['Готовые тексты', 'Формулировки для страниц, форм и пояснений посетителю.'],
  ['Правовое обоснование', 'Объяснение, зачем нужны предлагаемые изменения.'],
  ['Методичка вебмастеру', 'Что изменить, где разместить документы и как должны работать соответствующие элементы сайта.'],
  ['Критерии проверки', 'Контрольный список для оценки результата внедрения.'],
] as const

const steps = [
  ['Отправляете ссылку', 'Напишите нам в Telegram и укажите сайт, который хотите проверить.'],
  ['Получаете предварительный результат', 'Изучаем публичные страницы и объясняем обнаруженные обстоятельства.'],
  ['Согласуем платную работу', 'Если она нужна, уточняем сведения, состав документов, стоимость и сроки.'],
  ['Передаём комплект', 'Вы получаете документы и инструкции. Ваш вебмастер внедряет изменения.'],
] as const

const questions = [
  ['Сайт недавно сделали. Зачем проверять?', 'При разработке могли сосредоточиться на дизайне и технической работе. Проверка помогает оценить документы и публичные элементы, связанные с юридическими требованиями.'],
  ['У нас уже есть политика. Этого достаточно?', 'Важно не только наличие политики, но и её содержание, сведения об операторе и соответствие фактической работе сайта.'],
  ['Проверка действительно бесплатная?', 'Да, предварительная проверка публичной части сайта бесплатная. Подготовка индивидуальных документов и методички — отдельная платная услуга, которую согласуем заранее.'],
  ['Придётся менять вебмастера?', 'Нет. Мы готовим документы и подробное задание, по которому ваш специалист сможет внести изменения.'],
  ['Вы гарантируете, что штрафов не будет?', 'Нет. Проверка и документы помогают работать с выявленными рисками, но ответственность зависит также от фактической деятельности и внутренних процессов организации.'],
  ['Кто оказывает платные услуги?', 'ИП Голубев Константин Анатольевич. Состав, стоимость и сроки работ фиксируются в договоре.'],
] as const

function ContactLink({ children }: { children: ReactNode }) {
  return (
    <a href={telegram} target="_blank" rel="noopener noreferrer"
      className={`inline-flex max-w-full items-center justify-center gap-3 rounded-full bg-gold px-6 py-5 text-center text-sm tracking-[0.1em] text-background shadow-[0_18px_50px_rgba(212,175,55,0.18)] transition-transform duration-300 hover:-translate-y-px md:px-10 ${focus}`}>
      <span>{children}</span>
      <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    </a>
  )
}

function SectionIntro({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 md:mb-12">
      <p className={eyebrow}>{label}</p>
      <h2 className={heading}>{title}</h2>
      {children && <p className={`mt-6 max-w-3xl ${body}`}>{children}</p>}
    </div>
  )
}

export default function LexRadarPage() {
  return (
    <div className="bg-background text-foreground">
      <a href="#main" className={`sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-50 focus:bg-gold focus:p-4 focus:text-background ${focus}`}>
        Перейти к содержанию
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <nav aria-label="Навигация LexRadar" className={`${container} flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4 md:py-6`}>
          <Link href="/" aria-label="GØL — на главную" className={`text-2xl font-bold tracking-[0.15em] ${focus}`}>
            G<span className="text-gold">Ø</span>L
          </Link>
          <span className="text-xs tracking-[0.2em] text-gold md:hidden">LEXRADAR</span>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 md:w-auto md:gap-8 lg:gap-12">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} className={`${href === '#contact' ? 'hidden md:inline-flex' : 'inline-flex'} min-h-11 items-center text-xs tracking-[0.05em] text-white/70 transition-colors hover:text-gold md:text-sm ${focus}`}>
                {label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main id="main" className="scroll-mt-36">
        <section aria-labelledby="lexradar-title" className="py-14 md:py-20 lg:py-24">
          <div className={container}>
            <p className={eyebrow}>LEXRADAR / ЮРИДИЧЕСКАЯ ПРОВЕРКА САЙТА</p>
            <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
              <div className="min-w-0">
                <h1 id="lexradar-title" className="mb-8 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance md:text-6xl lg:text-[72px]">
                  <span className="block">Ваш сайт может работать идеально.</span>
                  <span className="block text-gradient-gold">И всё равно привести к штрафу.</span>
                </h1>
                <p className={`max-w-2xl ${body}`}>
                  Формы заявок, согласия и юридические документы могут содержать ошибки, которые незаметны владельцу бизнеса. Проверим публичную часть вашего сайта и объясним, какие обстоятельства требуют внимания.
                </p>
                <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start xl:flex-row">
                  <ContactLink>Обсудить бесплатную проверку</ContactLink>
                  <a href="#check" className={`inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-5 text-center text-sm tracking-[0.1em] text-white/85 transition-colors hover:border-gold/50 hover:bg-white/[0.06] ${focus}`}>
                    Что мы проверяем
                  </a>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">
                  Предварительная проверка — бесплатно. Решение о заказе документов вы принимаете после получения результата.
                </p>
              </div>
              <aside aria-label="Штраф по части 2 статьи 13.11 КоАП РФ" className="min-w-0 rounded-2xl border border-gold/20 bg-white/[0.025] p-6 shadow-[0_0_80px_rgba(212,175,55,0.08)] md:p-8 lg:mt-2">
                <p className="mb-6 text-4xl font-bold tracking-[-0.03em] text-gold sm:text-5xl">До 700 000 ₽</p>
                <p className="text-base leading-relaxed text-white/85">
                  Максимальный штраф для юридических лиц по ч. 2 ст. 13.11 КоАП РФ за обработку данных без обязательного письменного согласия либо нарушение требований к сведениям в таком согласии.
                </p>
                <p className="mt-6 border-t border-gold/15 pt-6 text-sm leading-relaxed text-white/70">
                  Эта санкция относится к конкретному составу нарушения. Отсутствие галочки в обычной форме само по себе не означает, что применяется этот штраф.
                </p>
                <a href={law} target="_blank" rel="noopener noreferrer" className={`mt-5 inline-block text-sm leading-relaxed text-gold underline underline-offset-4 ${focus}`}>
                  Ч. 2 ст. 13.11 КоАП РФ
                </a>
              </aside>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={container}>
            <SectionIntro label="СКРЫТЫЕ РИСКИ" title="Красивый сайт не гарантирует юридическую корректность.">
              Сайт может быстро загружаться, хорошо выглядеть и приносить заявки. При этом документы и работа с данными пользователей могут не соответствовать фактической деятельности бизнеса.
            </SectionIntro>
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {risks.map(([title, description]) => (
                <article key={title} className="rounded-2xl border border-border bg-card/30 p-6 md:p-8">
                  <h3 className="mb-3 text-xl font-bold tracking-tight md:text-2xl">{title}</h3>
                  <p className="text-base leading-relaxed text-white/70">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="check" className={section}>
          <div className={container}>
            <SectionIntro label="ПУБЛИЧНАЯ ЧАСТЬ САЙТА" title="Проверяем то, с чем сталкивается ваш посетитель." />
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {checks.map(([title, description], index) => (
                <article key={title} className="rounded-2xl border border-gold/15 bg-white/[0.025] p-6 md:p-8">
                  <span aria-hidden="true" className="mb-5 block font-mono text-sm text-gold">0{index + 1}</span>
                  <h3 className="mb-3 text-xl font-bold tracking-tight">{title}</h3>
                  <p className="text-base leading-relaxed text-white/70">{description}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-3xl border-l-2 border-gold pl-6 text-base leading-relaxed text-white/70">
              Публичная проверка не раскрывает все внутренние процессы организации. Если вывод зависит от дополнительных сведений, мы прямо обозначаем это в результате.
            </p>
          </div>
        </section>

        <section id="result" className={section}>
          <div className={container}>
            <SectionIntro label="ПЕРВЫЙ ШАГ — БЕСПЛАТНО" title="Вы получите конкретные находки с понятным объяснением.">
              Результат предварительной проверки помогает понять, есть ли основания для дальнейшей работы и какие вопросы нужно уточнить.
            </SectionIntro>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <ul className="border-t border-border">
                {results.map((result) => (
                  <li key={result} className="flex items-start gap-4 border-b border-border py-5 text-base leading-relaxed md:text-lg">
                    <span aria-hidden="true" className="text-gold">↗</span>{result}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-gold/15 bg-white/[0.025] p-6 md:p-8">
                <ul className="flex flex-wrap gap-3" aria-label="Статусы находок">
                  {statuses.map((status) => (
                    <li key={status} className="rounded-full border border-gold/25 bg-gold/[0.06] px-4 py-2 text-sm leading-relaxed text-gold">{status}</li>
                  ))}
                </ul>
                <p className={`mt-6 ${body}`}>Не выдаём предположения за установленные нарушения. Если значимых проблем не обнаружено, сообщаем об этом.</p>
                <p className="mt-6 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/60">
                  Предварительная проверка не включает разработку индивидуальных документов и подробного задания на внедрение.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="documents" className={section}>
          <div className={container}>
            <SectionIntro label="ДОКУМЕНТЫ И ИНСТРУКЦИИ" title="Подготовим решение для вашего бизнеса и вашего вебмастера.">
              Если проверка выявит необходимость изменений, мы уточним сведения об организации и подготовим индивидуальные документы, тексты для сайта и подробную методичку по внедрению.
            </SectionIntro>
            <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
              <dl className="border-t border-border">
                {documents.map(([title, description]) => (
                  <div key={title} className="border-b border-border py-5 md:py-6">
                    <dt className="mb-2 text-xl font-bold tracking-tight md:text-2xl">{title}</dt>
                    <dd className="text-base leading-relaxed text-white/70">{description}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-2xl border border-gold/20 bg-white/[0.025] p-6 shadow-[0_0_80px_rgba(212,175,55,0.08)] md:p-8">
                <p className="text-2xl font-bold tracking-tight text-gold md:text-3xl">Ваш вебмастер внедряет изменения по готовому заданию.</p>
                <p className={`my-6 ${body}`}>Объём и стоимость согласуем после проверки и уточнения задачи. До начала платной работы вы знаете состав результата и цену.</p>
                <ContactLink>Обсудить подготовку документов</ContactLink>
              </div>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className={container}>
            <SectionIntro label="ПОНЯТНЫЙ ПРОЦЕСС" title="От ссылки на сайт до готового задания." />
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(([title, description], index) => (
                <li key={title} className="border border-border bg-card/30 p-6">
                  <span aria-hidden="true" className="mb-5 block text-3xl font-bold text-gold/60">0{index + 1}</span>
                  <h3 className="mb-3 text-lg font-bold">{title}</h3>
                  <p className="text-base leading-relaxed text-white/70">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq-title" className={section}>
          <div className={container}>
            <h2 id="faq-title" className={`mb-8 md:mb-12 ${heading}`}>Вопросы перед проверкой</h2>
            <div className="max-w-4xl border-t border-border">
              {questions.map(([question, answer]) => (
                <details key={question} className="group border-b border-border">
                  <summary className={`cursor-pointer py-6 pr-4 text-lg font-medium marker:text-gold md:text-xl ${focus}`}>
                    {question}
                  </summary>
                  <p className="max-w-3xl pb-6 text-base leading-relaxed text-white/70">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className={section}>
          <div className={`${container} text-center`}>
            <p className={eyebrow}>НАЧНИТЕ С ПРОВЕРКИ</p>
            <h2 className={`${heading} mx-auto`}>Узнайте, какие вопросы вызывает ваш сайт.</h2>
            <p className={`mx-auto mt-6 max-w-2xl ${body}`}>Отправьте ссылку в Telegram. Обсудим предварительную проверку и объясним дальнейшие шаги.</p>
            <div className="mt-8"><ContactLink>Написать в Telegram</ContactLink></div>
            <a href="mailto:golwebstudio@mail.ru" className={`mt-6 inline-block break-all text-sm text-white/70 underline underline-offset-4 transition-colors hover:text-gold ${focus}`}>golwebstudio@mail.ru</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className={`${container} flex flex-col justify-between gap-6 md:flex-row md:items-center`}>
          <div>
            <p className="mb-2 text-base font-medium tracking-wide">LexRadar / G<span className="text-gold">Ø</span>L Web Studio</p>
            <p className="text-sm leading-relaxed text-white/60">ИП Голубев Константин Анатольевич</p>
          </div>
          <nav aria-label="Ссылки в подвале" className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/70">
            <Link href="/" className={`hover:text-gold ${focus}`}>На главную</Link>
            <Link href="/privacy" className={`hover:text-gold ${focus}`}>Политика обработки данных</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
