# Полная инвентаризация отслеживаемого проекта

Снимок `e8c85f52edaa9c6e51d63f14a654a55a14fa1851`, версия 1.3.1: **239 файлов** (до добавления аудита). Список получен `git ls-files -z`; секретные env, node_modules, .next, .git, личные backup и данные заявителей не обходились. Новые материалы аудита перечислены в README этого каталога.

Проверка использования: статический разбор локальных import/from/require и литеральных путей public, обход от Next page/layout/route. Это доказательство найденной связи, а не полная модель dynamic import, CSS, внешних потребителей и соглашений Next. Отсутствие найденной связи означает «не найдена», ничего не удаляется. UI-библиотека может иметь внутренние импорты, оставаясь недостижимой из текущих страниц. Полная таблица ниже включает каждый файл, включая архивные доказательства.

## Подсистемы

- `app/`: четыре публичные страницы, два POST API, общий layout и два набора стилей.
- `components/`: секции главной, общая форма, LexRadar, consent и библиотека UI.
- `hooks/`, `lib/`: reveal, breakpoint/toast, конфигурация, валидация, SMTP, consent, build metadata.
- `public/`: AVIF-портфолио, OG, иконки, placeholders и исходный Markdown политики. Шрифты не отслеживаются локально: next/font/google скачивает Geist/Geist Mono при сборке.
- `tests/`: 5 TypeScript suites, 1 Python suite, 2 browser suites; точные результаты в TEST_RESULTS.
- `scripts/`: SMTP CLI и установщик, генерация OG. Сетевые CLI и установщик не выполнялись.
- `.github/workflows/check.yml`: CI check + ограниченный публикацией 1.3.1 release job; нет VPS deploy job.
- `docs/`, `LOGO GOL/`, BAT: действующие инструкции, исторические материалы и исходные брендинговые ресурсы.

## Все файлы

| Файл | Тип | Назначение / функция | Связь и доказательство использования |
| --- | --- | --- | --- |
| `.env.example` | конфигурация | Публичный шаблон имён (без секрета) | Соглашение инструмента или package script; точка входа не требует импорта |
| `.github/workflows/check.yml` | конфигурация | CI и условная публикация v1.3.1 | Соглашение инструмента или package script; точка входа не требует импорта |
| `.gitignore` | конфигурация | Исключение секретов/локальных артефактов | Соглашение инструмента или package script; точка входа не требует импорта |
| `CHANGELOG.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `LOGO GOL/Untitled_logo_1_free-file.jpg` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Untitled_logo_2_free-file(1).jpg` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/d32b9618-4828-492e-ad43-b39f76d865fc.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Без названия (1).svg` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Без названия (2).svg` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Без названия.svg` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Логотип GØL с русским слоганом.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Логотип агентства _GØL_.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Логотип цифрового агентства GØL.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Презентация брендовых рекомендаций GØL.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `LOGO GOL/Чистый дизайн, сильный результат.png` | архив/ресурс | Исходный бренд-материал | Нет найденной явной ссылки из app/components/lib; назначение по каталогу, не доказательство неиспользования вне репозитория |
| `README.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `app/api/lead/route.ts` | исходник | POST /api/lead | Достижим из Next entry; импорт: tests/lead-honeypot.test.ts |
| `app/api/lexradar/route.ts` | исходник | POST /api/lexradar | Next route/layout entry |
| `app/globals.css` | исходник | Корневая компоновка/стили | Достижим из Next entry; импорт: app/layout.tsx |
| `app/layout.tsx` | исходник | Корневая компоновка/стили | Next route/layout entry |
| `app/lexradar/consent/page.tsx` | исходник | Страница /lexradar/consent | Next route/layout entry |
| `app/lexradar/lexradar.css` | исходник | Корневая компоновка/стили | Достижим из Next entry; импорт: app/lexradar/page.tsx |
| `app/lexradar/page.tsx` | исходник | Страница /lexradar | Next route/layout entry |
| `app/page.tsx` | исходник | Страница / | Next route/layout entry |
| `app/privacy/page.tsx` | исходник | Страница /privacy | Next route/layout entry |
| `components.json` | конфигурация | Настройки генератора UI | Соглашение инструмента или package script; точка входа не требует импорта |
| `components/build-version.tsx` | исходник | Серверная подпись версии | Достижим из Next entry; импорт: components/footer.tsx; без client directive; контекст задаётся импортом |
| `components/cases.tsx` | исходник | Секция главной cases | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/consent/consent-analytics.tsx` | исходник | Vercel Analytics после согласия | Достижим из Next entry; импорт: app/layout.tsx; client boundary |
| `components/consent/consent-banner.tsx` | исходник | Выбор cookies и настройки | Достижим из Next entry; импорт: components/consent/consent-shell.tsx, components/hero.tsx; client boundary |
| `components/consent/consent-provider.tsx` | исходник | Общие состояния согласий | Достижим из Next entry; импорт: components/consent/consent-analytics.tsx, components/consent/consent-banner.tsx, components/consent/consent-settings-button.tsx, components/consent/consent-shell.tsx; client boundary |
| `components/consent/consent-settings-button.tsx` | исходник | Открытие настроек cookies | Достижим из Next entry; импорт: app/lexradar/page.tsx; client boundary |
| `components/consent/consent-shell.tsx` | исходник | Провайдер и выбор размещения баннера | Достижим из Next entry; импорт: app/layout.tsx; client boundary |
| `components/final-cta.tsx` | исходник | Секция главной final-cta | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/footer-legal-links.tsx` | исходник | Политика и повторное открытие cookies | Достижим из Next entry; импорт: components/footer.tsx; client boundary |
| `components/footer.tsx` | исходник | Контакты, юридические ссылки и build version | Достижим из Next entry; импорт: app/page.tsx; без client directive; контекст задаётся импортом |
| `components/header.tsx` | исходник | Навигация, меню и фокус | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/hero.css` | исходник | Первый экран двух направлений и портфолио | Достижим из Next entry; импорт: components/hero.tsx |
| `components/hero.tsx` | исходник | Первый экран двух направлений и портфолио | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/home-page.tsx` | исходник | Композиция главной и scroll state | Достижим из Next entry; импорт: app/page.tsx; client boundary |
| `components/lead-form.tsx` | исходник | Общая форма (варианты compact/contact/inline/default) | Достижим из Next entry; импорт: components/final-cta.tsx, components/solution.tsx; client boundary |
| `components/lexradar-form.tsx` | исходник | Заявка LexRadar и клиентские состояния | Достижим из Next entry; импорт: app/lexradar/page.tsx; client boundary |
| `components/lexradar-link.tsx` | исходник | Переход с UTM | Достижим из Next entry; импорт: components/header.tsx, components/hero.tsx, components/lexradar-promo.tsx; client boundary |
| `components/lexradar-promo.tsx` | исходник | Поздний промоблок LexRadar | Достижим из Next entry; импорт: components/home-page.tsx; без client directive; контекст задаётся импортом |
| `components/problem.tsx` | исходник | Секция главной problem | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/process.tsx` | исходник | Секция главной process | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/services.tsx` | исходник | Секция главной services | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/solution.tsx` | исходник | Секция главной solution | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/testimonials.tsx` | исходник | Секция главной testimonials | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/theme-provider.tsx` | исходник | Обёртка next-themes | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/trust.tsx` | исходник | Секция главной trust | Достижим из Next entry; импорт: components/home-page.tsx; client boundary |
| `components/ui/accordion.tsx` | исходник | UI-примитив accordion | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/alert-dialog.tsx` | исходник | UI-примитив alert-dialog | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/alert.tsx` | исходник | UI-примитив alert | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/aspect-ratio.tsx` | исходник | UI-примитив aspect-ratio | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/avatar.tsx` | исходник | UI-примитив avatar | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/badge.tsx` | исходник | UI-примитив badge | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/breadcrumb.tsx` | исходник | UI-примитив breadcrumb | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/button-group.tsx` | исходник | UI-примитив button-group | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/button.tsx` | исходник | UI-примитив button | Импорт: components/ui/alert-dialog.tsx, components/ui/calendar.tsx, components/ui/carousel.tsx, components/ui/input-group.tsx; достижимость из runtime не найдена; без client directive; контекст задаётся импортом |
| `components/ui/calendar.tsx` | исходник | UI-примитив calendar | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/card.tsx` | исходник | UI-примитив card | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/carousel.tsx` | исходник | UI-примитив carousel | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/chart.tsx` | исходник | UI-примитив chart | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/checkbox.tsx` | исходник | UI-примитив checkbox | Достижим из Next entry; импорт: components/lead-form.tsx; client boundary |
| `components/ui/collapsible.tsx` | исходник | UI-примитив collapsible | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/command.tsx` | исходник | UI-примитив command | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/context-menu.tsx` | исходник | UI-примитив context-menu | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/dialog.tsx` | исходник | UI-примитив dialog | Импорт: components/ui/command.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/drawer.tsx` | исходник | UI-примитив drawer | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/dropdown-menu.tsx` | исходник | UI-примитив dropdown-menu | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/empty.tsx` | исходник | UI-примитив empty | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/field.tsx` | исходник | UI-примитив field | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/form.tsx` | исходник | UI-примитив form | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/hover-card.tsx` | исходник | UI-примитив hover-card | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/input-group.tsx` | исходник | UI-примитив input-group | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/input-otp.tsx` | исходник | UI-примитив input-otp | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/input.tsx` | исходник | UI-примитив input | Импорт: components/ui/input-group.tsx, components/ui/sidebar.tsx; достижимость из runtime не найдена; без client directive; контекст задаётся импортом |
| `components/ui/item.tsx` | исходник | UI-примитив item | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/kbd.tsx` | исходник | UI-примитив kbd | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/label.tsx` | исходник | UI-примитив label | Импорт: components/ui/field.tsx, components/ui/form.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/menubar.tsx` | исходник | UI-примитив menubar | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/navigation-menu.tsx` | исходник | UI-примитив navigation-menu | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/pagination.tsx` | исходник | UI-примитив pagination | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/popover.tsx` | исходник | UI-примитив popover | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/progress.tsx` | исходник | UI-примитив progress | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/radio-group.tsx` | исходник | UI-примитив radio-group | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/resizable.tsx` | исходник | UI-примитив resizable | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/scroll-area.tsx` | исходник | UI-примитив scroll-area | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/select.tsx` | исходник | UI-примитив select | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/separator.tsx` | исходник | UI-примитив separator | Импорт: components/ui/button-group.tsx, components/ui/field.tsx, components/ui/item.tsx, components/ui/sidebar.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/sheet.tsx` | исходник | UI-примитив sheet | Импорт: components/ui/sidebar.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/sidebar.tsx` | исходник | UI-примитив sidebar | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/skeleton.tsx` | исходник | UI-примитив skeleton | Импорт: components/ui/sidebar.tsx; достижимость из runtime не найдена; без client directive; контекст задаётся импортом |
| `components/ui/slider.tsx` | исходник | UI-примитив slider | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/sonner.tsx` | исходник | UI-примитив sonner | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/spinner.tsx` | исходник | UI-примитив spinner | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/switch.tsx` | исходник | UI-примитив switch | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/table.tsx` | исходник | UI-примитив table | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/tabs.tsx` | исходник | UI-примитив tabs | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/textarea.tsx` | исходник | UI-примитив textarea | Импорт: components/ui/input-group.tsx; достижимость из runtime не найдена; без client directive; контекст задаётся импортом |
| `components/ui/toast.tsx` | исходник | UI-примитив toast | Импорт: components/ui/toaster.tsx, components/ui/use-toast.ts, hooks/use-toast.ts; достижимость из runtime не найдена; client boundary |
| `components/ui/toaster.tsx` | исходник | UI-примитив toaster | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/toggle-group.tsx` | исходник | UI-примитив toggle-group | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/ui/toggle.tsx` | исходник | UI-примитив toggle | Импорт: components/ui/toggle-group.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/tooltip.tsx` | исходник | UI-примитив tooltip | Импорт: components/ui/sidebar.tsx; достижимость из runtime не найдена; client boundary |
| `components/ui/use-mobile.tsx` | исходник | UI-примитив use-mobile | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; без client directive; контекст задаётся импортом |
| `components/ui/use-toast.ts` | исходник | UI-примитив use-toast | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `components/visual-story.tsx` | исходник | Альтернативная визуальная секция | Явный импорт не найден; файл проверяется tsc/glob, не доказано отсутствие использования; client boundary |
| `docs/COMPONENT_MAP.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/CONTENT_STRATEGY.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/DEPLOYMENT.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/EMAIL_AND_LEADS.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/ENVIRONMENT.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/GOL_DESIGN_SYSTEM.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/PROJECT_STATUS.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/README.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/RELEASING.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/TROUBLESHOOTING.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/UI_GUIDELINES.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-dependency-audit.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-development-log.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-final-report.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-initial-audit.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-recovery.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-screenshots/lexradar-1440-full.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-screenshots/lexradar-1440-hero.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-screenshots/lexradar-390-full.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-screenshots/lexradar-390-hero.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-second-audit.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/advisories-before.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/audit-all.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/audit-runtime.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/browser.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/check.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/ci.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/lighthouse-desktop.html` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/lighthouse-desktop.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/lighthouse-mobile.html` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/lighthouse-mobile.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/smtp-diagnostic.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-002-verification/summary.json` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-003-vercel-npm.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-homepage-report.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-1024.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-1440.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-1920.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-360.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-390.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/after-768.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-1024.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-1440.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-1920.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-360.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-390.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-screenshots/before-768.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-verification/browser.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-004-verification/check.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-homepage-report.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-1024.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-1440.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-1920.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-360.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-390.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/after-768.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-1024.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-1440.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-1920.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-360.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-390.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-screenshots/cookies-768.png` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-verification/browser.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-005-verification/check.txt` | архив | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-landing-development-log.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-landing-recovery.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-landing-report.md` | документ | Исторические доказательства этапа | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-mailru-production.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-smtp-launch-checklist.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/lexradar-yandex-production.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/quality-checks.md` | документ | Команды локальной проверки | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `docs/releases/1.3.1.md` | документ | Документация проекта | Статус и содержимое: DOCUMENTATION_REVIEW.md; не runtime |
| `eslint.config.mjs` | конфигурация | ESLint/Next/React hooks | Соглашение инструмента или package script; точка входа не требует импорта |
| `hooks/use-in-view.ts` | конфигурация | IntersectionObserver для появления секций | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `hooks/use-mobile.ts` | конфигурация | Breakpoint hook | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `hooks/use-toast.ts` | конфигурация | Состояние уведомлений | Соглашение инструмента или package script; точка входа не требует импорта; client boundary |
| `lib/build-info.ts` | конфигурация | Версия package и git hash при генерации footer | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/consent-storage.ts` | конфигурация | Версионированный localStorage выбора аналитики | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/email-service.ts` | конфигурация | SMTP transport, acceptance, timeout и закрытие | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/lexradar-config.ts` | конфигурация | Runtime ready/enabled, Origin и proxy mode | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/lexradar-constants.ts` | конфигурация | Версия согласия и allowlist UTM | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/lexradar-handler.ts` | конфигурация | API LexRadar, body/rate/deduplication | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/lexradar-validation.ts` | конфигурация | Zod-контракт заявки LexRadar | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/render-simple-markdown.tsx` | конфигурация | Ограниченный рендер Markdown политики | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/smtp-config.ts` | конфигурация | Mail.ru, aliases, TLS и фиксированный получатель | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/smtp-diagnostics.ts` | конфигурация | Разбор источников настроек и стадии диагностики | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/smtp-errors.ts` | конфигурация | Разрешённые публичные коды ошибок | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `lib/utils.ts` | конфигурация | Объединение CSS-классов | Соглашение инструмента или package script; точка входа не требует импорта; без client directive; контекст задаётся импортом |
| `next-env.d.ts` | конфигурация | Типы Next | Соглашение инструмента или package script; точка входа не требует импорта |
| `next.config.mjs` | конфигурация | Next images unoptimized | Соглашение инструмента или package script; точка входа не требует импорта |
| `package-lock.json` | конфигурация | Воспроизводимый npm-граф и version | Соглашение инструмента или package script; точка входа не требует импорта |
| `package.json` | конфигурация | Зависимости, scripts, engines, version | Соглашение инструмента или package script; точка входа не требует импорта |
| `playwright.config.ts` | конфигурация | Два локальных mock runtime и browser settings | Соглашение инструмента или package script; точка входа не требует импорта |
| `postcss.config.mjs` | конфигурация | Tailwind PostCSS | Соглашение инструмента или package script; точка входа не требует импорта |
| `public/01.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/02.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/03.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/04.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/05.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/06.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/07.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/08.avif` | ресурс | Публичное изображение/иконка | Литеральная ссылка: components/hero.tsx |
| `public/apple-icon.png` | ресурс | Публичное изображение/иконка | Литеральная ссылка: app/layout.tsx |
| `public/editorial-echo-screenshot.avif` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/icon-dark-32x32.png` | ресурс | Публичное изображение/иконка | Литеральная ссылка: app/layout.tsx |
| `public/icon-light-32x32.png` | ресурс | Публичное изображение/иконка | Литеральная ссылка: app/layout.tsx |
| `public/icon.svg` | ресурс | Публичное изображение/иконка | Литеральная ссылка: app/layout.tsx |
| `public/lexradar/og.png` | ресурс | Публичное изображение/иконка | Литеральная ссылка: app/lexradar/page.tsx, scripts/create-lexradar-og.mjs, tests/browser/lexradar.spec.ts |
| `public/lexradar/og.svg` | ресурс | Публичное изображение/иконка | Литеральная ссылка: scripts/create-lexradar-og.mjs |
| `public/placeholder-logo.png` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/placeholder-logo.svg` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/placeholder-user.jpg` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/placeholder.jpg` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/placeholder.svg` | ресурс | Публичное изображение/иконка | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `public/privacy.md` | ресурс | Политика данных | Явная ссылка runtime не найдена; файл доступен по URL, это не доказательство неиспользования |
| `scripts/create-lexradar-og.mjs` | скрипт | Перегенерация OG PNG (не запускалась) | Разовая генерация; API не вызывает |
| `scripts/diagnose-smtp.ts` | скрипт | CLI диагностики (не запускался) | package.json scripts |
| `scripts/setup-mailru-smtp.py` | скрипт | Интерактивная запись env и реальный SMTP-тест (не запускался) | package.json scripts |
| `styles/globals.css` | конфигурация | Конфигурация/стили globals.css | Соглашение инструмента или package script; точка входа не требует импорта |
| `tests/browser/homepage.spec.ts` | тест | Браузерные сценарии homepage.spec | playwright.config.ts testDir |
| `tests/browser/lexradar.spec.ts` | тест | Браузерные сценарии lexradar.spec | playwright.config.ts testDir |
| `tests/consent.test.ts` | тест | Node-тесты consent.test | package.json test: tests/*.test.ts |
| `tests/lead-honeypot.test.ts` | тест | Node-тесты lead-honeypot.test | package.json test: tests/*.test.ts |
| `tests/lexradar.test.ts` | тест | Node-тесты lexradar.test | package.json test: tests/*.test.ts |
| `tests/smtp-config.test.ts` | тест | Node-тесты smtp-config.test | package.json test: tests/*.test.ts |
| `tests/smtp-diagnostics.test.ts` | тест | Node-тесты smtp-diagnostics.test | package.json test: tests/*.test.ts |
| `tests/test_smtp_setup.py` | тест | Python-тесты установщика на временных файлах | package.json test: unittest discover |
| `tsconfig.json` | конфигурация | TypeScript strict и alias | Соглашение инструмента или package script; точка входа не требует импорта |
| `vercel.json` | конфигурация | Конфигурация/стили vercel.json | Соглашение инструмента или package script; точка входа не требует импорта |
| `Запуск деплоя на сервере GOLWEBSTUDIO.bat` | архив/скрипт | Старый Windows-деплой с pnpm/reset | Не CI/не текущая процедура; не выполнялся |
