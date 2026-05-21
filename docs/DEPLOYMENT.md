# Деплой GØL Web Studio

Production-инфраструктура и порядок выкладки обновлений.

---

## Константы окружения

| Параметр | Значение |
|----------|----------|
| Локальная папка (Windows) | `D:\DATA\GolWEBStudio` |
| GitHub | `https://github.com/golkonst77/GOLwebsite-design` |
| Ветка production | `main` |
| Сервер (VPS) | `144.31.253.4` |
| Домен | `golwebstudio.ru` |
| Путь на сервере | `/var/www/golwebstudio` |
| PM2 process | `golwebstudio` |
| URL после деплоя | https://golwebstudio.ru |

---

## Схема деплоя

```
[Windows dev] deploy.bat
       │ SSH
       ▼
[VPS 144.31.253.4]
  /var/www/golwebstudio
    git reset → origin/main
    pnpm install → pnpm build
    pm2 restart golwebstudio
    nginx -t && systemctl reload nginx
       ▼
  golwebstudio.ru → Nginx → Node :3000 (PM2)
```

---

## Деплой через `deploy.bat` (основной способ)

Скрипт `deploy.bat` лежит на машине разработчика (обычно рядом с проектом или в отдельной папке деплоя). Он подключается по SSH к серверу и выполняет команды на VPS.

### Что делает скрипт (по шагам)

1. **`git fetch`** — получить свежие коммиты с GitHub.
2. **`git reset --hard origin/main`** — привести рабочую копию на сервере к `main` (без локальных правок на VPS).
3. **`pnpm install`** — установить/обновить зависимости.
4. **`pnpm build`** — собрать Next.js (`.next/`).
5. **`pm2 restart golwebstudio`** — перезапустить приложение.
6. **`nginx -t`** — проверить конфиг Nginx.
7. **`systemctl reload nginx`** — применить Nginx без простоя.

> На сервере используется **pnpm**. Локально может быть `npm` — это нормально, важно не путать команды на VPS.

### Перед деплоем (локально)

```powershell
cd D:\DATA\GolWEBStudio
git status
git push origin main
```

Убедиться, что в `main` только то, что нужно в production.

---

## Ручной деплой по SSH

Подключение:

```bash
ssh root@144.31.253.4
```

Команды на сервере (одна сессия):

```bash
cd /var/www/golwebstudio

git fetch origin
git reset --hard origin/main

pnpm install
pnpm build

pm2 restart golwebstudio --update-env

nginx -t
systemctl reload nginx
```

Если менялись только env-переменные без нового кода:

```bash
pm2 restart golwebstudio --update-env
```

---

## PM2

### Статус

```bash
pm2 list
pm2 describe golwebstudio
```

### Логи

```bash
pm2 logs golwebstudio --lines 100
```

### Перезапуск

```bash
pm2 restart golwebstudio
pm2 restart golwebstudio --update-env
```

Типичный запуск Next после build (если настраивали вручную):

```bash
cd /var/www/golwebstudio
pm2 start pnpm --name golwebstudio -- start
```

(фактическая команда может отличаться — смотреть `pm2 describe golwebstudio`.)

---

## Nginx

Проверка конфига:

```bash
nginx -t
```

Перезагрузка:

```bash
systemctl reload nginx
```

Статус:

```bash
systemctl status nginx
```

Nginx проксирует `golwebstudio.ru` → локальный порт Node (обычно `3000`).

---

## Проверка после деплоя

### 1. HTTP / сайт

```bash
curl -I https://golwebstudio.ru
```

В браузере:

- главная открывается;
- секции `#services`, `#cases`, `#contact` работают;
- в футере версия `v1.2.0 · build …` (hash меняется после каждого деплоя с новым коммитом).

### 2. API заявок (без реальной отправки спама)

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST https://golwebstudio.ru/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","contact":"+7 (900) 000-00-00","message":"deploy check","website":""}'
```

Ожидание: `200` и тело `{"ok":true}` при валидных данных и настроенном SMTP.

### 3. PM2 без ошибок

```bash
pm2 logs golwebstudio --lines 50
```

Не должно быть crash loop после `restart`.

---

## Полная пересборка (если «залип» старый билд)

```bash
cd /var/www/golwebstudio
rm -rf .next
pnpm build
pm2 restart golwebstudio --update-env
```

Подробнее: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Что не коммитить

- `.env.local`
- `.next/`
- `node_modules/`

Секреты только на сервере в `/var/www/golwebstudio/.env.local` — см. [ENVIRONMENT.md](./ENVIRONMENT.md).
