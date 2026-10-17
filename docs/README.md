# Документация GØL Web Studio · 1.3.1

Актуальная отправная точка — [README проекта](../README.md). Сайт студии и LexRadar используют Next.js и Mail.ru SMTP; автоматического аудита нет.

| Документ | Назначение |
|---|---|
| [PROJECT_STATUS](PROJECT_STATUS.md) | Что сохранено, подтверждено и ещё не проверено |
| [DEPLOYMENT](DEPLOYMENT.md) | Безопасная сверка, развёртывание и восстановление |
| [ENVIRONMENT](ENVIRONMENT.md) | Имена переменных и условия ready/enabled |
| [Mail.ru production](lexradar-mailru-production.md) | Настройка SMTP, проверка и включение |
| [EMAIL_AND_LEADS](EMAIL_AND_LEADS.md) | Форма → API → письмо, ограничения |
| [TROUBLESHOOTING](TROUBLESHOOTING.md) | Закрытая форма, Origin, SMTP, PM2 |
| [Quality checks](quality-checks.md) | Проверки без настоящих писем |
| [RELEASING](RELEASING.md) | Версия, PR, тег, GitHub Release |
| [CHANGELOG](../CHANGELOG.md) | История изменений |
| [UI_GUIDELINES](UI_GUIDELINES.md) | Правила интерфейса |
| [COMPONENT_MAP](COMPONENT_MAP.md) | Карта компонентов |
| [CONTENT_STRATEGY](CONTENT_STRATEGY.md) | Контент |
| [GOL_DESIGN_SYSTEM](GOL_DESIGN_SYSTEM.md) | Дизайн-система |

## Архив

`lexradar-landing-*`, `lexradar-002-*`, `lexradar-003-*`, `lexradar-004-*`, `lexradar-005-*` — отчёты этапов, а не текущие инструкции сервера. Старые результаты относятся только к указанным в них SHA. Старые утверждения о закрытой форме и непроверенной доставке относятся к времени подготовки этих этапов.

`lexradar-yandex-production.md` и `lexradar-smtp-launch-checklist.md` оставлены как исторические материалы Яндекса. Не применять их SMTP-параметры, fallback или команды восстановления к текущему Mail.ru. Старый Windows BAT-деплой использует pnpm и git reset --hard; не запускать его. Текущая процедура — только DEPLOYMENT.
