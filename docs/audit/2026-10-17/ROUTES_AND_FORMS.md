# Маршруты, формы и интерфейсные состояния

## Страницы и публичные данные

| Маршрут | Содержание / metadata | Проверка |
| --- | --- | --- |
| `/` | Два направления, портфолио, две общие формы; title/description/icons из layout; canonical и OG не заданы | 200, один H1, меню/якоря/UTM, 6 размеров; контраст footer требует отдельной задачи |
| `/lexradar` | Ручная предварительная проверка; риски/результат/порядок/цена/форма/партнёры/FAQ; собственные canonical/OG/Twitter | 200, force-dynamic, H1, FAQ, disabled и enabled mock состояния |
| `/privacy` | Markdown из public/privacy.md; оператор и ссылки | 200, H1; отдельные contact-подписи имеют низкий контраст |
| `/lexradar/consent` | Версия v3, оператор, цели/поля/отзыв, ссылка политики | 200, H1, версия совпадает с schema и UI |
| `/lexradar/og.png` | OG 1200×630 | 200, PNG; размеры проверены штатным browser test |
| `/privacy.md` | Публичный исходник политики | 200; не секретный env |
| Неизвестный путь | Стандартный Next not-found | Не является отдельной бизнес-страницей; ресурс `_not-found` виден в build output |

На `/` и юридических страницах canonical/OG не определены; это рекомендация SEO, не доказанный сбой навигации. На LexRadar canonical и og:url — https://www.golwebstudio.ru/lexradar, og:image — абсолютный PNG, twitter summary_large_image. title/description юридической страницы согласия минимальны. В tracked app нет sitemap/robots route; необходимость решает владелец. Юридические страницы доступны и согласованы с v3; актуальность норм, реальная обработка аналитикой, локализация/трансграничная передача и регистрационные обязанности отдельно не удостоверены.

## Контракты API

### POST `/api/lead`

UI передаёт name, contact (телефон РФ), message, website honeypot, consent=true. Сервер trim строк, нормализует 10/11 цифр в +7, требует имя/телефон/**message**, consent boolean true, пустой honeypot; пределы 100/150/2000 символов. Неизвестные поля игнорируются. В UI textarea в compact/contact не required и описывается как короткая задача, поэтому пустое значение достигает API и отвергается (APP-04).

| Статус | Ответ |
| --- | --- |
| 200 | ok:true после SMTP acceptance |
| 400 | VALIDATION_ERROR, CONSENT_REQUIRED, INVALID_PHONE |
| 429 | ok:false и текст о слишком большом числе отправок |
| 503 | SEND_FAILED при невалидной цели |
| 500 | SEND_FAILED при sender failure; BAD_REQUEST при исключении/невалидном JSON |

Отдельные application-level Origin/Content-Type/body-timeout/idempotency проверки отсутствуют. Лимит 3 **успешные** отправки/10 минут, запись после await; IP берётся без явной границы доверия из первого XFF. Нельзя приписывать этому endpoint защиту LexRadar.

### POST `/api/lexradar`

Обязательные: requestId UUID, consentVersion ровно v3, site http(s) URL <=500 без userinfo, name 1–100, email <=254, consent=true. Optional phone <=30 с 7–15 цифрами или пустой, comment <=2000, company honeypot пуст, пять UTM <=200 каждый. Однострочные поля исключают control chars; comment допускает переносы и tab, запрещает опасные управляющие символы. JSON неизвестные поля Zod удаляет. Сервер не обходит URL сайта.

503 UNAVAILABLE → 403 ORIGIN → 415 CONTENT_TYPE / 413 BODY_SIZE → 400 CLIENT_ADDRESS → 429 RATE_LIMIT → 400 INVALID_BODY / VALIDATION → 409 REQUEST_CHANGED → 200 ACCEPTED / 502 SEND_FAILED / 504 DELIVERY_UNCONFIRMED. Порядок важен для диагностики; размер stream проверяется фактически, а не только по заголовку. Все ответы no-store. Счётчик попыток учитывается до schema/deduplication, поэтому повтор того же requestId всё равно расходует окно лимита.

## Матрица состояний

| Состояние | Общая форма | LexRadar | Доказательство |
| --- | --- | --- | --- |
| Без конфигурации | UI открыт; sender возвращает ошибку | fieldset/submit disabled + email | Исходники и локальный runtime |
| Required/consent | Native required name/phone; JS телефон/checkbox; дублированный ID consent | Native required site/name/email/checkbox + server schema | Browser fixtures + исходники |
| Optional | message в UI необязателен, но server требует; inline имеет fallback, в текущем runtime не используется | phone/comment пустыми принимаются | Локальные mocks/штатные тесты |
| Sending | disabled submit, текст Отправка; fetch без client timeout | active ref + disabled fieldset, aria-busy; timeout 40 s | Проверка pending и исходники |
| Ошибка | Общая подсказка; поля сохранены; разрешён повтор | Понятный code-specific текст; поля сохранены | Browser mock error→retry |
| Успех | Только response.ok и ok:true, сброс формы/спасибо | Только ok:true и ACCEPTED, сброс + блокировка | Browser mocks; не подтверждают inbox |
| Неопределённая доставка | Не выделена отдельно, повтор разрешён | uncertain, запрещён повтор, альтернативный контакт | Исходники + 504/network mocks |
| Повтор | Нет requestId/dedupe; сервер снова отправляет | Тот же payload/UUID разделяет результат; SEND_FAILED создаёт новый UUID | Реальный handler factory на mock sender |

У двух общих форм одинаковый id lead-consent-pd: клик по подписи нижней меняет checkbox верхней. Локально проверены ошибки required/телефона/consent, сохранение имени, pending disabled и успех на моках. Общая форма не предоставляет специального закрытого состояния; не нужно пытаться включать её флагом LexRadar. Не запускались настоящие POST на рабочий сайт, SMTP или автоматический аудит.
