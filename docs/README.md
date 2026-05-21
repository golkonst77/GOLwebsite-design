# GØL Web Studio — документация проекта

Маркетинговый лендинг веб-студии **GØL**: премиальный одностраничный сайт с формой заявки и отправкой писем на почту через Yandex SMTP.

**Production:** https://golwebstudio.ru  
**Текущая версия (semver):** `1.2.0` (отображается в футере как `v1.2.0 · build <git-hash>`)

---

## Назначение

Сайт решает задачи:

- презентация услуг и кейсов;
- доверие и процесс работы;
- сбор заявок с телефоном (российский формат `+7`);
- доставка заявки на `golwebstudio@mail.ru`.

---

## Стек

| Слой | Технология |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Компоненты | Radix UI / shadcn-style (`components/ui/`) |
| Почта | Nodemailer + Yandex SMTP |
| Runtime (prod) | Node.js, PM2 |
| Reverse proxy | Nginx |
| Репозиторий | GitHub `golkonst77/GOLwebsite-design` |

---

## Структура репозитория

```
GolWEBStudio/
├── app/
│   ├── layout.tsx          # корневой layout, metadata
│   ├── page.tsx            # server: HomePage + Footer
│   ├── globals.css         # тема, gold utilities
│   └── api/lead/route.ts   # POST заявок
├── components/
│   ├── home-page.tsx       # client: все секции лендинга
│   ├── header.tsx
│   ├── hero.tsx
│   ├── problem.tsx
│   ├── solution.tsx        # + compact LeadForm
│   ├── services.tsx
│   ├── process.tsx
│   ├── cases.tsx
│   ├── testimonials.tsx
│   ├── trust.tsx
│   ├── final-cta.tsx       # contact + LeadForm variant contact
│   ├── lead-form.tsx       # форма заявки (все варианты)
│   ├── footer.tsx
│   ├── build-version.tsx   # server: версия из package.json + git
│   └── ui/                 # UI primitives
├── lib/
│   ├── email-service.ts    # SMTP Yandex
│   ├── build-info.ts       # semver + git hash
│   └── utils.ts
├── hooks/
│   └── use-in-view.ts      # анимации появления секций
├── .env.example            # шаблон переменных (без секретов)
├── .env.local              # локально и на сервере (НЕ в git)
├── package.json
└── docs/                   # эта документация
```

---

## Секции лендинга (порядок на странице)

| # | ID / якорь | Компонент | Назначение |
|---|------------|-----------|------------|
| 1 | — | `header.tsx` | Навигация, «Связаться» |
| 2 | — | `hero.tsx` | Первый экран, CTA |
| 3 | — | `problem.tsx` | Боли клиента |
| 4 | — | `solution.tsx` | Решение + форма compact |
| 5 | `#services` | `services.tsx` | Услуги, hover preview |
| 6 | `#process` | `process.tsx` | Этапы работы |
| 7 | `#cases` | `cases.tsx` | Кейсы |
| 8 | `#testimonials` | `testimonials.tsx` | Отзывы |
| 9 | — | `trust.tsx` | «Работаем прозрачно» |
| 10 | `#contact` | `final-cta.tsx` | Контакты + форма contact |
| 11 | — | `footer.tsx` | Подвал, версия |

---

## Локальный запуск (Windows)

Путь проекта: `D:\DATA\GolWEBStudio`

### 1. Зависимости

```powershell
cd D:\DATA\GolWEBStudio
npm install
```

### 2. Переменные окружения

Скопировать шаблон и заполнить (см. [ENVIRONMENT.md](./ENVIRONMENT.md)):

```powershell
copy .env.example .env.local
```

### 3. Dev-сервер

```powershell
npm run dev
```

Открыть: http://localhost:3000

### 4. Production-сборка локально

```powershell
npm run build
npm run start
```

---

## Сборка и версия

- Сборка: `npm run build` → каталог `.next/`
- В футере версия берётся из `package.json` + short git hash (`lib/build-info.ts`, `components/build-version.tsx`).
- После изменения `version` в `package.json` нужен новый `build`.

---

## Связанные документы

| Файл | Тема |
|------|------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Деплой на VPS, PM2, Nginx |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | `.env.local`, переменные |
| [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md) | Форма, API, SMTP |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Типичные проблемы |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Статус и roadmap |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Визуальная система, цвет, типографика, anti-patterns |
| [COMPONENT_MAP.md](./COMPONENT_MAP.md) | Карта компонентов, states, critical paths |
| [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) | Tone of voice, CTA, запрещённые клише |
| **[GOL_DESIGN_SYSTEM.md](./GOL_DESIGN_SYSTEM.md)** | **Master visual DNA / design bible** |

---

## Changelog (кратко)

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-05-20 | 1.2.0 | Privacy: /privacy, cookie consent banner, checkbox в lead-form, API CONSENT_REQUIRED |
| 2026-05-20 | docs | GOL_DESIGN_SYSTEM (master design bible) |
| 2026-05-20 | docs | UI_GUIDELINES, COMPONENT_MAP, CONTENT_STRATEGY |
| 2026-05 | 1.2.0 | Телефонная маска, SMTP IPv6, документация, полировка секций |
| — | 1.0.1 | Версионирование в футере, lead API |
| — | 1.0.0 | Базовый лендинг |
