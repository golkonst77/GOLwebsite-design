# Воспроизводимые проверки

Node >=22.13, npm 11.9 (`packageManager`). Единственный lockfile — `package-lock.json`; устаревший pnpm lock удалён, чтобы Next/CI не выбирали другой граф зависимостей. Не смешивать npm/pnpm в одном checkout.

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

Браузерные проверки запускаются отдельно `npm run test:browser`, используют локальный production build, не рабочий сайт. Подробности и SMTP-подготовка — в документах LexRadar-002. Секреты не нужны для unit и browser mocks.
