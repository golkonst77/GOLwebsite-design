# Переменные окружения

Конфигурация почты и заявок через файл `.env.local`. **Файл не коммитится в Git.**

---

## Где используется

| Окружение | Путь к файлу |
|-----------|----------------|
| Локально (Windows) | `D:\DATA\GolWEBStudio\.env.local` |
| Production (VPS) | `/var/www/golwebstudio/.env.local` |

Шаблон без секретов: `.env.example` в корне репозитория.

---

## Обязательные переменные

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `YANDEX_EMAIL` | да | Логин почтового ящика Yandex (отправитель SMTP). Пример формата: `your-mail@yandex.ru` |
| `YANDEX_PASSWORD` | да | Пароль приложения Yandex (не основной пароль аккаунта). |
| `LEAD_TO_EMAIL` | нет* | Куда приходят заявки с сайта. По умолчанию: `golwebstudio@mail.ru` |

\* Если не задана — API использует fallback `golwebstudio@mail.ru`.

### Пример `.env.example` (без значений)

```env
YANDEX_EMAIL=
YANDEX_PASSWORD=
LEAD_TO_EMAIL=golwebstudio@mail.ru
```

### Как заполнить локально

```powershell
cd D:\DATA\GolWEBStudio
copy .env.example .env.local
# Отредактировать .env.local в редакторе — вставить реальные значения
```

После изменения `.env.local` перезапустить dev:

```powershell
# остановить npm run dev (Ctrl+C), затем:
npm run dev
```

---

## Кто читает переменные

| Переменная | Файл |
|------------|------|
| `YANDEX_EMAIL`, `YANDEX_PASSWORD` | `lib/email-service.ts` |
| `LEAD_TO_EMAIL` | `app/api/lead/route.ts` |

Next.js подхватывает `.env.local` автоматически при `dev` / `build` / `start`.

---

## Production: создание и права

На сервере:

```bash
cd /var/www/golwebstudio
nano .env.local
```

Права (только владелец читает):

```bash
chmod 600 .env.local
```

---

## Проверка наличия переменных **без вывода секретов**

### На сервере — ключи заданы и не пустые

```bash
cd /var/www/golwebstudio
grep -E '^[A-Z_]+=' .env.local | cut -d= -f1 | sort
```

Ожидаемые имена: `LEAD_TO_EMAIL`, `YANDEX_EMAIL`, `YANDEX_PASSWORD`.

### Проверка, что значения не пустые (без показа)

```bash
cd /var/www/golwebstudio
for v in YANDEX_EMAIL YANDEX_PASSWORD LEAD_TO_EMAIL; do
  if grep -q "^${v}=.\+" .env.local 2>/dev/null; then
    echo "$v=SET"
  else
    echo "$v=MISSING_OR_EMPTY"
  fi
done
```

### Через Node (только факт наличия)

```bash
cd /var/www/golwebstudio
node -e "const k=['YANDEX_EMAIL','YANDEX_PASSWORD','LEAD_TO_EMAIL']; k.forEach(x=>console.log(x, process.env[x]?'SET':'MISSING'))"
```

> Для `process.env` из файла Next подхватывает env при старте через PM2. Надёжнее смотреть `.env.local` grep-ом, затем перезапустить PM2.

---

## Перезапуск PM2 с новыми env

После правки `.env.local` на сервере:

```bash
pm2 restart golwebstudio --update-env
pm2 logs golwebstudio --lines 30
```

Флаг `--update-env` обязателен, иначе PM2 может держать старые переменные окружения.

---

## Безопасность

- **Не** вставлять пароли в `docs/`, GitHub Issues, чаты.
- **Не** коммитить `.env.local`.
- Использовать **пароль приложения** Yandex, не пароль от входа в почту.
- Ротация пароля: обновить `.env.local` → `pm2 restart golwebstudio --update-env`.

---

## Типичные ошибки

| Симптом | Причина |
|---------|---------|
| `EMAIL_NOT_CONFIGURED` в логах | пустые `YANDEX_EMAIL` / `YANDEX_PASSWORD` |
| `SEND_FAILED` на API | SMTP или неверный пароль приложения |
| env не обновился | не сделали `--update-env` при restart PM2 |

См. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md), [EMAIL_AND_LEADS.md](./EMAIL_AND_LEADS.md).
