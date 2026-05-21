# Статус проекта

Снимок состояния GØL Web Studio на момент документирования (v1.2.0).

---

## Общий статус

**Production ready** — сайт на https://golwebstudio.ru, заявки уходят на почту при корректном `.env.local` и IPv6 SMTP.

---

## Что работает

| Область | Статус |
|---------|--------|
| Лендинг (все секции) | ✅ |
| Адаптив (mobile / tablet / desktop) | ✅ |
| Форма заявки (телефон + маска) | ✅ |
| API `/api/lead` | ✅ |
| Отправка на `golwebstudio@mail.ru` | ✅ (при настроенном SMTP) |
| SMTP через IPv6 на VPS | ✅ |
| Honeypot + rate limit | ✅ |
| Версия в футере (semver + git hash) | ✅ |
| Деплой main → VPS + PM2 | ✅ |
| Документация `docs/` | ✅ |

---

## Что сделано (основные блоки)

### Маркетинг и UI

- **Hero** — первый экран, CTA, визуал без ломки анимаций.
- **Problem / Solution** — боли + решение, форма compact в solution.
- **Services** — 4 услуги, desktop preview при hover, mobile inline.
- **Process** — 5 этапов, CTA «Обсудить проект».
- **Cases** — 3 кейса, блок CTA после кейсов.
- **Testimonials** — слайдер отзывов.
- **Trust** — 4 карточки «Работаем прозрачно» (2×2).
- **Final CTA / Contact** — контакты + форма contact.
- **Footer** — навигация, версия `v1.2.0 · build <hash>`.

### Форма и backend

- Client-only submit через `fetch('/api/lead')` (без Server Actions).
- Российский телефон: маска, client + server validation.
- Premium HTML-письмо админу.
- Yandex SMTP с IPv6 host для production VPS.

### Инфраструктура

- GitHub: `golkonst77/GOLwebsite-design`, branch `main`.
- VPS `144.31.253.4`, path `/var/www/golwebstudio`, PM2 `golwebstudio`.
- Деплой через `deploy.bat` (git reset, pnpm build, pm2, nginx reload).

### Документация

- `docs/README.md`, `DEPLOYMENT.md`, `ENVIRONMENT.md`, `EMAIL_AND_LEADS.md`, `TROUBLESHOOTING.md`, `PROJECT_STATUS.md`.

---

## Известные ограничения

| Ограничение | Комментарий |
|-------------|-------------|
| Rate limit in-memory | сбрасывается при restart PM2; для кластера нужен Redis |
| SMTP только Yandex | другие провайдеры — правка `email-service.ts` |
| IPv4 SMTP на VPS | не используется намеренно (timeout) |
| Нет CRM / Telegram duplicate | заявка только на email |

---

## Roadmap (можно улучшить позже)

| Задача | Приоритет | Заметки |
|--------|-----------|---------|
| HTTPS / сертификат | высокий | Let's Encrypt, auto-renew |
| Analytics | средний | GA4 / Metrika |
| Telegram-уведомление дублем заявки | средний | bot token в env, не в docs |
| CRM / Google Sheets | низкий | webhook после `/api/lead` |
| SEO metadata | средний | Open Graph, sitemap, robots |
| Mobile polish | низкий | мелкие отступы по секциям |
| `scripts/test-yandex-smtp.mjs` в репо | низкий | диагностика на сервере |
| E2E тест формы | низкий | Playwright |

---

## Версионирование

- Источник semver: `package.json` → сейчас **1.2.0**.
- Patch/minor: обновлять `version` перед релизом + `build` + deploy.
- Git hash в футере обновляется автоматически при каждой сборке с git.

---

## Контакты в проекте (публичные)

- Сайт: https://golwebstudio.ru
- Email в контенте: golwebstudio@mail.ru
- Telegram: @teodor77 (в CTA / ошибках формы)

---

## Для нового разработчика — с чего начать

1. Прочитать [README.md](./README.md).
2. Поднять локально: `.env.local` + `npm run dev`.
3. [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md) — если трогаете форму.
4. [DEPLOYMENT.md](./DEPLOYMENT.md) — перед выкладкой на VPS.
5. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — если что-то сломалось в production.
