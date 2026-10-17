# Конфигурация, версия и выпуск

Имена, требования и значения по умолчанию взяты из исходников e8c85f5…; реальные env не читались. Публичный `.env.example` — шаблон, не доказательство конфигурации production.

## Инструменты и сборка

| Механизм | Фактическое состояние |
| --- | --- |
| Node / npm | engines 24.x, packageManager npm@11.9.0; использованы 24.19.0 / 11.9.0 |
| package / lock | version 1.3.1 в package.json, корне lock и packages[""]; единственный lockfile package-lock.json |
| TypeScript | strict, noEmit, alias @/*, Next plugin; skipLibCheck=true |
| Next | 16.4.2, images.unoptimized=true; ошибки типов не игнорируются |
| ESLint | TS recommended, Next recommended, hooks rules и exhaustive-deps; unused vars — warn |
| Tailwind | PostCSS v4; app/globals.css импортируется layout; styles/globals.css — альтернативный файл без найденного runtime import |
| Vercel | framework nextjs; npm ci --include=dev; npm run build; настройки панели Vercel не исследовались |
| Browser | Playwright 1 worker, retries=0, два локальных сервера 3100/3101; fake SMTP config только для UI mocks |

`npm run check`: typecheck → lint → Node/Python tests → build. Browser отдельно. Scripts smtp:diagnose и smtp:setup не являются шагами build. scripts/create-lexradar-og.mjs перезаписывает public PNG и не запускался. Установщик Python Unix-only (fcntl), меняет env только при явном интерактивном разрешении; проверены только существующие unittest fixtures, не его main и не сеть.

## SMTP — только сервер

| Имя | Фактическое правило / default |
| --- | --- |
| SMTP_HOST | Требуется smtp.mail.ru; legacy Yandex не используется |
| SMTP_PORT | По умолчанию 465; целое 1–65535 |
| SMTP_SECURE | true/false; default port===465; 465 без secure отклоняется |
| SMTP_AUTH_METHOD | LOGIN по умолчанию, также PLAIN |
| SMTP_USER | Непустой, до 254 символов, без CR/LF/NUL |
| SMTP_PASS / SMTP_PASSWORD | Совместимые имена; разные одновременно заданные значения блокируют отправку; содержимое не анализировалось |
| SMTP_FROM | Default SMTP_USER; валидный email, без CR/LF/NUL |
| MAIL_TO / LEAD_TO_EMAIL | Совместимые имена; конфликт блокирует; отсутствие обоих даёт фиксированный служебный получатель, пустое значение не даёт fallback |
| YANDEX_EMAIL / YANDEX_PASSWORD | Не применяются для отправки; диагностический код распознаёт legacy-имена |

Timeout: connect/greeting 10 s, socket 15 s, общий sender 20 s; TLS >=1.2, rejectUnauthorized=true, requireTLS для non-secure транспорта. Разные допустимые порты не означают, что провайдер принимает все порты: сеть не проверялась. Нельзя делать SMTP-переменные NEXT_PUBLIC_. Наличие синтаксической конфигурации не доказывает авторизацию и доставку.

## Допуск LexRadar

| Имя | Правило |
| --- | --- |
| LEXRADAR_FORM_ENABLED | Только строка true; отдельно от ready |
| LEXRADAR_SITE_ORIGIN | HTTPS origin без credentials/path/query/hash; HTTP только localhost/127.0.0.1/[::1] |
| LEXRADAR_ABUSE_MODE | single-process либо edge; иначе ready=false |
| LEXRADAR_TRUST_PROXY | Только true разрешает выбранный IP header |
| LEXRADAR_CLIENT_IP_HEADER | x-real-ip либо x-vercel-forwarded-for, одиночный корректный IP |
| LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED | В edge ровно true + clientIpHeader; это декларация оператора, не реализация внешнего limiter |

ready = валидный origin + SMTP/recipient config + abuseMode (+ edge требования). UI и API требуют enabled AND ready. Без конфигурации LexRadar закрыт. Общая LeadForm не имеет этого флага и остаётся визуально доступной; sendEmail без SMTP возвращает ошибку, не фиктивный успех. Источники Next production: process → .env.production.local → .env.local → .env.production → .env. В свежем worktree секретных файлов не создавали и не копировали.

## CI, релиз и production

Check workflow запускается на PR и push main: npm ci → check → install Chromium → browser. Затем только на main и после check job допускается publish-release. Он ограничен package version 1.3.1; существующий Release пропускается, существующий tag без Release не передвигается, notes из docs/releases/1.3.1.md. Права contents:write только у release job. Сейчас v1.3.1 уже существует, а аудит не меняет workflow/версию и не создаёт релиз.

Публикация документационной ветки может вызвать существующие GitHub/Vercel Preview-интеграции. Это не установка на VPS. Настройки интеграций, branch protections и секреты Actions не исследовались/не менялись. Открытые #1/#5 оставлены владельцу. Не считать старый BAT текущим механизмом выпуска: он содержит destructive reset и pnpm; не выполнялся.

## Безопасная сверка серверного кода владельцем

Команда только для владельца в известном каталоге приложения; **аудитор её на production не выполнял**:

```sh
cd /var/www/golwebstudio &&
GIT_OPTIONAL_LOCKS=0 git rev-parse HEAD &&
GIT_OPTIONAL_LOCKS=0 git rev-parse --abbrev-ref HEAD &&
GIT_OPTIONAL_LOCKS=0 git -c core.quotePath=true diff --name-only HEAD &&
GIT_OPTIONAL_LOCKS=0 git -c core.quotePath=true ls-files --others --exclude-standard
```

Только SHA, ветка и имена изменённых/неотслеживаемых файлов; содержимое/env/PM2 не выводится, fetch/build/restart нет. Чистый checkout не доказывает соответствие запущенного build, ignored-файлов и окружения. При отличиях остановить обновление и отдельно согласовать исследование; не применять reset/clean.
