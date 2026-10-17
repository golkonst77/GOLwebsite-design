> **АРХИВ: исторический отчёт этапа.** Не инструкция для текущего production. Актуальны [индекс документации](README.md), [Mail.ru](lexradar-mailru-production.md) и [статус](PROJECT_STATUS.md). Указанные ниже проверки, ограничения и настройки относятся к прежнему коммиту; команды Яндекса/pnpm/старого отката не применять.

# GØL–LEXRADAR–002 — итоговый отчёт

17 октября 2026. Работа завершена отдельной веткой `feat/lexradar-hardening-002`; целевой PR — в `feat/lexradar-landing-2026-10-17`.

Исходный SHA: `8072038fcae3188e41b3c5f0b7da2cac3fab3b50`.
Финальный проверенный код: `97f7a455334010e556944e39ff1fa4452fb3174d`.
Следующий commit содержит только отчёты/доказательства/восстановление. Его итоговый SHA и URL нового PR указаны в PR и финальном сообщении; это не иной непроверенный код.

**Результат:** страница сохранена и доведена, проверки воспроизводимы и проходят. Автоматическая/браузерная готовность подтверждена в локальном production runtime. Публикация и включение формы ещё требуют реальной SMTP-доставки, проверки инфраструктуры и ручной правовой приёмки. Merge, production deploy и изменение работающего сайта не выполнялись.

## Что найдено и исправлено

[Первичная независимая ревизия](lexradar-002-initial-audit.md) проведена до изменения приложения; [повторная ревизия](lexradar-002-second-audit.md) — после первых проверок.

- 8 исходных TS ошибок: правильно типизированы section/div refs и nullable аргумент useInView. Стабилизированы dependencies и cleanup IntersectionObserver без изменения порогов/once и дизайна анимаций. Нет any, подавления diagnostics или пропуска TS при сборке.
- Неверный URL больше не приводит к исключению из safeParse. Проверяются схемы http(s), отсутствие credentials, обязательные поля/consent version/UUID, управляющие символы, email, телефон и длины.
- Origin сверяется с отдельной конфигурацией публичного origin, не с forwarded Host. Произвольный первый XFF игнорируется. Форма закрыта без явной корректной конфигурации. Single-process и edge режимы имеют документированные границы.
- Тело ограничено 16 KiB по реально прочитанным байтам и 10 сек, включая chunked input; honeypot/5 попыток за 10 минут/ограниченная память.
- Повтор UUID в одном процессе в пределах 30 мин не отправляет второе письмо; изменённый payload даёт 409. Глобальная идемпотентность между replicas/после restart не заявляется.
- SMTP проверяет accepted/rejected, имеет общий timeout 20 сек, закрывает transport, возвращает безопасные коды. Raw ошибки/секреты/PII не пишутся в логи. Неопределённая доставка не называется успехом; повтор UI блокируется и предлагается уточнение статуса. UUID теперь включён в admin email.
- Форма имеет native validation/состояния/сохранение данных при ошибке, отдельное согласие, актуальную версию текста и UTM. Неизвестный/неполный ответ API и сетевой сбой не дают ложного success.
- Cookie storage failure больше не ломает кнопки; choice проверяется по версии/времени. Analytics монтируется только после согласия, beforeSend учитывает отзыв. На LexRadar можно повторно открыть настройки cookies.
- Mobile menu: невидимые ссылки inert, aria-expanded/controls, Escape и возврат фокуса, Tab loop, освобождение body scroll при закрытии и переходе к desktop. Старые разделы не удалены.
- PNG 1200×630, Open Graph/Twitter Card, canonical/absolute URLs, skip link, реальные font variables. Отсутствующий arrow glyph заменён SVG. Основной CTA помещается в первом экране 360/390 px.
- Адресно исправлены runtime dependency advisories: Next 16.4.2 (major 16 сохранён), Nodemailer 10.1.2, согласованные типы/Next plugin и совместимые transitives. [Основания обновления и остаточный dev advisory](lexradar-002-dependency-audit.md).

## Финальные проверки на обновлённом стеке

Node 24.19.0, npm 11.9.0, Chromium 154.0.8037.57, Playwright 1.64.1. Production build — Next 16.4.2.

| Проверка | Фактический результат |
|---|---|
| `npm ci --no-audit --no-fund` | Успешно, 462 packages; lock воспроизводим |
| `npm run typecheck` | Успешно: Next typegen + tsc --noEmit |
| `npm run lint` | Успешно, без ошибок и предупреждений |
| `npm test` | **50/50** unit/integration tests, реальные handler/schema/email sender с mock transport |
| `npm run build` | Успешно, TypeScript действительно включён |
| `npm run check` | Успешно целиком: typecheck → lint → tests → build |
| `npm run test:browser` | **19/19**, 46.5 сек, без retries |
| axe WCAG A/AA | 0 нарушений в области LexRadar на каждом из шести viewport |
| Runtime `npm audit --omit=dev` | **0** advisories |
| Полный `npm audit` | 4 high записи одной dev-only braces цепочки, без опубликованного совместимого исправления; не скрыты |
| `git diff --check` | Успешно |
| SMTP `--verify` | Пропущен: sender/password отсутствуют; реальная доставка не проверялась |

[Полные результаты check](lexradar-002-verification/check.txt), [браузера](lexradar-002-verification/browser.txt), [чистой установки](lexradar-002-verification/ci.txt), [SMTP-диагностики](lexradar-002-verification/smtp-diagnostic.txt), [runtime audit](lexradar-002-verification/audit-runtime.json), [полного audit](lexradar-002-verification/audit-all.json), [машинная сводка](lexradar-002-verification/summary.json).

## Реальная браузерная проверка

Проверены 360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080. Нет горизонтальной прокрутки; кнопки не обрезаны, primary CTA виден в первом мобильном экране. Проверены якоря и сохранение UTM, главная/её секции/анимация cases, desktop/mobile ссылки, Escape/focus/resize, skip link, 200% увеличение текста, cookies при заблокированном storage, legal routes, PNG/metadata и HTTP-ответ выключенного API. Старый `/api/lead` сохраняет CONSENT_REQUIRED для заявки без согласия.

Для включённой формы на отдельном локальном сервере использована только mock-конфигурация, все POST перехвачены Playwright. Проверены нативные required/email, пустой необязательный телефон, UTM, success, 400/429/502/504, сеть и повреждённый ответ. Это настоящие UI-тесты, но **не сквозная SMTP-доставка**. Скриншоты после финального build просмотрены вручную.

Сохранённые снимки:

- [Desktop, первый экран](lexradar-002-screenshots/lexradar-1440-hero.png) · [Desktop, вся страница](lexradar-002-screenshots/lexradar-1440-full.png).
- [Mobile, первый экран](lexradar-002-screenshots/lexradar-390-hero.png) · [Mobile, вся страница](lexradar-002-screenshots/lexradar-390-full.png).
- Скрипт браузерных тестов генерирует hero/full снимки всех шести разрешений в игнорируемом `test-results/screenshots`.

## Lighthouse и производительность

Lighthouse 13.5.0 запущен последовательно на локальном `next start`, форма выключена, свежая браузерная сессия. Измерения от 17.10.2026 около 10:01 МСК, не на опубликованном домене.

| Метрика | Mobile (default simulated throttling) | Desktop preset |
|---|---:|---:|
| Performance | **98** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |
| FCP | 1.2 сек | 0.3 сек |
| LCP | 2.2 сек | 0.6 сек |
| Total Blocking Time | 80 мс | 0 мс |
| CLS | 0 | 0 |

Передано 183 913 байт JS (9 запросов), 68 196 байт шрифтов; общий transfer 304 702 байта, 22 запроса. Third-party requests — 0. Страница остаётся server component; server config/Zod/SMTP не импортируются формой, общие UTM/constants отделены. PNG используется для social preview, не добавляет image request первого экрана. Тяжёлая новая клиентская библиотека для лендинга не добавлялась.

Это единичные локальные лабораторные измерения, не гарантия скорости на production или у всех посетителей. Сетевая доставка, SMTP, реальные устройства и другие браузеры требуют приёмки после разрешённого размещения.

Отчёты: [mobile HTML](lexradar-002-verification/lighthouse-mobile.html), [mobile JSON](lexradar-002-verification/lighthouse-mobile.json), [desktop HTML](lexradar-002-verification/lighthouse-desktop.html), [desktop JSON](lexradar-002-verification/lighthouse-desktop.json). HTML можно скачать и открыть локально.

## Перед публикацией: блокирующие условия

1. **SMTP:** настроить контролируемые учётные данные/получателя и доказать реальную доставку через форму на отдельном стенде. До этого production-флаг не включать. Конфигурационная диагностика/transport mocks не заменяют проверку ящика.
2. **Инфраструктура:** проверить фактический canonical domain и LEXRADAR_SITE_ORIGIN, доступ SMTP IPv6/587, overwrite доверенного IP header, недоступность прямого Node port, лимиты тела/времени, один процесс либо реально настроенный общий edge limit между replicas. Флаг подтверждения сам не настраивает защиту.
3. **Юридическая приёмка:** подтвердить текущую редакцию/применимость частей ст. 13.11 КоАП и итоговые тексты согласия/политики/условий услуги. Доступ к правовой базе ранее заблокирован (CONNECT 403), неопределённость не объявлена устранённой. Суммы штрафов не добавлялись. Внешняя проверка не устанавливает инциденты/неуведомление РКН/внутренние процессы. Реквизиты не выдумывались; оператор — ИП Голубев Константин Анатольевич из существующей политики, исполнитель — ИП Голубев.
4. **Разрешение владельца:** этот PR не разрешает merge/deploy. Нужна отдельная команда на публикацию и включение формы после предыдущих пунктов.

[Точный SMTP/proxy launch checklist](lexradar-smtp-launch-checklist.md) включает переменные, безопасную диагностику, процедуру теста и восстановления после ошибки.

## Неблокирующие вопросы и пределы

- Upstream dev-only braces advisory: следить за исправлением, не понижать Next lint plugin до 14 ради формального нулевого audit.
- Chromium проверен; Safari/Firefox/физические устройства не проверялись. 200% тест касается увеличения текста, не всех вариантов системного масштаба.
- Rate limit/idempotency в памяти не переживают restart и не синхронизированы между серверами. Они не заменяют описанный ingress control и не дают глобальный exactly-once.
- Канонический домен и social preview проверены по metadata/PNG HTTP на стенде; preview crawler мессенджера на публичном домене не вызывался.

## История и восстановление

[Журнал](lexradar-002-development-log.md) · [контрольные точки и восстановление](lexradar-002-recovery.md) · [команды качества](quality-checks.md).
Все значимые этапы отправлены на GitHub обычными fast-forward pushes. Перед финализацией удалённые refs main и исходной checkpoint остались на `a976ef766895e40c86005804eec6244121e71bca`, ветка PR #2 — на исходном `8072038fcae3188e41b3c5f0b7da2cac3fab3b50`. Рабочее дерево после коммита отчётов должно быть чистым. Секреты, .env.local, node_modules и .next не входят в изменения. Восстановление Git отделено от отката production.
