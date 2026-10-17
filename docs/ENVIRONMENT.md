# Переменные окружения

Актуальная инструкция запуска LexRadar: [SMTP, proxy и включение](./lexradar-smtp-launch-checklist.md).

Файл .env.local не коммитится. На сервере хранить с правами 600, либо использовать secret environment службы. Next.js загружает файл при dev/build/start, диагностическая команда — через @next/env.

| Переменная | Назначение |
|---|---|
| SMTP_HOST | DNS-имя SMTP, для production smtp.yandex.ru |
| SMTP_PORT | 465 для TLS или 587 для STARTTLS, по умолчанию 587 |
| SMTP_SECURE | true на 465, false для обязательного STARTTLS; по умолчанию определяется по порту |
| SMTP_USER | golkonst@yandex.ru |
| SMTP_PASS | Пароль приложения Яндекса; SMTP_PASSWORD — совместимое прежнее имя |
| SMTP_FROM | Разрешённый адрес отправителя; по умолчанию SMTP_USER |
| MAIL_TO / LEAD_TO_EMAIL | golwebstudio@mail.ru; этот же адрес используется, если переменная не задана |

SMTP_HOST, SMTP_USER и SMTP_PASS (или SMTP_PASSWORD) необходимы для универсальной конфигурации. SMTP_FROM необходим, если логин не является email. В production указать golkonst@yandex.ru. Конфликт значений SMTP_PASS/SMTP_PASSWORD или MAIL_TO/LEAD_TO_EMAIL блокирует отправку. Указание любой SMTP_* включает универсальный режим; старые секреты Яндекса в нём не используются.

Для сохранения старой конфигурации можно оставить только YANDEX_EMAIL / YANDEX_PASSWORD и полностью удалить все SMTP_* из файла и окружения процесса. Тогда сохраняется прежний транспорт IPv6 Yandex с проверкой сертификата.

Для формы дополнительно нужны LEXRADAR_SITE_ORIGIN и LEXRADAR_ABUSE_MODE. В edge-режиме требуются LEXRADAR_TRUST_PROXY=true, LEXRADAR_CLIENT_IP_HEADER и LEXRADAR_EDGE_RATE_LIMIT_CONFIRMED=true после проверки proxy/общего лимита. Подробности — в инструкции запуска.

LEXRADAR_FORM_ENABLED=false остаётся до реального SMTP-теста и проверки получения письма. Наличие реквизитов само по себе форму не включает.

Настройка на VPS:

```sh
cd /var/www/golwebstudio
# Заполнить .env.local через редактор, не вставлять пароль в командную строку.
chmod 600 .env.local
npm run smtp:diagnose
npm run smtp:diagnose -- --verify
# Отправляет одно настоящее синтетическое письмо; проверить ящик вручную.
npm run smtp:diagnose -- --production-test
```

После изменения настроек перезапустить службу штатно, например pm2 restart golwebstudio --update-env. Убедиться, что старые переменные процесса не перекрывают .env.local. Для Vercel использовать Environment Variables нужного окружения и новый deployment.

Не использовать NEXT_PUBLIC_* для почты. Не включать SMTP debug, не публиковать .env, пароли и сырые ответы SMTP. Диагностика выводит безопасные статусы/коды, источники и дубликаты. Полная инструкция одной команды и разбора EAUTH: [Яндекс SMTP](./lexradar-yandex-production.md).
