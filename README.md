# GØL Web Studio · 1.3.1

Сайт веб-студии и LexRadar — приём заявок на бесплатную предварительную юридическую проверку сайта. Заявки обрабатываются вручную. Автоматический аудит не подключён.

- [Рабочий сайт](https://www.golwebstudio.ru/) · [LexRadar](https://www.golwebstudio.ru/lexradar)
- [Документация](docs/README.md) · [Изменения](CHANGELOG.md) · [Статус и подтверждения](docs/PROJECT_STATUS.md)

## Разработка

Node.js **24.x**, npm **11.9.0**, Python 3 для тестов установщика. Единственный lockfile — `package-lock.json`. Next.js 16.4.2, React 19, Tailwind CSS 4, Nodemailer. Не смешивать npm с pnpm/yarn.

```sh
npm ci
npm run dev
```

Открыть http://localhost:3000. Для просмотра сайта SMTP не требуется; форма LexRadar на новой установке остаётся закрытой. Имена серверных переменных описаны в [ENVIRONMENT](docs/ENVIRONMENT.md); реальные значения и секреты не хранить в Git.

## Проверки и сборка

```sh
npm run check
npm run test:browser
```

`check`: типизация, ESLint, Node/Python-тесты, production build. Для браузерных тестов нужен Chromium: `npx playwright install chromium` либо системный браузер. Тесты используют локальное окружение и mock-транспорт; настоящие письма не отправляют. [Подробности](docs/quality-checks.md).

```sh
npm run build
npm start
```

## Устройство и эксплуатация

- `/api/lead` — общая форма сайта; `/api/lexradar` — отдельная заявка LexRadar.
- Общий SMTP-сервис: `lib/email-service.ts`, конфигурация: `lib/smtp-config.ts`.
- Форма LexRadar: `components/lexradar-form.tsx`; допуск к работе: `lib/lexradar-config.ts`.
- Письмо принимается Mail.ru, рабочий почтовый контакт — golwebstudio@bk.ru.
- Юридические страницы: `/privacy`, `/lexradar/consent`.

[Telegram-уведомления LexRadar: скрытый ввод токена и проверка готовности формы](docs/TELEGRAM_NOTIFICATIONS.md).

[Развёртывание и восстановление](docs/DEPLOYMENT.md), [почта и данные заявки](docs/EMAIL_AND_LEADS.md), [диагностика](docs/TROUBLESHOOTING.md), [SMTP и безопасное включение](docs/lexradar-mailru-production.md).

Владелец подтвердил реальное получение заявки из production-формы 17 октября 2026 года. Это подтверждение владельца, а не повторная отправка из CI. SHA серверных исходников пока не сверён с GitHub. Контрольная ветка `snapshot/lexradar-working-2026-10-17` сохраняет GitHub-код и запись проверки, но не файлы сервера.

## Версии и публикация

Версия берётся из `package.json`; lockfile и CHANGELOG обновляются вместе. [Порядок выпуска](docs/RELEASING.md). Релиз кода не означает автоматическую установку на VPS. Существующие интеграции Vercel/v0 могут реагировать на GitHub; их настройки этим выпуском не меняются.

## Технический аудит

[Подробная инвентаризация и аудит исходников 1.3.1 от 17.10.2026](docs/audit/2026-10-17/README.md): результаты проверок, реестр проблем, границы production-подтверждений. Это документационный снимок, не исправление кода.
