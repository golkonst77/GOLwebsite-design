# Безопасные доказательства и воспроизведения

Исходники не изменялись. Ниже только необходимые результаты с синтетическими данными; сырые серверные/SMTP/env-логи не публикуются. Дополнительные harness-файлы оставлены в игнорируемом work и в PR не входят: это разовые проверки аудита, не изменение существующих тестов.

## E1 — реальный обработчик общей формы, mock SMTP

Прочитан app/api/lead/route.ts из исследованного SHA; esbuild преобразовал TS в памяти, vm загрузил его с настоящим NextRequest/NextResponse. Только импорт sendEmail заменён на счётчик с success=true и задержкой 20 ms, getLeadRecipient — на синтетическую цель. Остальная логика handler сохранена. Для каждого сценария отдельный module/Map. Это проверка кода обработчика, не SMTP, Nginx или публичного сайта.

Базовые синтетические данные: непустые имя/задача, корректный телефон РФ, consent=true, пустой website. Контрольные примеры без consent, с honeypot, пробельным именем и неверным телефоном отвергаются до mock sender.

| Сценарий | HTTP | Вызовы mock send | Безопасный ответ |
| --- | --- | --- | --- |
| optional_message_empty | 400 | 0 | {'ok': False, 'error': 'VALIDATION_ERROR'} |
| malformed_json | 500 | 0 | {'ok': False, 'error': 'BAD_REQUEST'} |
| foreign_origin_text_plain | 200 | 1 | {'ok': True} |
| body_over_16k_unknown_field | 200 | 1 | {'ok': True} |
| no_consent | 400 | 0 | {'ok': False, 'error': 'CONSENT_REQUIRED'} |
| honeypot | 400 | 0 | {'ok': False, 'error': 'VALIDATION_ERROR'} |
| whitespace_name | 400 | 0 | {'ok': False, 'error': 'VALIDATION_ERROR'} |
| invalid_phone | 400 | 0 | {'ok': False, 'error': 'INVALID_PHONE'} |
| five_sequential_same_ip | [200, 200, 200, 429, 429] | 3 | {} |
| five_concurrent_same_ip | [200, 200, 200, 200, 200] | 5 | {} |
| five_forged_forwarded_addresses | [200, 200, 200, 200, 200] | 5 | {} |

Воспроизведение по смыслу: вызвать реальный POST с NextRequest и mock sender, не отправлять эти запросы на production. Для Origin передать foreign.example.invalid, Sec-Fetch-Site=cross-site и text/plain с JSON body; для body добавить неизвестное поле padding из 20 000 букв. Последовательные 5 одинаковых запросов одного IP дают 3 отправки, параллельные 5 — все 5. Для проверки доверия передать 5 разных документальных адресов 192.0.2.x в XFF. Ни реальный IP клиента, ни реальная цель не требуются.

## E2 — runtime browser, две общие формы

Локальный production server 127.0.0.1:3400 запущен с чистым процессным окружением и выключенным LexRadar. Для широкой браузерной проверки внешняя сеть и все немокированные non-GET блокировались. POST /api/lead перехвачен ответами 400 VALIDATION_ERROR и 200 ok:true, без обращения к SMTP.

- Найдены две общие формы: compact в Solution и contact в FinalCTA.
- Клик по `#contact label[for=lead-consent-pd]`: compact aria-checked=true, contact=false. Причина — одинаковый ID двух checkbox.
- Валидные имя/телефон + согласие, пустая textarea: UI отправил message=""; mock реального ответа 400 показал общую ошибку. Введённое имя сохранилось.
- После ввода задачи и повторного клика submit disabled во время ожидаемого mock; затем показан success. Всего 2 mock запроса. Это не доказательство реальной доставки.

## E3 — страницы и axe WCAG A/AA

После загрузки посещены секции для reveal; затем проверены полный DOM и axe. Скролл возвращался наверх. Тесты не включают реальный screen reader/устройства и не являются полной сертификацией доступности. No pageerror зафиксировано; штатные тесты также проверяют отсутствие hydration/runtime ошибок. Полный сбор всех console warning в дополнительном harness не выполнялся.

| Страница | Viewport | HTTP | Горизонтальное переполнение | Page errors | axe violations: число узлов |
| --- | --- | --- | --- | --- | --- |
| `/` | 360×800 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 360×800 | 200 | нет | 0 |  |
| `/privacy` | 360×800 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 360×800 | 200 | нет | 0 |  |
| `/` | 390×844 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 390×844 | 200 | нет | 0 |  |
| `/privacy` | 390×844 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 390×844 | 200 | нет | 0 |  |
| `/` | 768×1024 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 768×1024 | 200 | нет | 0 |  |
| `/privacy` | 768×1024 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 768×1024 | 200 | нет | 0 |  |
| `/` | 1024×768 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 1024×768 | 200 | нет | 0 |  |
| `/privacy` | 1024×768 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 1024×768 | 200 | нет | 0 |  |
| `/` | 1440×900 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 1440×900 | 200 | нет | 0 |  |
| `/privacy` | 1440×900 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 1440×900 | 200 | нет | 0 |  |
| `/` | 1920×1080 | 200 | нет | 0 | color-contrast: 14 |
| `/lexradar` | 1920×1080 | 200 | нет | 0 |  |
| `/privacy` | 1920×1080 | 200 | нет | 0 | color-contrast: 2 |
| `/lexradar/consent` | 1920×1080 | 200 | нет | 0 |  |

На `/` повторяется один тип color-contrast для 14 узлов, на `/privacy` для 2 узлов; это не 96 независимых дефектов. Пример footer: #6b7280 на #050510, 14 px regular, 4.19:1 вместо 4.5:1. Пример подписи контакта privacy: 12 px, 3.72:1 вместо 4.5:1. Штатный hero-only axe не охватывает footer — противоречия с зелёным тестом нет.

Ниже — точные селекторы на 1440 px:

### /

- `.md\:col-span-1 > .mb-4.leading-relaxed.text-muted-foreground`
- `li:nth-child(1) > .hover\:text-foreground[href$="#services"]`
- `li:nth-child(2) > .hover\:text-foreground[href$="#services"]`
- `li:nth-child(3) > .hover\:text-foreground[href$="#services"]`
- `li:nth-child(4) > .hover\:text-foreground[href$="#services"]`
- `li:nth-child(1) > .hover\:text-foreground[href$="#cases"]`
- `li:nth-child(2) > .hover\:text-foreground[href$="#testimonials"]`
- `a[href$="#process"]`
- `li:nth-child(1) > a[href$="gol_studio"][target="_blank"][rel="noopener noreferrer"]`
- `a[href$="mailto:hello@gol.studio"]`
- `.md\:items-start > .text-muted-foreground.text-sm`
- `.hover\:text-gold\/90.text-white\/40[href$="privacy"]`
- `.hover\:text-gold\/90.text-white\/40[type="button"]`
- `.font-mono.tracking-wide.text-muted-foreground`
### /privacy

- `.mt-8`
- `.text-gold\/80`

## E4 — ресурсы, ссылки и метаданные

Все **21 tracked public-ресурс** проверены GET на локальном server: 200. Уникальные внутренние page targets `/`, `/lexradar`, `/privacy`, `/lexradar/consent` — 200; все проверенные локальные hash-якоря существуют. Абсолютные ссылки собственного домена для проверки сопоставлялись локальному маршруту; production не посещался. Проверка Markdown relative links во всех 31 исходном Markdown-документе не выявила отсутствующих файлов (HTTP внешних ссылок/anchors Markdown не проверялся).

На LexRadar title/canonical/OG/Twitter совпадают с исходниками и штатными тестами; PNG 1200×630. На главной canonical/OG отсутствуют; на privacy/consent тоже отсутствуют. Все четыре страницы имеют один H1. В клиентских .next/static файлах поиск имён SMTP_PASS, SMTP_PASSWORD, YANDEX_PASSWORD, smtp.mail.ru, nodemailer совпадений не дал. Проверка имён/границы импортов не доказывает отсутствие любого возможного секрета; реальные секреты не читались и их производные не вычислялись.

## E5 — зависимости и performance

`npm audit`: 4 high package entries одной dev-only цепочки @next/eslint-plugin-next → fast-glob → micromatch → braces, advisory GHSA-vfj7-8cjw-p6xm, fixAvailable=false. `npm audit --omit=dev`: 0 advisories. Это снимок реестра на момент проверки, не пожизненная гарантия.

Lighthouse 13.5.0, локальный production server, Chromium, один холодный mobile-прогон на маршрут, эмуляция 412×823 / DPR 1.75, simulated CPU slowdown 4, RTT 150 ms / throughput 1638.4 Kbps. Cookie consent заранее не принимался. Эти измерения **не являются production CWV/CrUX**.

| Маршрут | Perf / A11y / Best / SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| `/` | 80 / 96 / 100 / 100 | 1.4 s | 3.7 s | 50 ms | 0.19 |
| `/lexradar` | 97 / 100 / 100 / 100 | 1.2 s | 2.4 s | 70 ms | 0 |

Для главной Lighthouse отметил два layout shift, предполагаемую экономию image delivery 96 KiB, unused JS 25 KiB и render blocking ~340 ms. Это направления отдельного исследования; причина CLS и реальные production значения не установлены. SEO 100 не означает наличие всех возможных metadata, a11y score не заменяет полную проверку.
