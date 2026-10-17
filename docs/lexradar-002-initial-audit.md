# Независимая ревизия GØL–LEXRADAR–002

17.10.2026. Проверен исходный PR #2, SHA `8072038fcae3188e41b3c5f0b7da2cac3fab3b50` до изменения приложения. Рабочее дерево чистое, main не менялся. Далее — подтверждённые проблемы и границы проверки, а не утверждения об эксплуатации.

| ID / серьёзность | Доказательство и файлы | Исправление |
|---|---|---|
| A01 / высокая | `lexradarSchema.safeParse({site:'not a URL', ...})` выбрасывает TypeError: `.url().refine()` всё равно вызывает `new URL` для dirty value. lib/lexradar-validation.ts; API не перехватывает это | Безопасный parser с try/catch; негативные тесты через реальный handler |
| A02 / высокая при включении | API берёт первый X-Forwarded-For без доверенной границы; смена заголовка создаёт новый bucket. app/api/lexradar/route.ts | Явные режимы proxy/IP; fail closed без конфигурации, общий запасной bucket, обязательный edge limit для replicas |
| A03 / средняя | Origin сравнивается с request.nextUrl.origin, который зависит от host/proxy; нет независимого ожидаемого origin | Настраиваемый канонический origin, HTTPS в production, не доверять forwarded host |
| A04 / средняя | Map локален процессу; нет гарантии лимита между workers/replicas | Не изображать distributed protection: режим single process либо подтверждённый лимит на доверенном ingress; инструкция и negative tests |
| A05 / средняя | Поток тела ограничен байтами, но время чтения не ограничено | Таймер чтения/отмена потока, тест chunked и зависшего reader |
| A06 / средняя | Клиентский timeout 25 сек не ограничивает всю SMTP-сессию; повторный submit после потерянного ответа может отправить второе письмо. Нет idempotency | Ограничение SMTP-сессии, повтор того же request ID в одном процессе, состояние неопределённой доставки; не обещать exactly-once между replicas |
| A07 / средняя | sendEmail считает любой fulfilled sendMail успехом, не проверяя accepted/rejected; ошибки транспорта могут содержать внутренние сведения | Проверка приёма получателя, стабильные коды ошибок, закрытие транспорта, без SMTP деталей наружу |
| A08 / средняя | tsc: 8 ошибок RefObject<null> → RefObject<HTMLElement>; useInView ожидает non-null, ref inferred null | Правильные DOM generic и nullable ref в hook; стабильные primitive dependencies, disconnect при cleanup |
| A09 / средняя | package scripts только dev/build/start/lint, eslint отсутствует; next.config пропускает typecheck. Два lockfile, npm lock имеет старую версию root | Воспроизводимые typecheck/lint/test/check/build, современный ESLint совместимый с TS/React; один канонический npm lock; убрать ignoreBuildErrors после исправления |
| A10 / средняя | app/layout.tsx подключает Vercel Analytics при production независимо от выбора согласия, в то время как баннер обещает обратное | Подключать только после согласия, тест сетевых запросов/рендера |
| A11 / низкая | OG только SVG, Twitter Card отсутствует. app/lexradar/page.tsx | PNG 1200×630, Twitter summary_large_image, проверка HTTP metadata |
| A12 / низкая | Consent не перечисляет UTM и время/версию согласия, которые уходят в письмо; privacy уже содержит UTM | Согласовать фактическую обработку, сохранить подтверждённое имя оператора |
| A13 / низкая | Форма показывает cause.message, включая сетевые/неожиданные серверные сообщения; телефон из одних знаков проходит regex | Типизированные публичные ошибки, сохранение полей/статуса при сбоях, проверка количества цифр |

## Что уже сделано корректно

Серверная динамическая страница соответствует App Router; только форма/ссылки клиентские. Обязательные поля имеют labels/native validation, есть aria-live и focus. API не посещает URL сайта (нет SSRF в этой реализации), ограничивает байты тела даже без Content-Length, HTML экранируется, Reply-To проходит email validation, тема статична. Старые разделы не удалены. Неподтверждённые штрафы исключены. Новая инфраструктура не нужна.

## Что ещё предстоит измерить

Browser/Playwright, все шесть viewport, реальные переходы/UTM/ошибки и keyboard, PNG preview, Lighthouse/axe и объём JS. Chromium найден `/usr/bin/chromium`; до реального запуска визуальные результаты не заявляются. SMTP credentials отсутствуют; доставку на реальный ящик эта ревизия не подтверждает. Текущая редакция КоАП и применимость составов остаются на ручной правовой проверке. main/production не затрагиваются.

ESLint 10.13.0 — текущая версия; стандартный eslint-config-next 16.2.0 зависит от react/import plugins с peer только до ESLint 9. Поэтому вместо конфликтующего preset или устаревшего ESLint 9 планируется ESLint 10 + совместимые typescript-eslint, react-hooks и официальный @next/eslint-plugin-next напрямую. Выбор проверен через npm peer metadata.
