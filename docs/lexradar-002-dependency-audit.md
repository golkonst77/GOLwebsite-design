# Проверка зависимостей

17.10.2026. Read-only `npm audit --omit=dev --json` после clean install выявил 8 затронутых пакетов: critical Next, high Nodemailer/PostCSS/sharp/browserslist/nanoid/source-map-js и moderate baseline-browser-mapping. Это сведения npm advisory по версиям, а не доказательство эксплуатации каждого состава в этом приложении.

Подтверждённые основания обновления:

- Next App Router/RSC применяется в проекте; исходный Next 16.2.0 затронут в том числе [DoS Server Components](https://github.com/advisories/GHSA-q4gf-8mx6-v5v3) и другими advisories. Переход на исправленный Next 16.4.2 сохраняет major 16 и совместимость React 19.
- Nodemailer используется реально. Исходные версии затронуты, в частности [DNS/TLS servername reuse](https://github.com/advisories/GHSA-6vj9-mwq6-2f5v) и [addressparser backtracking](https://github.com/advisories/GHSA-v53p-9fqp-m79j). Явно обновлён до 10.1.2; типы до @types/nodemailer 8.0.2. Используемые SMTP/sendMail/verify/close API проверяются типами, mock transport tests и сборкой; реальная SMTP доставка по-прежнему не проверена.
- Обновлены совместимые версии PostCSS и затронутых transitives: PostCSS 8.5.23, sharp 0.35.5, browserslist 4.29.3, baseline-browser-mapping 2.11.29, nanoid 3.3.20, source-map-js 1.2.2. Next ESLint plugin синхронизирован до 16.4.2.

Не использовались force/legacy-peer-deps, автоматический audit fix или произвольные overrides. Package lock фиксирует фактический граф. Все проверки повторяются на обновлённом стеке, старые результаты не подменяют новые.

## Остаточное ограничение dev tooling

Полный audit сообщает 4 high записи в одной dev-only цепочке: `@next/eslint-plugin-next → fast-glob → micromatch → braces`. Причина — [stack-exhaustion при глубоко вложенных glob patterns, GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). На дату проверки последние доступные braces 3.0.3 и micromatch 4.0.8 ещё затронуты. npm предлагает downgrade Next plugin до 14.2.35; он не применяется к проекту Next 16 ради искусственного нулевого audit.

Цепочка не входит в production dependency set, её glob patterns используются инструментом разработчика, не HTTP input сайта. Это документированный неблокирующий вопрос dev-инструментов: следить за upstream fix и обновить совместимую цепочку после выхода исправления. Никакой «полностью нулевой audit всех зависимостей» не заявляется. Итог runtime audit и новые check/browser результаты приведены в финальном отчёте.
