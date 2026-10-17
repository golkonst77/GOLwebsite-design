# Форма заявок и почта

LexRadar использует отдельный `/api/lexradar`, форму `components/lexradar-form.tsx` и общий `lib/email-service.ts`. Настройка SMTP и безопасное включение: [инструкция](./lexradar-smtp-launch-checklist.md). Разделы ниже описывают общую форму сайта `/api/lead`.

Цепочка от кнопки «Отправить» до письма в ящике `golwebstudio@bk.ru`.

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
| `lib/email-service.ts` | Nodemailer → Mail.ru SMTP |

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
       │ SMTP TLS :465
       ▼
  Mail.ru → MAIL_TO (golwebstudio@bk.ru)
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
- **Кому:** `LEAD_TO_EMAIL` или `golwebstudio@bk.ru`
- **От:** `GØL Web Studio <SMTP_FROM>` (или SMTP_USER; в старом режиме YANDEX_EMAIL)
- **Формат:** HTML (табличная вёрстка ~600px) + text fallback
- **Блоки:** Имя, Контакт (телефон), Задача, дата (Europe/Moscow), источник gol.studio
- **Reply-To:** не используется (контакт — только телефон)

### Автоответ клиенту

**Отключён.** Раньше отправлялся при email в contact; сейчас contact — только телефон, автоответ не вызывается.

---

## Mail.ru SMTP — текущая конфигурация

smtp.mail.ru:465, TLS с проверкой сертификата, AUTH LOGIN. Пользователь и отправитель — golwebstudio@bk.ru, получатель — этот же ящик. Пароль приложения задаётся только в SMTP_PASS. Fallback на Яндекс удалён.

[Однократная настройка и подтверждение получения](./lexradar-mailru-production.md).

После одобренного развёртывания:

~~~sh
npm run smtp:setup
# Либо отдельная проверка уже настроенного SMTP:
npm run smtp:diagnose -- --production-test
~~~

Форма не включается на основании одного SMTP-ответа: требуется реальное письмо в ящике и подтверждение владельца. SMTP_ACCEPTED не означает автоматическую проверку входящих.

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

Проверять smtp.mail.ru:465 именно с целевого сервера. Старые переменные Яндекса игнорируются и удаляются установщиком.

---

## Связанные документы

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
