# Результаты проверок

Исследованный SHA e8c85f52edaa9c6e51d63f14a654a55a14fa1851, npm lock/version 1.3.1. Изолированный fresh worktree, Node 24.19.0, npm 11.9.0, Python 3.12.14, системный Chromium. Приватные env не копировались; live SMTP не использовался. Входные tracked-файлы не менялись.

| Команда / действие | Результат | Предел вывода |
| --- | --- | --- |
| `npm ci --cache /workspace/work/npm-cache` | exit 0, 462 packages | Чистая установка в изолированном checkout; lock неизменен |
| `npm run check` | exit 0 | Это composite команда следующих четырёх стадий |
| `npm run typecheck` внутри check | exit 0 | next typegen и tsc без emit/incremental |
| `npm run lint` внутри check | exit 0, предупреждений не было | Рекомендованные правила, не полный security proof |
| `npm test` внутри check | 69/69 Node + 11/11 Python, exit 0 | SMTP и env только mocks/temp fixtures; setup main не выполнялся |
| `npm run build` внутри check | exit 0, strict TypeScript и генерация маршрутов успешны | Производственная локальная сборка, не VPS deploy |
| `npm run test:browser` | 25/25, 1.8 min, exit 0 | Все существующие тесты без правки ожиданий; два локальных runtime, POST mocks |
| `npm ls --depth=0` | exit 0 | Прямой граф не сообщает missing/invalid peers |
| `npm audit --json` | 4 high, exit 1 ожидаемо | Dev-only одна advisory цепочка; исправления не запускались |
| `npm audit --omit=dev --json` | 0 advisories, exit 0 | Только текущий реестр runtime deps |
| Дополнительный handler harness | 11 сценариев | Реальный код общей формы в памяти, mock sender/recipient; результаты E1 |
| Дополнительный browser audit | 24 page/viewport комбинации + общие формы | 4 страницы × 6 размеров, полный DOM axe, ресурсы/ссылки, E2–E4 |
| Lighthouse 13.5.0 | Два успешных локальных mobile прогона | `/`: 80 perf, CLS .19; `/lexradar`: 97 perf, CLS 0; E5 |
| Markdown links | 31 baseline Markdown, отсутствующих относительных файлов 0 | Не проверяет внешнюю сеть и все anchors |
| Статический client bundle scan | Известные SMTP identifiers не найдены | Не поиск реальных паролей и не доказательство абсолютной секретности |

Штатные размеры: 360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080. Проверены UTM/якоря, mobile menu Escape/trap/resize, cookie storage failure, 200% text zoom на LexRadar, нативная валидация, mock success/400/429/502/504/network/malformed response, сохранение полей и запрет неопределённого повтора. Параллельные/dedupe/Origin/body/SMTP acceptance сценарии покрыты Node-тестами LexRadar. Дополнительная проверка общей формы нашла дефекты вне штатного покрытия.

Сырые локальные отчёты и harness хранятся вне tracked-документации/в ignored work и test-results; в Git опубликованы только проверенные безопасные численные выдержки в EVIDENCE. Старые docs/lexradar-*-verification не перезаписывались и не выдаются за текущие результаты.

## Что не проверено

- Production HTTP/SSH, запущенный SHA/build, PM2/Nginx, число workers, закрытость Node port, реальные proxy/edge лимиты и права сервера.
- Реальная SMTP-сеть, авторизация, DNS/SPF/DKIM/DMARC, inbox; новые письма/заявки не отправлялись.
- SMTP setup main, режимы diagnose verify/production-test и реальные env-конфликты; существующие Python unit tests используют только временные синтетические файлы.
- Реальные браузеры/устройства Safari/Firefox и screen reader, field data CWV/CrUX, внешний analytics collector, полный UX/правовой аудит.
- Актуальность законодательства, правомерность рекламных утверждений и назначение разных контактов.
- Branch protection/rulesets и панель Vercel. GitHub CLI REST был заблокирован средой; release/PR/workflow metadata прочитаны connector, остальные проверки продолжены.

Ничего не исправлялось ради зелёного результата. Отсутствие ошибок в штатных тестах не означает отсутствие ошибок в приложении.
