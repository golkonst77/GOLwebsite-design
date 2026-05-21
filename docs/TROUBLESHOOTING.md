# Troubleshooting

Частые проблемы production и локальной разработки GØL Web Studio.

---

## Форма показывает красную ошибку

### «Не получилось отправить форму…»

1. Открыть DevTools → Network → запрос `POST /api/lead`.
2. Смотреть **HTTP status** и JSON:
   - `500` + `SEND_FAILED` → SMTP / env (ниже).
   - `400` + `INVALID_PHONE` → неверный телефон.
   - `429` → rate limit (подождать 10 мин или другой IP).
3. Логи сервера: `pm2 logs golwebstudio`.

### «Введите телефон в формате +7…»

- Нужно 11 цифр с кодом страны `7`.
- Примеры валидных вводов: `89203336655`, `9203336655`.

---

## `curl /api/lead` → `SEND_FAILED`

| Причина | Действие |
|---------|----------|
| Пустой `YANDEX_EMAIL` / `YANDEX_PASSWORD` | проверить `.env.local`, см. [ENVIRONMENT.md](./ENVIRONMENT.md) |
| Неверный пароль приложения | создать новый в Yandex ID |
| SMTP timeout (IPv4) | на VPS должен быть host `2a02:6b8::19d` в `email-service.ts` |
| PM2 старый env | `pm2 restart golwebstudio --update-env` |

Проверка SMTP: [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md).

---

## `.env.local` не подхватился

**Локально:** перезапустить `npm run dev` после изменения файла.

**На сервере:**

```bash
ls -la /var/www/golwebstudio/.env.local
pm2 restart golwebstudio --update-env
```

Проверка ключей без секретов:

```bash
cd /var/www/golwebstudio
for v in YANDEX_EMAIL YANDEX_PASSWORD LEAD_TO_EMAIL; do
  grep -q "^${v}=.\+" .env.local && echo "$v=SET" || echo "$v=EMPTY"
done
```

---

## PM2 не видит новые env

```bash
pm2 restart golwebstudio --update-env
```

Без `--update-env` переменные из обновлённого `.env.local` могут не примениться.

---

## SMTP timeout

### Симптом

Логи / API: `SEND_FAILED`, `connection timeout`, `ETIMEDOUT`.

### Диагностика

```bash
# IPv4 — на этом VPS часто не работает
nc -vz smtp.yandex.ru 587

# IPv6 — должен быть open
nc -6 -vz 2a02:6b8::19d 587
```

### Решение

Убедиться в `lib/email-service.ts`:

- `host: '2a02:6b8::19d'`
- `tls: { servername: 'smtp.yandex.ru' }`
- **нет** `rejectUnauthorized: false`

После правки: `pnpm build` + `pm2 restart golwebstudio --update-env`.

---

## `Failed to find Server Action "x"`

### Причина

- Старый JS-бандл в браузере или кэш после деплоя;
- раньше форма использовала Server Actions — сейчас только `fetch('/api/lead')`.

### Решение

1. На сервере полная пересборка:

```bash
cd /var/www/golwebstudio
rm -rf .next
pnpm build
pm2 restart golwebstudio --update-env
```

2. В браузере: жёсткое обновление `Ctrl+Shift+R` или инкогнито.

3. Убедиться, что в репозитории нет `'use server'` для lead (форма в `lead-form.tsx` — `'use client'`).

---

## Старый UI / старая версия в футере после деплоя

1. Проверить коммит на сервере: `cd /var/www/golwebstudio && git log -1 --oneline`
2. Удалить `.next`, пересобрать (см. выше).
3. Nginx не кэширует HTML агрессивно — проверить заголовки `Cache-Control` при необходимости.

---

## `npm` / `pnpm install` проблемы

### Локально (Windows)

```powershell
cd D:\DATA\GolWEBStudio
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

При SSL-ошибках registry — проверить сеть/прокси (не отключать `strict-ssl` в production CI без необходимости).

### На сервере

```bash
cd /var/www/golwebstudio
rm -rf node_modules
pnpm install
pnpm build
```

---

## PM2 logs

```bash
pm2 logs golwebstudio
pm2 logs golwebstudio --lines 200
pm2 logs golwebstudio --err
```

Очистить старые логи (осторожно):

```bash
pm2 flush golwebstudio
```

---

## Nginx 502 / Bad Gateway

```bash
pm2 list
curl -I http://127.0.0.1:3000
nginx -t
systemctl status nginx
```

Часто Node не запущен или упал после failed build.

---

## Проверка портов SMTP (шпаргалка)

```bash
nc -vz smtp.yandex.ru 587
nc -6 -vz smtp.yandex.ru 587
nc -6 -vz 2a02:6b8::19d 587
```

---

## Куда смотреть дальше

| Тема | Документ |
|------|----------|
| Деплой | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Env | [ENVIRONMENT.md](./ENVIRONMENT.md) |
| Почта | [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md) |
