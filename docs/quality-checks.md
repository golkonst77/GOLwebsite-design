# Воспроизводимые проверки

Node 24.x, npm 11.9 (`packageManager`). Единственный lockfile — `package-lock.json`; устаревший pnpm lock удалён, чтобы Next/CI не выбирали другой граф зависимостей. Не смешивать npm/pnpm в одном checkout.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run check
```

`check` последовательно запускает typegen/TypeScript, ESLint, unit/integration tests, production build. Сборка больше не пропускает ошибки типов. Next fonts требует доступ к fonts.googleapis.com/fonts.gstatic.com при чистой сборке.

ESLint 10 с typescript-eslint, React hooks rules/exhaustive-deps и официальными Next rules. Не используется eslint-config-next 16.2.0, чьи transitive peer dependencies пока не поддерживают ESLint 10. Версии фиксированы в package.json/lock; `npm ls` не выявляет конфликтов. Локальные unit/mock тесты не подтверждают SMTP-доставку.

Браузерные проверки запускаются отдельно `npm run test:browser`, используют локальный production build, не рабочий сайт. Системный Chromium можно задать через CHROMIUM_EXECUTABLE_PATH; иначе используется /usr/bin/chromium, если найден, либо браузер Playwright (установить отдельно `npx playwright install chromium`). На облачном контейнере используется --no-sandbox только для локальной QA-сессии. Тесты сами поднимают два локальных сервера на 3100/3101: с выключенной формой и с mock-конфигурацией. Все POST включённой формы перехвачены тестами, SMTP-писем они не отправляют. Подробности и SMTP-подготовка — в документах LexRadar-002. Секреты не нужны для unit и browser mocks.

Настройки npm/Node для Vercel и диагностика старых pnpm deployments: [LexRadar-003](lexradar-003-vercel-npm.md). `vercel.json` явно задаёт `npm ci --include=dev` и `npm run build`; Node major закреплён engines=24.x.

## Проверка снимка 1.3.1

[Аудит 17.10.2026](audit/2026-10-17/TEST_RESULTS.md): 69 Node + 11 Python тестов, 25 browser сценариев, сборка и дополнительные проверки вне штатного покрытия. Зелёные тесты hero/LexRadar не доказывают отсутствие дефектов общей формы и footer. Новые материалы не заменяют исторические отчёты этапа 002.

## Telegram fixtures

`npm test` также запускает `tests/telegram*.test.ts` и Python `test_telegram_setup.py` через общий шаблон `test_*setup.py`. Используются только mock fetch/email и синтетические temp files; реальные Telegram/SMTP отправки и setup main не выполняются. Существующие LexRadar fixtures явно подменяют notification hook. [Описание новой функции](TELEGRAM_NOTIFICATIONS.md).
