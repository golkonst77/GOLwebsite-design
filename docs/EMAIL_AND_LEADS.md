# Форма заявок и почта

LexRadar использует отдельный `/api/lexradar`, форму `components/lexradar-form.tsx` и общий `lib/email-service.ts`. Настройка SMTP и безопасное включение: [инструкция](./lexradar-smtp-launch-checklist.md). Разделы ниже описывают общую форму сайта `/api/lead`.

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
| `lib/email-service.ts` | Nodemailer → SMTP из окружения (или прежний Yandex) |

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
- Если бот заполнил `website` → API отвечает HTTP 400 / `VALIDATION_ERROR`, без отправки и без фиктивного успеха.

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
- **От:** `GØL Web Studio <SMTP_FROM>` (или SMTP_USER; в старом режиме YANDEX_EMAIL)
- **Формат:** HTML (табличная вёрстка ~600px) + text fallback
- **Блоки:** Имя, Контакт (телефон), Задача, дата (Europe/Moscow), источник gol.studio
- **Reply-To:** не используется (контакт — только телефон)

### Автоответ клиенту

**Отключён.** Раньше отправлялся при email в contact; сейчас contact — только телефон, автоответ не вызывается.

---

## SMTP из окружения

Основной режим задаётся через SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM. См. [ENVIRONMENT.md](./ENVIRONMENT.md). Все формы используют один сервис; успех требует принятия нужного получателя SMTP-сервером.

### Сохранённый старый режим Yandex (только без всех SMTP_*)

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

### Диагностика и реальное тестовое письмо

```sh
npm run smtp:diagnose
npm run smtp:diagnose -- --verify
npm run smtp:diagnose -- --production-test
```

Первая команда не открывает соединения; verify проверяет TLS/аутентификацию без письма; production-test после проверки TLS и авторизации отправляет одно синтетическое письмо строго на golwebstudio@mail.ru через Яндекс. SMTP_PASSWORD и LEAD_TO_EMAIL поддерживаются как прежние имена SMTP_PASS и MAIL_TO. Подробности EAUTH и включения: [инструкция](./lexradar-yandex-production.md). До включения формы подтвердить получение письма в ящике по Test ID. Ни одна команда не меняет LEXRADAR_FORM_ENABLED.

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

Проверять доступность выбранного SMTP_HOST/порта именно с целевого сервера. Старый IPv6 Yandex сохранён для совместимости; новый провайдер задаётся через SMTP_*.

---

## Связанные документы

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
