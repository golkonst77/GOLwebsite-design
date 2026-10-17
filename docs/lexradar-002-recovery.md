> **АРХИВ: исторический отчёт этапа.** Не инструкция для текущего production. Актуальны [индекс документации](README.md), [Mail.ru](lexradar-mailru-production.md) и [статус](PROJECT_STATUS.md). Указанные ниже проверки, ограничения и настройки относятся к прежнему коммиту; команды Яндекса/pnpm/старого отката не применять.

# Восстановление GØL–LEXRADAR–002

Исходный PR #2: https://github.com/golkonst77/GOLwebsite-design/pull/2.
База: `8072038fcae3188e41b3c5f0b7da2cac3fab3b50`.
Ветка: `feat/lexradar-hardening-002`. База её PR — `feat/lexradar-landing-2026-10-17`, не main.

## Контрольные точки

| Этап | SHA |
|---|---|
| Исходный этап 001 / PR #2 | `8072038fcae3188e41b3c5f0b7da2cac3fab3b50` |
| Независимая ревизия до изменения кода | `40d68f5d9496347ef66e0901c01e593fc90f2edd` |
| Исправление nullable DOM refs | `be403c9291ac192bce08de1686e48e9c1c4146ea` |
| Воспроизводимые проверки и strict build | `daaa3114658d10eecaeb3f2f621e209980a766e2` |
| API/SMTP hardening и независимые TS tests | `e29849f908d8252d92b44d69af0d97c5a7caa8bc` |
| UX/SEO/PNG/consent/browser suite | `e95417132965cedcb44fd603ebc4d8c640ce146f` |
| Повторная ревизия, storage/focus/UUID | `5cc3f8ffc4b6f499e8096942d678ac93c19141ed` |
| Проверяемый финальный код, security dependency update | `97f7a455334010e556944e39ff1fa4452fb3174d` |

Следующий documentation-only commit сохраняет итоговый отчёт/скриншоты/это руководство. Его точный итоговый SHA указан в PR и финальном сообщении, `git rev-parse HEAD`. Собственный SHA нельзя вписать в содержимое того же коммита без изменения SHA. Все значимые code checkpoints сохранены на GitHub; force push и удаление старых refs не выполняются.

## Безопасный просмотр и возврат

Сначала отдельно сохранить незакоммиченные пользовательские изменения. Не применять reset --hard к рабочей ветке.

```sh
git fetch origin
git log --oneline --decorate origin/feat/lexradar-hardening-002
git diff --stat 8072038fcae3188e41b3c5f0b7da2cac3fab3b50 origin/feat/lexradar-hardening-002
git worktree add --detach ../gol-lexradar-002-baseline 8072038fcae3188e41b3c5f0b7da2cac3fab3b50
```

Для любой точки таблицы заменить последний SHA и выбрать новый пустой каталог. При необходимости продолжить исправление — создать в worktree новую recovery-ветку, не передвигать опубликованные refs.

У каждого checkout свои зависимости/настройки. Для точек после настройки checks — Node >=22.13, npm ci и npm run check. Старые точки имеют известные исходные TS/lint/security ограничения, описанные в audit. Не запускать их как новую production-версию только ради проверки истории.

Первоначальная точка до LexRadar `checkpoint/gol-before-lexradar-2026-10-17` должна оставаться на `a976ef766895e40c86005804eec6244121e71bca`. Эта работа не меняет ни её, ни main, ни ветку PR #2.

## Если hardening PR когда-либо будет слит

Работать через новую rollback-ветку и отдельный PR к ветке, в которую реально были приняты изменения. Узнать реальный merge/squash/rebase SHA через GitHub. Для merge с первым родителем — целевой веткой: `git revert -m 1 <фактический_merge_SHA>`; для squash: `git revert <фактический_squash_SHA>`. Для rebase отменять относящиеся к этапу коммиты в обратном порядке, вручную проверяя последующие зависимости. Не подставлять нынешний HEAD вместо будущего merge SHA.

Если затем общий PR #2 уже вошёл в main, отдельно определить, требуется отменить только 002 или весь LexRadar. Создать rollback PR от актуального main и проверить diff: revert всего PR #2 затронет также этап 001. Не переписывать main/опубликованную историю и не запускать автоматический откат.

## Git и production — разные операции

Возврат кода не меняет работающий сайт, environment, SMTP credentials, DNS или ingress rules. В рамках этой задачи production не развёртывался и runtime env не изменялся. Публикация/откат deployment требуют отдельного разрешения владельца и штатной процедуры.

При проблемах с формой администратор отдельно выключает LEXRADAR_FORM_ENABLED и проверяет уведомление/503, затем следует `lexradar-smtp-launch-checklist.md`. Ротация SMTP-секрета — через окружение, не Git. После восстановления кода форма не считается проверенной автоматически: нужны конфигурация, trusted proxy, реальная доставка и правовая приёмка. После неопределённого SMTP результата не делать автоматическую повторную отправку.
