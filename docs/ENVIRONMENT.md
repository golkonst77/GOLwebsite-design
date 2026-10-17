# Переменные окружения

Текущая почтовая конфигурация — Mail.ru, один ящик golwebstudio@bk.ru для отправки и получения. [Настройка, диагностика и включение](./lexradar-mailru-production.md).

| Переменная | Значение |
|---|---|
| SMTP_HOST | smtp.mail.ru |
| SMTP_PORT | 465 |
| SMTP_SECURE | true |
| SMTP_AUTH_METHOD | LOGIN |
| SMTP_USER | golwebstudio@bk.ru |
| SMTP_FROM | golwebstudio@bk.ru |
| MAIL_TO | golwebstudio@bk.ru |
| SMTP_PASS | Пароль приложения, только в секретном окружении/.env.local |

SMTP_PASSWORD и LEAD_TO_EMAIL остаются совместимыми именами; конфликтующие значения блокируют отправку. Установщик удаляет старые определения и оставляет только SMTP_PASS / MAIL_TO. Яндекс и его IPv6 fallback больше не используются; явный smtp.yandex.ru также отклоняется.

Не использовать NEXT_PUBLIC_* для почты. Не хранить пароль в Git, логах, аргументах команд или отчётах. Все .env-файлы, кроме .env.example, исключены из Git. Установщик проверяет точное сохранение пароля через реальный загрузчик Next перед записью и устанавливает права 600.

LEXRADAR_FORM_ENABLED=false до настоящего SMTP-теста и подтверждения письма владельцем. Установщик дополнительно проверяет готовность origin/защиты до предложения включить форму. LEXRADAR_SITE_ORIGIN, LEXRADAR_ABUSE_MODE и настройки доверенного proxy сохраняются; single-process допустим только для одного процесса, edge требует общего ingress-limit.

После одобренного развёртывания выполнить npm run smtp:setup в интерактивном терминале из /var/www/golwebstudio. Nginx/PM2 не меняются автоматически. Старые экспортированные значения shell/службы нужно согласовать отдельно: они могут перекрывать файл Next.js.
