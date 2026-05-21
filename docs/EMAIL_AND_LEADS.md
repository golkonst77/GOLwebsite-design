# Форма заявок и почта

Цепочка от кнопки «Отправить» до письма в ящике `golwebstudio@mail.ru`.

---

## Компоненты формы

| Файл | Роль |
|------|------|
| `components/lead-form.tsx` | UI, маска телефона, валидация, `fetch('/api/lead')` |
| `components/final-cta.tsx` | Секция `#contact`, `LeadForm variant="contact"` |
| `components/solution.tsx` | Блок консультации, `LeadForm variant="compact"` |

Варианты `lead-form`: `default`, `compact`, `inline`, `contact`.

Отправка **только через client `fetch`**, без Server Actions.

---

## API и сервис почты

| Файл | Роль |
|------|------|
| `app/api/lead/route.ts` | POST `/api/lead`, валидация, rate limit, HTML письма |
| `lib/email-service.ts` | Nodemailer → Yandex SMTP |

---

## Цепочка данных

```
[Браузер]
  LeadForm onSubmit
       │ POST JSON
       ▼
  /api/lead (route.ts)
       │ normalize phone
       │ honeypot / rate limit
       ▼
  sendEmail() (email-service.ts)
       │ SMTP STARTTLS :587
       ▼
  Yandex → LEAD_TO_EMAIL (golwebstudio@mail.ru)
```

---

## Тело запроса (JSON)

```json
{
  "name": "Имя",
  "contact": "+7 (920) 333-66-55",
  "message": "Текст задачи",
  "website": ""
}
```

| Поле | Описание |
|------|----------|
| `name` | Имя, до 100 символов |
| `contact` | Телефон РФ, маска `+7 (999) 999-99-99` |
| `message` | Описание, до 2000 символов |
| `website` | Honeypot — должен быть пустым |

---

## Honeypot (`website`)

- Скрытое поле в DOM (`tabIndex={-1}`, вне экрана).
- Если бот заполнил `website` → API отвечает `{ "ok": true }` **без отправки письма** (тихий успех для бота).

---

## Rate limit

- **3 успешные** отправки с одного IP за **10 минут**.
- При превышении: HTTP `429`, `{ "ok": false, "error": "Слишком много отправок..." }`.
- Хранение in-memory в процессе Node (сбрасывается при restart PM2).

---

## Валидация телефона

### Frontend (`lead-form.tsx`)

- Маска при вводе: `8…` / `7…` / `9…` → `+7 (XXX) XXX-XX-XX`.
- Перед `fetch`: 11 цифр, первая `7`.
- Ошибка (только после submit): `Введите телефон в формате +7 (999) 999-99-99`.

### Backend (`route.ts`)

- Извлечение цифр;
- `8` + 11 цифр → замена на `7`;
- 10 цифр → добавить `7` в начало;
- итог: 11 цифр, начинается с `7`;
- в письмо — формат `+7 (999) 999-99-99`;
- иначе: `400`, `{ "ok": false, "error": "INVALID_PHONE" }`.

---

## Ответы API

| HTTP | Тело | Значение |
|------|------|----------|
| 200 | `{ "ok": true }` | письмо отправлено |
| 400 | `VALIDATION_ERROR` | пустые поля / длина |
| 400 | `INVALID_PHONE` | неверный телефон |
| 429 | текст на русском | rate limit |
| 500 | `SEND_FAILED` | SMTP не отправил |
| 500 | `BAD_REQUEST` | исключение при разборе |

---

## Письмо админу

- **Тема:** `[GØL] Новая заявка — {Имя}`
- **Кому:** `LEAD_TO_EMAIL` или `golwebstudio@mail.ru`
- **От:** `GØL Web Studio <YANDEX_EMAIL>`
- **Формат:** HTML (табличная вёрстка ~600px) + text fallback
- **Блоки:** Имя, Контакт (телефон), Задача, дата (Europe/Moscow), источник gol.studio
- **Reply-To:** не используется (контакт — только телефон)

### Автоответ клиенту

**Отключён.** Раньше отправлялся при email в contact; сейчас contact — только телефон, автоответ не вызывается.

---

## SMTP (Yandex) — production

Файл: `lib/email-service.ts`

```ts
host: '2a02:6b8::19d'        // IPv6 Yandex SMTP
port: 587
secure: false
requireTLS: true
tls: { servername: 'smtp.yandex.ru' }
```

### Почему IPv6, а не `smtp.yandex.ru`

На VPS `144.31.253.4`:

- **IPv4** → `smtp.yandex.ru:587` — **timeout**;
- **IPv6** → `2a02:6b8::19d:587` — **работает**.

`servername: 'smtp.yandex.ru'` нужен для корректного TLS/SNI и проверки сертификата (без `rejectUnauthorized: false`).

---

## Диагностика SMTP

### Проверка портов с сервера

```bash
# IPv4 (может не отвечать на этом VPS)
nc -vz smtp.yandex.ru 587

# IPv6 (рабочий путь)
nc -6 -vz 2a02:6b8::19d 587
```

### Тестовый скрипт

Путь: `scripts/test-yandex-smtp.mjs`

Запуск на сервере (из корня проекта, с настроенным `.env.local`):

```bash
cd /var/www/golwebstudio
node scripts/test-yandex-smtp.mjs
```

Скрипт читает `YANDEX_EMAIL` / `YANDEX_PASSWORD` из окружения (через dotenv или export) и отправляет тестовое письмо **без участия формы**.

> Если файла нет в репозитории — создать по образцу production transporter из `email-service.ts`.

### Проверка API с сервера

```bash
curl -X POST https://golwebstudio.ru/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"SMTP Test","contact":"+7 (900) 111-22-33","message":"test","website":""}'
```

Успех: `{"ok":true}`. Ошибка SMTP: `{"ok":false,"error":"SEND_FAILED"}`.

### Логи

```bash
pm2 logs golwebstudio --lines 100
```

---

## Локальная разработка

1. Заполнить `.env.local` (см. [ENVIRONMENT.md](./ENVIRONMENT.md)).
2. `npm run dev` → http://localhost:3000
3. Отправить форму в `#contact` или в блоке solution.
4. Проверить почту `LEAD_TO_EMAIL`.

Локально SMTP может работать и по IPv4, и по IPv6 — на production важен IPv6 host.

---

## Связанные документы

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
