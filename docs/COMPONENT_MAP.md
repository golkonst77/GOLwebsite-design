# Component Map — GØL Web Studio

Карта компонентов лендинга: назначение, состояния, зависимости, что нельзя ломать.

**Точка входа страницы:** `app/page.tsx` (server) → `components/home-page.tsx` (client) + `components/footer.tsx` (server).

---

## Обзор потока страницы

```
Header (fixed)
  ↓
Hero
  ↓
Problem → Solution (+ LeadForm compact)
  ↓
Services
  ↓
Process → Cases → Testimonials → Trust
  ↓
FinalCTA (+ LeadForm contact)
  ↓
Footer (+ BuildVersion)
```

---

## `components/header.tsx`

| | |
|---|---|
| **Назначение** | Фиксированная навигация, logo, якоря, CTA «Связаться» |
| **Зависимости** | `isScrolled` из `home-page.tsx` |
| **Ключевые элементы** | Logo GØL (Ø gold), links `#cases` `#services` `#testimonials`, mobile menu |

### Состояния

- `isScrolled === false` → прозрачный фон;
- `isScrolled === true` → `bg-background/80 backdrop-blur-xl`;
- `isMenuOpen` → mobile overlay.

### Hover / анимации

- Logo letters → `text-gold` on hover;
- Nav links → `text-muted-foreground` → `foreground`;
- CTA underline grow gold.

### Responsive

- Desktop: horizontal nav;
- Mobile: hamburger, full-screen menu.

### Gold accent

- Буква Ø, CTA underline, arrow icon.

### Не ломать

- `fixed top-0 z-50` — контент под header;
- передачу `isScrolled` с scroll listener в home-page.

---

## `components/hero.tsx`

| | |
|---|---|
| **Назначение** | Первый экран, главный claim, CTA, визуальная галерея карточек |
| **Зависимости** | `next/image`, client-only random 3 of 8 cards |
| **Якоря CTA** | `#contact`, `#cases` |

### Состояния

- `isVisible` — entrance animation;
- `selectedCards` — 3 random AVIF;
- `tilt` — mouse tilt (fine pointer only);
- crossfade при смене карточек по interval.

### Hover / анимации

- CTA gold pill + subtle translate;
- Card tilt на desktop;
- **Не трогать** hydration: random только в `useEffect`.

### Responsive

- `min-h-screen`;
- типографика `text-[12vw]` → fixed sizes на md+;
- карточки stack / grid по breakpoints.

### Gold accent

- Primary CTA `bg-gold`, label lines, accents в типографике.

### Spacing критично

- `pt` под fixed header;
- `mb` между headline и CTA.

### Не ломать

- LCP image (`loading` на hero AVIF);
- client-only shuffle логику;
- визуальную структуру hero (user rule: Hero visual).

---

## `components/problem.tsx`

| | |
|---|---|
| **Назначение** | 4 боли клиента, блок «Это решаемо» |
| **ID** | — |
| **Акцент** | `neon-blue` (legacy), не gold-primary |

### Состояния

- `useInView` fade-in.

### Hover

- `hover:border-neon-blue/30` на карточках.

### Responsive

- `grid md:grid-cols-2`.

### Не ломать

- 4 карточки (2×2 grid);
- честный copy без fake stats.

---

## `components/solution.tsx`

| | |
|---|---|
| **Назначение** | 4 тезиса решения + **LeadForm variant="compact"** |
| **Зависимости** | `lead-form.tsx` |
| **Акцент** | `neon-green` на карточках; форма — gold submit |

### Состояния

- sticky form column `lg:sticky lg:top-24`;
- `useInView` на секции.

### Hover

- card `hover:border-neon-green/30`;
- title `group-hover:text-neon-green`.

### Responsive

- 2 col: список + форма;
- mobile: форма под списком.

### Критично

- **Compact form** — основной lead capture в середине страницы;
- заголовок блока формы («Получите бесплатную консультацию») — legacy copy, при рерайте см. [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md).

### Не ломать

- интеграцию `LeadForm` без Server Action;
- grid layout на lg.

---

## `components/services.tsx`

| | |
|---|---|
| **Назначение** | 4 услуги, desktop: list + sticky preview |
| **ID** | `#services` |
| **Данные** | const `services` (4 items with tags + result) |

### Состояния

- `activeIndex` — hover/click на строке;
- inactive: `text-white/60`, active: `text-gold`, `border-l-gold`;
- preview panel показывает `services[activeIndex]`.

### Hover / анимации

- `onMouseEnter` → `setActiveIndex`;
- `transition-colors duration-500`;
- preview: `border-gold/15`, soft gold glow.

### Responsive

- Desktop: `lg:grid-cols-[1.05fr_0.95fr]`, preview `hidden lg:block`;
- Mobile: под каждой услугой — tags + result inline (`lg:hidden` block).

### Gold accent

- Active title, preview title, tags `border-gold/25`.

### Spacing

- `pt-8 pb-8` asymmetric к соседним секциям;
- row `py-5 md:py-6`.

### Не ломать

- 4 услуги и тексты в массиве;
- mobile inline details (no hover-only);
- preview sticky `top-24`.

---

## `components/process.tsx`

| | |
|---|---|
| **Назначение** | 5 этапов, срок, CTA блок |
| **ID** | `#process` |
| **Акцент** | gold на номерах и hover |

### Состояния

- static cards;
- bottom CTA `bg-gold`.

### Hover

- `hover:border-gold/30`, number `text-gold/25` → `gold/60`.

### Responsive

- `md:grid-cols-5` (5 columns desktop);
- mobile: stack.

### Не ломать

- честный срок «2-3 недели»;
- CTA href `#contact`.

---

## `components/cases.tsx`

| | |
|---|---|
| **Назначение** | 3 кейса + CTA «Похоже на вашу задачу?» |
| **ID** | `#cases` |
| **Акцент** | gold на метриках-формулировках (не цифры %) |

### Состояния

- `useInView`;
- card hover `border-gold/30`.

### Hover

- title `group-hover:text-gold`;
- gold pill CTA с overlay darken on hover.

### Responsive

- stacked cases;
- metrics wrap on mobile.

### Не ломать

- без fake «+45%» — только слова «выше», «яснее»;
- двойной CTA внизу (pill + outline).

---

## `components/testimonials.tsx`

| | |
|---|---|
| **Назначение** | Карусель отзывов (3 шт.), dots navigation |
| **ID** | `#testimonials` |

### Состояния

- `activeIndex` 0..2;
- dot active: `bg-gold w-8`.

### Hover

- dots `hover:bg-muted-foreground/50`.

### Responsive

- quote `text-2xl` → `text-5xl`;
- center aligned.

### Gold

- label «Отзывы», author name, active dot.

### Не ломать

- реалистичные цитаты (без «в 3 раза»).

---

## `components/trust.tsx`

| | |
|---|---|
| **Назначение** | «Работаем прозрачно», 4 guarantee cards 2×2 |
| **Акцент** | `neon-green` (legacy) |

### Состояния

- `useInView`;
- empty `stats` array (stats grid скрыт).

### Hover

- minimal на cards.

### Responsive

- `grid md:grid-cols-2`.

### Не ломать

- ровно 4 карточки (после добавления «Понятные условия»);
- 2×2 grid на desktop.

---

## `components/faq.tsx`

| | |
|---|---|
| **Статус** | **Не реализован** в текущем production |

При добавлении FAQ: accordion в стиле карточек `border-border`, gold только на active question, без neon.

---

## `components/final-cta.tsx`

| | |
|---|---|
| **Назначение** | Контакты + **LeadForm contact** |
| **ID** | `#contact`, `#contact-form` |
| **Зависимости** | `lead-form.tsx`, Telegram, mailto |

### Состояния

- mouse radial gradient background;
- `useInView` fade;
- 2 col lg: contacts left, form right.

### Hover

- gold CTA «Обсудить сайт»;
- telegram/email link hover `text-gold`.

### Responsive

- mobile: single column, center → left align on lg.

### Gold

- labels, primary button, gradient headline optional.

### Не ломать

- `LeadForm variant="contact"`;
- scroll-mt на `#contact-form`;
- не возвращать Server Action на form.

---

## `components/lead-form.tsx` ⚠️ Critical

| | |
|---|---|
| **Назначение** | Единая форма заявки (4 variants) |
| **Отправка** | `fetch('/api/lead')` only, `onSubmit` + `preventDefault` |
| **Поля** | name, contact (phone), message, honeypot website |

### Variants

| Variant | Где | Особенности |
|---------|-----|-------------|
| `contact` | final-cta | labels, gold fields, gold submit «Отправить заявку» |
| `compact` | solution | без labels на phone, neon focus legacy |
| `default` | — | полная форма с labels |
| `inline` | — | только phone + button row |

### Состояния

- `isSubmitting`, `isSubmitted`, `submitError`, `phoneError`;
- phone mask `+7 (999) 999-99-99`;
- success UI (gold для contact, neon-green для других — legacy).

### Валидация client

- 11 digits, starts with 7;
- error only after submit attempt;
- clear errors on input.

### Не ломать

- **NO** `action={serverAction}`;
- **NO** `useFormState` / `useFormStatus`;
- `GOLD_SUBMIT_BUTTON_CLASS` с hex `#d8b63f`;
- honeypot field `website`.

---

## `components/footer.tsx`

| | |
|---|---|
| **Назначение** | Подвал, ссылки, copyright, версия |
| **Зависимости** | `build-version.tsx` (server) |

### Состояния

- static year `new Date().getFullYear()`.

### Gold

- Ø в logo, link hover `text-gold`.

### Не ломать

- server component wrapper в `page.tsx` (для BuildVersion).

---

## `components/build-version.tsx`

| | |
|---|---|
| **Назначение** | Server-only: `v1.2.0 · build <hash>` |
| **Источник** | `lib/build-info.ts` + `package.json` |

---

## `components/home-page.tsx`

| | |
|---|---|
| **Назначение** | Client shell: scroll state + порядок секций |
| **Не содержит** | Footer (в `page.tsx`) |

---

# Critical production components

## `app/api/lead/route.ts`

| | |
|---|---|
| **Метод** | POST JSON |
| **Валидация** | honeypot, phone normalize, lengths, rate limit |
| **Письмо** | HTML table template inline in file |
| **Ответ** | `{ ok: true }` / errors |

**Не ломать:** rate limit constants; `INVALID_PHONE`; admin-only email (no client auto-reply).

## `lib/email-service.ts`

| | |
|---|---|
| **Роль** | nodemailer → Yandex SMTP |
| **Production host** | IPv6 `2a02:6b8::19d` + `tls.servername: smtp.yandex.ru` |

**Не менять без теста на VPS:** SMTP host/TLS (см. [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md)).

## Deploy flow

См. [DEPLOYMENT.md](./DEPLOYMENT.md) — `deploy.bat`, PM2 `golwebstudio`, не трогать `.env.local` в git.

---

# Dependency map

```
[Browser]
  components/lead-form.tsx
       │ POST /api/lead
       ▼
  app/api/lead/route.ts
       │ sendEmail()
       ▼
  lib/email-service.ts
       │ SMTP :587 (IPv6)
       ▼
  Yandex → LEAD_TO_EMAIL

[Build / version]
  package.json (version)
       → lib/build-info.ts
       → components/build-version.tsx
       → footer.tsx

[Page composition]
  app/page.tsx
       → home-page.tsx (sections)
       → footer.tsx
```

---

## Hooks & utilities

| Файл | Использование |
|------|----------------|
| `hooks/use-in-view.ts` | Почти все секции — entrance animation |
| `lib/build-info.ts` | Footer version only |
| `app/globals.css` | Theme, `.text-gold`, `.bg-gold`, animations |

---

## `components/ui/*`

shadcn/Radix primitives — **не используются** на основном лендинге напрямую (только инфраструктура проекта). Новые секции лендинга — в `components/*.tsx`, не в ui/, unless deliberate.

---

## Связанные документы

- [UI_GUIDELINES.md](./UI_GUIDELINES.md)
- [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)
- [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md)
