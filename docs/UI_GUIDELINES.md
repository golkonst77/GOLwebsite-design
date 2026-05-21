# UI Guidelines — GØL Web Studio

Визуальная система production-лендинга. Цель: **premium minimal**, спокойный **dark luxury**, ощущение дорогого digital product без визуального шума.

> **Master document:** полный visual DNA — [GOL_DESIGN_SYSTEM.md](./GOL_DESIGN_SYSTEM.md). Этот файл — практические правила для лендинга; при расхождении приоритет у Design System.

---

## Общая философия

| Принцип | Смысл |
|---------|--------|
| Premium minimal | Мало элементов, каждый на месте |
| Dark luxury | Тёмный фон, золотой акцент, белая типографика |
| Не кричать | Нет кислотных цветов, нет «продающих» баннеров |
| Минимализм без пустоты | Плотный ритм, но без «дыр» между секциями |
| Digital product | Как сайт студии, а не шаблон агентства |

### Чего избегаем глобально

- стартап-неон как основной язык;
- кислотные glow и rainbow gradients;
- дешёвый glassmorphism (blur на всём подряд);
- «корпоративный» синий/серый enterprise;
- stock-agency grid с одинаковыми карточками.

> **Примечание по коду:** в `problem` / `solution` / `trust` ещё встречаются классы `neon-green` / `neon-blue` — это **вторичные** акценты старых итераций. **Главный** production-акцент для CTA, services, cases, contact — **gold**. Новые секции делать в gold-системе, не расширять neon.

---

## Цветовая система

### База (CSS variables, `app/globals.css`)

| Токен | Значение | Роль |
|-------|----------|------|
| `--background` | `#050510` | Основной фон (navy/black) |
| `--foreground` | `#FFFFFF` | Основной текст |
| `--card` | `#0a0a1a` | Подложки карточек |
| `--muted` | `#15152a` | Вторичные поверхности |
| `--muted-foreground` | `#6b7280` | Описания, подписи |
| `--border` | `#1a1a35` | Разделители секций |
| `--gold` | `#d4af37` | Primary accent |

### Gold — где использовать

- лейблы секций (`Услуги`, `Результаты`);
- primary CTA (pill-кнопки `bg-gold`, явный hex `#d8b63f` в форме);
- hover active state (заголовок услуги, кейс);
- мелкие highlight: `text-gold/80`, `border-gold/15`;
- иконки успеха в contact-form;
- градиент в заголовках: `.text-gradient-gold` (ограниченно).

### Gold — где нельзя

- фоны целых секций (только `bg-gold/[0.02–0.05]`);
- длинные абзацы gold-текстом;
- обводка каждого элемента;
- glow радиусом > 80px с высокой opacity.

### Opacity philosophy

- Текст body: `text-white/45` – `text-white/70`, не ниже `white/35` для читаемого body.
- Бордеры: `border-white/10`, `border-border/50`.
- Фоны карточек: `bg-white/[0.025]` – `bg-white/[0.04]`, `bg-card/30`.
- Hover подложки: `hover:bg-white/[0.015]`, `bg-gold/[0.04]` только для active row.
- Glow: `rgba(212, 175, 55, 0.08)` – `0.22`, не выше.

### Типографика по цвету

- Заголовки: `text-foreground` (белый).
- Описания: `text-muted-foreground` или `text-white/60`.
- Лейблы: `text-white/45`, uppercase, tracking `0.12em` – `0.4em`.

---

## Типографика

### Иерархия

| Уровень | Пример | Классы / паттерн |
|---------|--------|------------------|
| Hero H1 | Огромный claim | `text-[12vw]` → `text-6xl`, `leading-[0.9]`, `tracking-[-0.03em]` |
| Section H2 | «Что мы создаём» | `text-4xl` – `text-7xl`, `font-bold` |
| Card H3 | Название услуги | `text-2xl` – `text-4xl` |
| Label | `УСЛУГИ` | `text-sm`, `uppercase`, `tracking-[0.3em]`, gold |
| Body | Описание | `text-sm` – `text-lg`, `leading-relaxed`, muted |

### Правила

- **Крупные hero headlines** — один главный message, без двух H1.
- **Спокойные descriptions** — `font-light` / regular, не bold.
- **Uppercase labels** — только для меток секций и микро-копи, не для абзацев.
- **Tracking** — широкий на labels (`0.2em`–`0.4em`), плотный на H1 (`-0.02em`).
- **Line-height** — заголовки `0.9`–`1.05`, body `1.5`–`relaxed`.
- **Плотность секций** — заголовок близко к контенту (`mb-8`–`mb-12`), не `mb-32`.

---

## Карточки

### Стандартная карточка (services preview, trust, cases)

```
border border-white/10 или border-border
bg-white/[0.025] или bg-card/30
rounded-2xl (или без radius — site theme radius: 0, карточки — rounded-2xl точечно)
padding: p-6 – p-8
```

### Тени

- Мягкая: `shadow-[0_0_80px_rgba(212,175,55,0.08)]` — только у gold preview.
- Без `shadow-2xl` на каждой карточке.
- Без цветных drop-shadow.

### Запрещено в карточках

- жирные `border-2` белые;
- яркие outer glow;
- gradient border fake-glass;
- carousel dots neon.

---

## Hover и анимации

### Допустимо

| Эффект | Пример в проекте |
|--------|----------------|
| `transition-colors` 300–500ms | header links, service rows |
| `translate-y` -1px | gold CTA buttons (`hover:-translate-y-[1px]`) |
| opacity inactive/active | services list `text-white/60` → gold |
| `useInView` fade-up | секции `opacity-0` → `opacity-100`, `translate-y-10` → `0` |
| subtle gold glow | preview card shadow |
| border accent on hover | `hover:border-gold/30` (cases) |

### Запрещено

- bounce, spring overshoot;
- `scale-110` на карточках;
- rotating / 3D flip карточек (кроме controlled hero tilt на fine pointer);
- parallax «цирк»;
- бесконечные loop-анимации кроме hero card rotation (сдержанно);
- `animate-pulse` на CTA.

### Длительность

- UI hover: **300–500ms**
- Section reveal: **~1000ms**, `once: true`
- Hero: отдельная логика, **не ускорять** без причины

---

## Layout philosophy

- **Крупные секции** с контролируемым padding: `py-14 md:py-20 lg:py-24` (после полировки rhythm).
- **Controlled spacing** между заголовком и контентом: `mb-8` – `mb-12`.
- **Без огромных пустот** между соседними секциями (асимметричный `pt`/`pb` на стыках solution → services).
- **Max-width** контента: `max-w-6xl` / `max-w-[1400px]` — не на всю ширину 4K текстом.
- **Grid 2 col** на desktop где уместно (services, final-cta, solution).
- **Визуальный ритм:** тёмная секция → тёмная секция с `border-t border-border`.

---

## Mobile rules

1. **Никаких desktop-only смыслов** — на mobile services показывает теги и result под каждой строкой (без hover-only контента).
2. **Всё читается сразу** — без «наведите для деталей».
3. **Spacing tighter** — `py-14`, меньшие `gap`, `text-2xl` вместо `text-6xl` в заголовках услуг.
4. **Hover degradation** — active state по tap/click (`setActiveIndex`), не только mouseenter.
5. **Header** — burger menu, full-screen overlay nav.
6. **Форма** — одна колонка, кнопка full width, `min-h-[56px]`.
7. **Hero** — упрощённая вёрстка, tilt отключается без fine pointer.

---

## Кнопки (CTA)

### Primary (gold pill)

```
bg-[#d8b63f] или bg-gold
text-black
rounded-full
min-h-[56px] на форме
shadow rgba(212,175,55,0.18–0.32)
hover: чуть светлее #e4c55e, лёгкий glow
```

### Secondary

```
border border-gold
text-gold
hover:bg-gold hover:text-background
```

### Не использовать

- `bg-neon-green` как primary (не в theme, визуально ломается);
- маленькие ghost без контраста на тёмном фоне.

---

## Формы (визуально)

- Inputs: `h-12`, `rounded-xl`, `border-white/10`, `bg-white/[0.03]`.
- Focus: `focus:border-gold/40`, не neon.
- Ошибки: `text-red-400`, `text-sm`, `mt-3`.
- Submit: только gold, full width в contact.

---

## Anti-patterns (чего НЕЛЬЗЯ делать)

| Anti-pattern | Почему |
|--------------|--------|
| Glass everywhere | размывает premium, cheap 2020 vibe |
| Gradients everywhere | убивает спокойствие |
| Too many borders | визуальный шум |
| Bright neon primary | ломает GØL luxury |
| Fake enterprise | синие плашки, stock photos в костюмах |
| Generic startup UI | фиолетовые кнопки, illustration clutter |
| Stock-agency vibe | «наши 500 клиентов», иконки из одного набора |
| Огромные пустые секции | `py-48`, `mb-32` без причины |
| Fake metrics | «+300%» без доказательств |
| 5 разных accent colors | gold + neon + blue в одной секции без системы |

---

## Чеклист перед merge UI

- [ ] CTA читается на тёмном фоне?
- [ ] Gold не залит на 50% экрана?
- [ ] Mobile без hover-only контента?
- [ ] Spacing секции в ритме (`py-14`–`py-24`)?
- [ ] Анимация < 500ms и без bounce?
- [ ] Тексты не enterprise-bullshit? (см. [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md))

---

## Связанные документы

- [COMPONENT_MAP.md](./COMPONENT_MAP.md) — где что реализовано
- [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) — tone of voice
