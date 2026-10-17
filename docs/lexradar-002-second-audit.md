# Повторная самостоятельная ревизия

17.10.2026, после этапа `e954171`, до финальных проверок. Сначала повторно выполнены unit tests/typecheck/lint. Затем пересмотрены handler, transport, cookie lifecycle, mobile keyboard, payload/consent/UTM и regression scope.

## Дополнительно найдено и исправлено

| Проблема | Доказательство | Исправление/проверка |
|---|---|---|
| Cookie storage failure ломает взаимодействие | `writeConsent` вызывал localStorage.setItem без try/catch; SecurityError прерывал handler до закрытия banner | Сохраняется выбор в памяти, после reload запрос повторяется. Добавлены unit и настоящий browser test с бросающим Storage.setItem |
| Escape из mobile drawer не возвращал фокус; Tab мог уйти под overlay | Активный menu link становился inert после закрытия, keyboard не возвращался на opener | Фокус возвращается кнопке, Tab/Shift-Tab ограничены видимыми drawer links/opener, прокрутка body восстановлена при cleanup. Дополнен browser regression |
| UUID не попадал в письмо | Handler deduplicates по UUID, но admin не мог сопоставить неопределённую доставку со своей копией письма | В текст/HTML добавлен UUID, проверен реальный подготовленный mail payload в тесте |
| Storage parsing принимал произвольную/старую версию без timestamp | Проверялись лишь booleans | Валидируется версия и timestamp, повреждённые данные не считаются согласием |
| CTA на 360 px оказался у нижней границы первого экрана | Реальный screenshot после расширенной фразы срочности | Фраза сокращена без потери смысла, добавлена проверка положения primary CTA на мобильных размерах |

## Что перепроверено

- TypeScript проходит без any/ignoreBuildErrors/подавления diagnostics. ESLint без предупреждений.
- 49 unit/integration tests (добавлен storage regression), HTTP handler не заменяется копией; тестовый SMTP только mock. Native Next route остаётся тонким экспортом фабрики.
- HTTP ok не равен успеху UI: требуется `ok:true` и `code:ACCEPTED`; malformed JSON/неполный ответ/сеть/SMTP error не сбрасывают поля и не показывают success.
- Недоверенный XFF игнорируется; trusted header требует явной конфигурации, origin не зависит от forwarded host. В режиме edge переменная сама не создаёт инфраструктуру. Ограничения single-process/30 min idempotency явно описаны, exactly-once между replicas не заявляется.
- Timeout SMTP 20 сек + чтение 10 сек < client timeout 40 сек. После неопределённого результата transport закрывается и повтор UI блокируется; доставку после сетевого разрыва доказать нельзя.
- В логи не добавлена PII или SMTP raw errors. Конфигурационная диагностика выдаёт booleans, не значения. TLS verification не отключена.
- LexRadar client imports не тянут Zod/config/SMTP; общие UTM/constants отделены от server modules.
- Старые разделы сохранены. Browser regression проверяет их anchors/анимацию cases, переходы, menu; `/api/lead` отвечает прежним CONSENT_REQUIRED без отправки.
- Analytics требует согласия для монтирования, beforeSend перечитывает его после отзыва; новых трекеров нет.
- Политика, consent version и payload перечисляют фактические поля; оператор взят из существующего подтверждённого текста. Неподтверждённые санкции не возвращены.

После этого commit повторяются clean npm ci, check, browser/axe, Lighthouse и проверка Git refs. Окончательные результаты и ограничения — `lexradar-002-final-report.md`; этот документ не подменяет их прогнозом.
