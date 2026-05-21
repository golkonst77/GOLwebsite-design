# GØL Design System

**Visual DNA / master blueprint** бренда GØL Web Studio.

Этот документ — главный источник правды по визуальному языку. Он объединяет философию, токены, паттерны, ограничения и правила переноса стиля в новые проекты. Детали реализации в коде — в [UI_GUIDELINES.md](./UI_GUIDELINES.md); карта компонентов — в [COMPONENT_MAP.md](./COMPONENT_MAP.md); тексты — в [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md).

**Версия документа:** 1.0 · привязка к production `golwebstudio.ru` (semver сайта см. `package.json`)

---

## Что такое visual language GØL

**GØL Design System** — не набор «красивых компонентов», а **система сдержанности**: тёмная премиальная среда, один сильный акцент (gold), белая типографика, архитектурная сетка, движение на грани заметности.

Сайт и любой продукт в стиле GØL должны ощущаться как:

- **дорогой digital product** (студия / продукт, не рекламный лендинг 2019);
- **спокойный и уверенный** (без давления и визуального крика);
- **структурированный** (ясная иерархия, предсказуемый ритм);
- **современный cinematic UI** (крупная типографика, глубина через свет/тень, не через неон).

### Какие ощущения должен вызывать дизайн

| Эмоция | Как достигается |
|--------|------------------|
| **Доверие** | честный copy, прозрачный процесс, без fake metrics |
| **Спокойствие** | тёмный фон, мало цветов, мягкие переходы |
| **Качество** | точные отступы, gold только точечно, чистая типографика |
| **Контроль** | предсказуемая сетка, ясные CTA, нет хаоса |
| **Дорогая разработка** | restraint, не «украшательство» |

### Чем GØL отличается от типичных agency-сайтов

| Типичное agency | GØL |
|-----------------|-----|
| Яркие градиенты, неон, glass | Navy/black + gold, низкий контраст поверхностей |
| 20 иконок в секции | Типографика и структура вместо icon spam |
| «Продающий сайт под ключ» | Спокойный premium, business-first |
| Bounce / parallax circus | Motion whispers — fade, translate 1px |
| Stock photos, костюмы | Реальные кейсы, mockup cards, минимум декора |
| SaaS-template (фиолетовые кнопки) | Dark luxury, pill gold CTA |
| Crypto / Web3 aesthetic | Без glow chains, без «to the moon» UI |

---

## 1. VISUAL PHILOSOPHY

### Ядро

1. **Premium minimal** — каждый элемент оправдан; убрать можно только если не ломается смысл.
2. **Dark luxury** — богатство через материал (фон, свет, типографика), не через украшения.
3. **Calm confidence** — уверенность в типографике и отступах, не в восклицательных знаках.
4. **Expensive digital product feeling** — как интерфейс продукта за $50k+, не как Tilda-шаблон.
5. **Modern cinematic interface** — крупный hero, глубина, мягкий свет; «кадр», не «баннер».
6. **Structured minimalism** — сетка и ритм видны; минимализм ≠ пустая страница.
7. **No startup circus** — нет маскотов, confetti, «мы выросли в 10 раз».
8. **No crypto vibe** — нет кислотного зелёного/фиолетового glow, hex grids, wallet UI.
9. **No SaaS-template vibe** — нет generic dashboard cards, синих primary, illustration packs.

### Эмоциональная карта

```
Вход на сайт → спокойствие (тёмный фон, нет крика)
     ↓
Hero → интерес + премиум (крупный type, gold CTA)
     ↓
Контент → ясность (структура, короткий copy)
     ↓
Форма → доверие (минимальная luxury-форма, gold submit)
     ↓
Выход → ощущение «с ними можно говорить по делу»
```

### Визуальные метафоры (для команды и промптов)

- **Ночной лобби премиум-отеля** — тёмно, тихо, золотые детали на ресепшене.
- **Редакционный макет** — крупные заголовки, воздух с дисциплиной.
- **Инструмент, не реклама** — UI служит пониманию, не «продажe воздуха».

### Legacy в production (честно)

В `problem`, `solution`, `trust` ещё есть `neon-green` / `neon-blue`. Это **не** часть целевой DNA — **не копировать** в новые проекты. Целевой акцент: **gold** (`#d4af37`, submit `#d8b63f`).

---

## 2. COLOR SYSTEM

### Палитра (production tokens, `app/globals.css`)

| Роль | HEX / token | Tailwind / CSS |
|------|-------------|----------------|
| Background | `#050510` | `bg-background`, `--background` |
| Card surface | `#0a0a1a` | `bg-card`, `--card` |
| Muted surface | `#15152a` | `bg-muted`, `--muted` |
| Border | `#1a1a35` | `border-border`, `--border` |
| Foreground | `#FFFFFF` | `text-foreground` |
| Muted text | `#6b7280` | `text-muted-foreground` |
| **Primary accent** | `#d4af37` | `--gold`, `text-gold`, `bg-gold` |
| Submit gold (forms) | `#d8b63f` | explicit hex (чуть теплее theme gold) |
| Hover gold | `#e4c55e` | hover states on CTA |

**Не использовать как primary в новых экранах:** `--secondary` / purple `#8b5cf6` (есть в theme для charts/sidebar, не для лендинга GØL).

### Слои поверхности (от глубокого к светлому)

```
Layer 0: #050510     — page background
Layer 1: #0a0a1a     — card / panel
Layer 2: #15152a     — muted blocks
Layer 3: white/2–4%  — hover/active wash (bg-white/[0.025])
Layer 4: gold/4–15%  — accent wash (только highlight)
```

### Color usage philosophy

**Принцип:** цвет — **редкая валюта**. 90% UI — монохром (белый с opacity + navy). Gold тратится на навигацию внимания, не на декор.

#### Где допустим gold

| Контекст | Интенсивность |
|----------|----------------|
| Primary CTA (pill) | solid `#d8b63f` / `bg-gold`, text black |
| Section labels (uppercase) | `text-gold`, `text-gold/80` |
| Active list item (services) | `text-gold`, `border-l-gold` |
| Hover title (cases) | `group-hover:text-gold` |
| Outline secondary CTA | `border-gold text-gold` |
| Preview card accent | `border-gold/15`, soft shadow gold |
| Focus ring (forms) | `focus:border-gold/40` |
| Logo Ø | always gold accent |
| Gradient headline (редко) | `.text-gradient-gold` — один элемент на экран |

#### Где запрещён gold

- Фон всей секции solid gold
- Body paragraphs целиком gold
- Каждая карточка с gold border
- Иконки подряд gold без иерархии
- Glow opacity > 0.25 на больших площадях
- Gold + neon + blue в одной секции без иерархии

#### Opacity — правила

| Элемент | Диапазон | Заметка |
|---------|----------|---------|
| Body secondary | `text-white/45` – `/70` | не ниже `/35` для длинного текста |
| Inactive nav/row | `text-white/60` | active → gold |
| Borders | `border-white/10`, `border-border` | не `border-white` solid |
| Card fill | `bg-white/[0.02]` – `[0.04]` | + `bg-card/30` |
| Gold wash | `bg-gold/[0.02]` – `[0.05]` | только active/hover |
| Glow | `rgba(212,175,55,0.08)` – `0.22` | radius ~80px max |

#### Где нельзя высокий контраст

- Между соседними карточками (не белые плашки на белом)
- Между border и фоном (border всегда приглушён)
- Между двумя accent-цветами (gold vs neon — выбрать один)
- Текст gold на gold background (читаемость = 0)

### Градиенты

- **Допустимо:** `text-gradient-gold` на одном H1/H2; radial gold в hero background (очень слабый).
- **Запрещено:** rainbow `text-gradient` (white→gold→purple) на новых блоках; animated gradient backgrounds; gradient borders на всех карточках.

### Glow

- Только **мягкий**, **локальный**, **gold-tinted**.
- Пример production: `shadow-[0_0_80px_rgba(212,175,55,0.08)]`.
- Не: colored drop-shadow на каждом элементе, pulsing glow на CTA.

---

## 3. TYPOGRAPHY SYSTEM

**Шрифт:** Geist (`--font-sans` в theme). Без декоративных display-шрифтов в body.

### Иерархия

| Уровень | Роль | Desktop ориентир | Mobile ориентир |
|---------|------|------------------|-----------------|
| **Hero H1** | Главный claim | `text-5xl` – `text-7xl`, vw-scale | `text-3xl` – `text-4xl` |
| **Section H2** | Заголовок секции | `text-4xl` – `text-6xl` | `text-2xl` – `text-3xl` |
| **Card H3** | Название блока | `text-xl` – `text-3xl` | `text-lg` – `text-2xl` |
| **Label** | Метка секции | `text-xs`–`text-sm`, uppercase | то же |
| **Body** | Описание | `text-sm`–`text-lg` | `text-sm`–`text-base` |
| **Micro** | Теги, сроки | `text-xs` | `text-xs` |

### Hero typography

- **Крупный, cinematic:** плотный tracking на заголовке (`tracking-[-0.02em]` – `[-0.03em]`).
- **Line-height:** `leading-[0.9]` – `1.05` на H1 (плотно, но не слипшееся).
- **Breathable:** под H1 — отступ перед subline/CTA (`mb-6` – `mb-10`), не вплотную к кнопке.
- **Один главный message** — не два конкурирующих H1.

### Body typography

- **Спокойный вес:** `font-light` / `font-normal` для описаний.
- **Readable:** `leading-relaxed` (1.5–1.625).
- **Цвет:** `text-muted-foreground` или `text-white/60`, не чистый white на длинных абзацах.

### Labels

- **Uppercase** + **letter-spacing:** `tracking-[0.2em]` – `tracking-[0.4em]`.
- **Muted:** `text-white/45` или `text-gold/80` (если секционный акцент).
- **Не** использовать uppercase для абзацев.

### Density (плотность текста)

- Заголовок секции → **8–12** spacing units до контента (`mb-8` – `mb-12`).
- В карточке: title → **2–4** → body → **4–6** → meta.
- Списки услуг: **вертикальный ритм** `py-5` / `py-6` на строку.

### Mobile typography

- Уменьшать **размер**, не **контраст**.
- Hero: убрать vw-экстремумы, перейти на fixed scale.
- Labels: tracking можно чуть уменьшить (`0.2em` вместо `0.4em`), если ломается перенос.

---

## 4. SPACING SYSTEM

### Vertical rhythm (глобально)

Секции на лендинге GØL после полировки живут в коридоре:

| Контекст | Padding (типично) |
|----------|-------------------|
| Section Y (standard) | `py-14` md:`py-20` lg:`py-24` |
| Section Y (tight junction) | `pt-8` / `pb-8` между соседними блоками |
| Horizontal | `px-6` md:`px-12` |
| Max content width | `max-w-6xl` – `max-w-[1400px]` mx-auto |

**Правило:** секции **не огромные** (`py-32`+ без причины), **не слипшиеся** (нет двух `border-t` подряд без воздуха).

### Spacing hierarchy

```
Page
 └─ Section (py-14–24)
     └─ Container (px-6–12, max-w)
         └─ Section header (mb-8–12)
         └─ Content grid (gap-6–12)
             └─ Card (p-6–10)
                 └─ Elements (mb-2–6)
```

### Typical section spacing

| Место | Значение |
|-------|----------|
| Label → H2 | `mb-4` |
| H2 → description | `mb-6` – `mb-8` |
| Description → grid | `mb-10` – `mb-12` |
| Grid gap | `gap-6` md:`gap-8` lg:`gap-12` |
| Section divider | `border-t border-border` + padding сверху |

### Mobile spacing

- **Tighter:** `py-14` вместо `py-24` на многих секциях.
- **Gap:** `gap-4` – `gap-6` вместо `gap-12`.
- **Side padding:** минимум `px-6`, не `px-2`.

### Card spacing

- Padding: `p-6` mobile, `p-8` – `p-10` desktop.
- Между карточками в grid: `gap-6` – `gap-8`.
- Внутри: иконка/number → title (`mb-2`–`mb-4`) → text.

### CTA spacing

- Над кнопкой: `mt-6` – `mt-10` от последнего текста.
- Между primary и secondary: `gap-4` – `gap-6`.
- Form submit: `mt-7` после последнего поля.
- Touch target: `min-h-[56px]` на primary.

### Empty space philosophy

**Пустота в GØL — структурная, не декоративная.**

- Пустое пространство **отделяет смысловые блоки**, не «рисует luxury».
- Большие `mb-32` без контента — **ошибка** (страница «рвётся»).
- Между секциями достаточно **14–24** vertical padding, не полэкрана.
- В hero допустимо больше воздуха **внутри** первого экрана (`min-h-screen`), но не между всеми секциями подряд.
- **Минимализм ≠ пустота:** в пустоте должен быть следующий смысл (заголовок, карточка, CTA).

---

## 5. CARD SYSTEM

### Анатомия GØL-карточки

```css
/* Концептуально */
border: 1px solid white/10 или border-border
background: white/[0.025] или bg-card/30
border-radius: rounded-2xl (точечно; глобальный --radius: 0)
padding: p-6 – p-10
shadow: none или soft gold glow (preview only)
```

### Ощущение карточки

| Должно | Не должно |
|--------|-----------|
| Лёгкая | Тяжёлая «плита» с shadow-2xl |
| Дорогая | Дешёвая с неоновой обводкой |
| Спокойная | Пульсирующая, bounce |

### Borders

- **Soft:** `border-white/10`, `border-border`, `border-gold/15` на highlight-card.
- **Запрещено:** `border-2`, яркий white 100%, двойные рамки.

### Hover на карточках

- `transition-colors duration-300` – `500ms`
- Border: `hover:border-gold/30` или `hover:border-white/20`
- Background: лёгкий wash `hover:bg-white/[0.02]`
- **Без** `scale-105`, **без** rotate.

### Тени

- Default: **no shadow** или едва заметная.
- Preview (services): gold ambient `0 0 80px rgba(212,175,55,0.08)`.
- **No** hard offset shadows (`shadow-lg` black 50%).

### Типы карточек в системе

| Тип | Пример | Особенности |
|-----|--------|-------------|
| **List row** | services | border-l accent, no full card box on desktop list |
| **Preview panel** | services sticky | gold border, glow |
| **Grid card** | trust, problem | `bg-card/30`, icon circle muted |
| **Case card** | cases | hover title gold, metrics text gold |
| **Form panel** | final-cta | inputs `rounded-xl`, `bg-white/[0.03]` |

---

## 6. ANIMATION SYSTEM

### Animation philosophy

> **Анимация должна чувствоваться, а не бросаться в глаза.**

Движение подтверждает иерархию и появление контента, не развлекает.

### Разрешено

| Тип | Параметры | Пример |
|-----|-----------|--------|
| Opacity fade | 300–1000ms, ease | `useInView` → opacity 0→1 |
| Translate Y | 10–60px → 0 | section reveal |
| Translate Y button | -1px hover | gold CTA |
| Color transition | 300–500ms | hover borders/text |
| Soft glow increase | on hover | CTA shadow |
| Hero card tilt | fine pointer only | hero.tsx |
| Crossfade | controlled interval | hero cards |

**Easing:** `cubic-bezier(0.23, 1, 0.32, 1)` или `ease-out` — без elastic.

### Запрещено

- Spinning loaders на decorative элементах
- Bounce (`animate-bounce`)
- `scale-110`+ на hover cards
- Parallax на каждом scroll layer
- Framer-motion «circus» (stagger children 20 items)
- Infinite pulse на CTA
- `animate-float` на business cards
- Random animations без `prefers-reduced-motion` consideration

### Durations cheat sheet

| UI | ms |
|----|-----|
| Hover color/border | 300–500 |
| Button translate | 300 |
| Section reveal (once) | 700–1000 |
| Hero entrance | 800–1200 |

### `prefers-reduced-motion`

При расширении системы: отключать tilt, interval swaps, large translate — оставлять instant or opacity-only.

---

## 7. COMPONENT PHILOSOPHY

Краткая DNA по типам блоков (реализация — [COMPONENT_MAP.md](./COMPONENT_MAP.md)).

### Hero

- **Cinematic:** один сильный заголовок, subline, 2 CTA.
- **Minimal:** не перегружать badges и stats.
- **Premium mockup/cards:** 3 AVIF cards, subtle motion — не carousel с 20 dots.
- **No busy visuals:** без particle canvas, без video background loop.

### Services

- **Structured / architectural:** список + preview, не 4 одинаковые icon-cards.
- **No icon spam:** номер `01`–`04` вместо 12 SVG.
- Active state через typography + border-l, не через zoom.

### Process

- **Linear clarity:** 5 шагов, срок внизу честный.
- Gold на номерах — навигация, не декор.

### Cases

- **Business-first:** задача → результат словами.
- **Outcome-oriented:** «заявки выше», не «+340%».
- **Calm presentation:** hover gold на title, не flashing metrics.

### Testimonials

- **Один quote крупно**, dots minimal.
- Без avatar stock grid из 12 лиц.

### Trust

- **Simple, transparent:** 4 факта, без fake stats grid.
- **No fake authority:** «10 лет», «500 клиентов» без доказательств — нельзя.

### Forms

- **Luxury minimal:** мало полей, labels короткие.
- **No enterprise CRM:** нет 12 полей, dropdown «отрасль», captcha banner style.
- Gold submit, dark inputs, red только для errors.

### Header / Footer

- Header: blur on scroll, gold micro-accents.
- Footer: сдержанный, version line, не keyword salad.

---

## 8. MOBILE PHILOSOPHY

### Принцип

**Mobile = тот же бренд, плотнее и проще.** Не урезанный «другой сайт».

| Desktop | Mobile |
|---------|--------|
| Hover preview panel | Inline details под пунктом |
| `py-24` | `py-14` |
| Side-by-side 2 col | Stack |
| Mouse tilt hero | Static or simplified |
| `lg:sticky` preview | Normal flow |

### Правила

1. **Tighter spacing** — см. §4.
2. **Simpler interactions** — tap = active, не только hover.
3. **Immediate readability** — нет «наведите курсор».
4. **No hover dependence** — весь смысл виден без hover.
5. **No horizontal chaos** — `overflow-x-hidden`, нет wide carousels без snap.
6. **Touch targets** ≥ 44px (`min-h-[56px]` на CTA).
7. **One column forms** — full width inputs и button.

### Mobile typography & CTA

- Кнопки full width в contact.
- Hero CTA stack vertical `gap-4`.
- Не уменьшать contrast текста ниже допустимого.

---

## 9. UX PHILOSOPHY

### Главные принципы

1. **Понять за 3 секунды** — кто вы, что делаете, куда нажать.
2. **Никакой визуальной истерии** — движение и цвет сдержаны.
3. **Ясность > эффекты** — если эффект мешает scan — убрать.
4. **Премиальность через restraint** — меньше элементов, выше качество каждого.
5. **Дорогой продукт, не шаблон** — предсказуемая структура, уникальный tone (см. [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)).

### Scan path (лендинг)

```
Logo → Hero claim → Primary CTA
  → Pain (problem) → Solution → Form (compact)
  → Services → Process → Cases
  → Social proof → Trust → Contact
```

### CTA hierarchy

- **Primary:** gold pill — одна главная на экране.
- **Secondary:** outline gold или text link.
- Не больше **2** равнозначных gold buttons в одном viewport.

### Cognitive load

- Одна мысль на секцию.
- 4 пункта в grid — ок; 9 — перегруз.
- FAQ (когда будет) — accordion, не 40 открытых параграфов.

---

## 10. ANTI-PATTERNS

**Не делать ни в GØL, ни при переносе DNA.**

### Цвет и свет

- Neon everywhere (green/blue/pink accents)
- Gradients everywhere (фон, текст, кнопки)
- Glassmorphism overload (`backdrop-blur` на каждом div)
- Crypto aesthetics (hex grids, wallet green, to-the-moon banners)
- Bright blue accents (enterprise SaaS)
- Colorful cards (каждая карточка свой цвет)
- Rainbow text gradients
- Pulsing glowing buttons
- High-contrast white cards on white

### Визуальный шум

- Too many icons (icon per bullet × 20)
- Too many borders (double/triple frames)
- Visual noise textures поверх всего
- Overuse of blur
- Giant decorative SVG backgrounds
- Stock photos с «успешными людьми»
- Fake enterprise dashboards в hero
- Badge walls («Top 1% Clutch» × 8 без контекста)

### Motion

- Random animations on scroll
- Parallax madness (5 layers)
- Spinning elements
- Bouncing CTAs
- Overscaled hover (`scale-110` cards)
- Framer-motion circus
- Auto-playing video with sound
- Cursor trails / custom cursor обязательный

### Layout & spacing

- Sections `py-48` пустые
- Mobile horizontal scroll hell
- Text smaller than 14px body
- 3+ competing H1 per page

### UI kits & templates

- Generic SaaS UI (Inter + purple button)
- Startup illustrations (blob people)
- «Awwwards clone» без содержания
- Tilda/Webflow obvious template
- shadcn default theme без адаптации под GØL tokens

### Content + UI combo

- Fake metrics in UI (`+300% ROI`)
- Countdown timers
- Pop-up «оставьте email»
- Chat widget neon bubble (если не brand-aligned)

### Forms

- 10 полей до отправки
- «Бесплатная консультация» как главный hook
- Enterprise select «выберите бюджет 1M+»

---

## 11. GOLDEN RULES

Краткие законы GØL — проверять перед каждым PR с UI:

1. **Better less than more** — убери элемент, потом добавляй.
2. **Contrast with restraint** — контраст через типографику, не через 5 цветов.
3. **Motion should whisper** — если заметил анимацию первым — слишком сильная.
4. **Minimal ≠ empty** — пустота между секциями структурная, с контентом рядом.
5. **Premium comes from control** — сетка, отступы, один accent.
6. **Calm beats loud** — спокойный UI продаёт доверие лучше крика.
7. **Structure over decoration** — архитектура блока важнее иконки.
8. **Gold is spice, not soup** — точечно.
9. **Mobile is first-class** — не degraded desktop.
10. **Honest copy, honest UI** — без fake authority.
11. **One primary CTA per viewport** — не размазывать внимание.
12. **Readability > effect** — эффект не должен мешать тексту.
13. **Don't ship neon legacy** — новый код только gold-system.
14. **Test in the dark** — весь UI проектируется на `#050510`.
15. **When in doubt, remove** — сдержанность по умолчанию.

---

## 12. CURSOR PROMPT RULES

Как использовать эту design system в Cursor, чтобы не получить «AI startup design».

### В начале промпта (обязательно)

```
Follow docs/GOL_DESIGN_SYSTEM.md for GØL Web Studio.
Dark luxury, premium minimal, background #050510, gold accent #d4af37 only.
No neon, no glassmorphism overload, no SaaS purple buttons, no bounce animations.
```

### Фразы, которые работают

| ✅ Используй | Почему |
|-------------|--------|
| dark luxury landing | задаёт тон |
| premium minimal | сдержанность |
| gold accent sparingly | не зальёт gold везде |
| muted white typography | правильный contrast |
| border white/10 | правильные границы |
| bg-white/[0.03] cards | правильные поверхности |
| soft gold glow 0.08 opacity | правильный glow |
| architectural section layout | structure over decoration |
| calm hover, 300ms transitions | motion discipline |
| pill gold CTA, black text | primary button |
| uppercase label tracking 0.3em | section labels |
| useInView fade-up once | allowed animation |
| mobile: no hover-only content | mobile rules |

### Фразы, которые ломают результат

| ❌ Избегай | Что получишь |
|-----------|--------------|
| vibrant / colorful / neon | кислотный UI |
| glassmorphism / frosted everywhere | cheap 2020 |
| startup / playful / bouncy | circus |
| crypto / web3 / futuristic glow | wrong brand |
| SaaS template / dashboard style | purple buttons |
| awwwards crazy / maximal animation | motion hell |
| gradient mesh background | noise |
| illustration style friendly blobs | template vibe |
| enterprise corporate blue | wrong palette |
| selling landing / marketing aggressive | давление |

### Шаблон промпта для новой секции

```
Create [SectionName] for GØL Web Studio (Next.js + Tailwind).

Design system: docs/GOL_DESIGN_SYSTEM.md
- bg #050510, text white/muted, gold #d4af37 accent only on labels, active states, primary CTA
- cards: rounded-2xl, border-white/10, bg-white/[0.03]
- spacing: py-14 md:py-20, mb-8 between title and content
- typography: uppercase gold label, bold H2, relaxed muted body
- animation: opacity + translateY reveal, 500ms, no bounce
- mobile: stack, show all content without hover

Do not use: neon, purple primary, glass blur cards, scale hover, fake stats.
Match existing components: services.tsx, cases.tsx tone.
```

### Шаблон для нового проекта (fork DNA)

```
New project using GØL Design System (docs/GOL_DESIGN_SYSTEM.md).
Preserve: #050510 background, gold #d4af37 accent, Geist, premium minimal, calm motion.
Adapt: content and layout; do not adapt: restraint rules and anti-patterns.
```

### Предотвращение деградации

- Ссылаться на **этот файл**, не пересказывать из памяти.
- Требовать **«no new accent colors»** явно.
- После генерации — чеклист §11 Golden Rules.
- При конфликте с [UI_GUIDELINES.md](./UI_GUIDELINES.md) — **GOL_DESIGN_SYSTEM** (master) + уточнение в PR.

---

## 13. REUSABLE DESIGN DNA

Как переносить GØL в новый проект (клиентский сайт, продукт, landing), не размывая бренд.

### Что должно сохраняться (non-negotiable)

| Элемент | Значение |
|---------|----------|
| Background family | `#050510` – `#0a0a1a` navy/black |
| Single accent | Gold `#d4af37` (+ submit `#d8b63f`) |
| Typography discipline | Крупные H1/H2, muted body, uppercase labels |
| Restraint | 1 primary CTA, мало цветов |
| Card language | soft border, low bg opacity, rounded-2xl |
| Motion | fade/translate, 300–500ms, no bounce |
| Tone | calm confidence ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)) |
| Anti-patterns list | §10 |

### Что можно адаптировать

| Элемент | Как |
|---------|-----|
| Количество секций | другой funnel, та же DNA |
| Hero visual | другое mockup/media, та же композиция |
| Сетка (2 vs 3 col) | под контент |
| Шрифт | Geist → другой **neutral grotesque**, если не ломает premium |
| Радиус | `rounded-2xl` на карточках при `--radius: 0` глобально |
| Контент ниши | тексты, не стиль |
| Secondary CTA count | ≤2 на экран |

### Что нельзя адаптировать «по желанию клиента»

- Neon / crypto / SaaS palette как primary
- Glass на всём UI
- Fake metrics + aggressive marketing UI
- Icon spam вместо типографики

### Checklist переноса DNA

- [ ] Background `#050510`?
- [ ] Только gold как accent?
- [ ] Карточки soft border, без жирных shadow?
- [ ] Hero readable in 3 seconds?
- [ ] Mobile без hover-only?
- [ ] Animations subtle?
- [ ] Copy без клише из CONTENT_STRATEGY?
- [ ] Golden Rules §11 пройдены?

### Файлы для копирования концепции (не слепого copy-paste кода)

| Референс | Путь |
|----------|------|
| Tokens | `app/globals.css` |
| Hero DNA | `components/hero.tsx` |
| Services architecture | `components/services.tsx` |
| Gold CTA + form | `components/lead-form.tsx`, `components/final-cta.tsx` |
| Cases tone | `components/cases.tsx` |

### Версионирование design system

При изменении визуального языка GØL:

1. Обновить **этот документ** (major: смена accent / фона; minor: новые паттерны; patch: уточнения).
2. Синхронизировать [UI_GUIDELINES.md](./UI_GUIDELINES.md).
3. Запись в `docs/README.md` Changelog.
4. **Не** менять production без отдельной задачи.

---

## Quick reference (для печати / закладки)

```
Background:  #050510
Card:        #0a0a1a / white 2-4%
Border:      #1a1a35 / white/10
Text:        #FFFFFF / muted #6b7280 / white/60
Accent:      #d4af37 (gold, rare)
CTA:         pill, gold, black text, min-h 56px
Radius:      cards rounded-2xl
Motion:      300-500ms, no bounce
Mobile:      tighter, no hover-only
Never:       neon, glass everywhere, fake stats, SaaS purple
```

---

## Связанные документы

| Документ | Роль |
|----------|------|
| **GOL_DESIGN_SYSTEM.md** (этот файл) | Master visual DNA |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Практические UI-правила лендинга |
| [COMPONENT_MAP.md](./COMPONENT_MAP.md) | Где что в коде |
| [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) | Tone of voice |
| [README.md](./README.md) | Индекс документации |

---

*GØL Design System — internal design bible. Обновлять при изменении визуального языка бренда.*
