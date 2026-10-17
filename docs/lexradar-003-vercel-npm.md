> **АРХИВ: исторический отчёт этапа.** Не инструкция для текущего production. Актуальны [индекс документации](README.md), [Mail.ru](lexradar-mailru-production.md) и [статус](PROJECT_STATUS.md). Указанные ниже проверки, ограничения и настройки относятся к прежнему коммиту; команды Яндекса/pnpm/старого отката не применять.

# GØL–LEXRADAR–003: npm и Vercel Preview

Дата: 17.10.2026. Ветка: `feat/lexradar-hardening-002`, PR #3.
Исходный SHA: `2dd1b4dd6b942c69919cac852a6ea238654f2183`.

## Установленные факты

- Актуальная удалённая ветка на старте совпадала с указанным SHA, дерево было чистым.
- На этом SHA единственный lockfile — `package-lock.json` (v3), packageManager — `npm@11.9.0`. pnpm/yarn/bun lock-файлов, .npmrc, .vercel/project.json и vercel.json не было.
- `pnpm-lock.yaml` уже удалён коммитом `daaa3114658d10eecaeb3f2f621e209980a766e2`. Повторное удаление не требуется. В исходном SHA этапа 001 `8072038fcae3188e41b3c5f0b7da2cac3fab3b50` этот файл ещё присутствует.
- README сохранял шаблонные команды yarn/pnpm, хотя проект уже был переведён на npm.
- GitHub statuses для `8072038…` показывали failure двух Vercel-проектов. Ошибка ERR_PNPM_OUTDATED_LOCKFILE приведена владельцем; прямой доступ к полным Vercel build logs/проектным настройкам в этой сессии отсутствует.
- Для актуального `2dd1b4d…` обе интеграции уже сообщили success: [v0-golwebsite-design](https://vercel.com/gols-projects-5d52f388/v0-golwebsite-design/8fyoW2tiLsJYwm62nDL9Qrny66k4), [go-lwebsite-design](https://vercel.com/gols-projects-5d52f388/go-lwebsite-design/5Fs8acpX2Go2dTdStCxbCA2MV78J). Это статусы исходного SHA, не подтверждение результата нового коммита 003 и не browser-проверка опубликованного Preview.

## Исправление

Добавлен `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "npm ci --include=dev",
  "buildCommand": "npm run build"
}
```

Команда установки теперь явно использует npm. `--include=dev` устанавливает TypeScript/Tailwind и другие необходимые build-инструменты даже при NODE_ENV=production. Frozen lockfile не отключается; package-lock не удаляется и не генерируется при deployment.

`engines.node` закреплён на `24.x` в package.json и корне package-lock, вместо открытого диапазона >=22.13.0. Это протестированный major, предотвращающий автоматический переход на иной major в Vercel. packageManager npm@11.9.0 сохранён; фактическую версию npm на Vercel следует читать в build log. Граф и версии зависимостей не изменены.

README и quality-checks приведены к npm. Routes, outputDirectory, redirects, функции, SMTP/секреты и логика LexRadar не менялись. Нового инфраструктурного сервиса нет.

## Локальное подтверждение

Окружение: Node 24.19.0, npm 11.9.0.

- `NODE_ENV=production npm ci --include=dev --no-audit --no-fund` — успешно, 462 packages.
- `npm run check` — успешно: Next typegen/tsc, ESLint без ошибок/предупреждений, 50/50 tests, production build Next 16.4.2 с включённым TypeScript.
- package-lock изменён только в engines корневого пакета; зависимости сохранены.
- JSON Vercel конфигурации и наличие единственного npm lockfile проверены. Отдельный Vercel CLI build не запускался: нет project credentials/настроек, локальный next build не выдаётся за Vercel deployment.
- Проверки бизнес-логики не изменялись, новые тесты для декларативных install/build команд не добавлялись.

Итоговый SHA коммита и фактические новые Vercel statuses фиксируются в PR #3 и итоговом сообщении. Перед push выполнен git diff --check. Merge/main/production deploy не выполняются.

## Точная проверка настроек Vercel

Проверить **оба** подключённых проекта: `v0-golwebsite-design` и `go-lwebsite-design`.

1. В Deployment открыть Source: нужны Git branch `feat/lexradar-hardening-002` и новый SHA коммита 003. Redeploy старого `8072038…` повторно собирает старый исходник с pnpm-lock; для визуальной приёмки выбрать актуальный branch/commit.
2. Project Settings → Build and Deployment: Root Directory — корень этого репозитория, где лежат package.json/package-lock.json/vercel.json. Проверить, что Vercel привязан к `golkonst77/GOLwebsite-design`.
3. Framework Preset — Next.js. Install Command — штатное значение из vercel.json `npm ci --include=dev`; Build Command — `npm run build`. Если настройки проекта/другого root всё ещё задают pnpm, убрать устаревшее переопределение либо явно поставить эти npm-команды. Репозиторный vercel.json должен применяться к выбранному root; настройки в интерфейсе в этой задаче не редактировались.
4. Node.js Version — 24.x (package.json engines также фиксирует 24.x). Output Directory — стандартное значение Next.js, без пользовательского dist/out.
5. Проверить унаследованные environment overrides: старые npm_config_user_agent, NPM_CONFIG_USERCONFIG, NPM_CONFIG_PACKAGE_LOCK=false, скрипты, принудительно запускающие pnpm. Не выводить значения секретов. packageManager уже npm; отдельный pnpm/corepack bootstrap для этого проекта не нужен.
6. Убедиться, что Git/Preview integration разрешена для этой ветки. Для проверки требуется Preview, не Promote to Production и не merge main.
7. Если новая автоматическая Preview-сборка использует старый install cache, владелец может выполнить Redeploy **нового SHA** с выключенным Use existing Build Cache (название в интерфейсе может отображаться как Use build cache). Это не исправляет выбор старого SHA или неверного Root Directory; сначала проверить пункты 1–3.
8. В новых логах должны быть npm ci и npm run build, без ERR_PNPM_OUTDATED_LOCKFILE; Next build обязан завершиться успешно. После Ready открыть фактический Preview URL `/lexradar` и провести визуальную приёмку. Не объявлять новый deployment успешным по одному локальному build.

Если новый GitHub Vercel status остаётся failure/pending, нужны source SHA, root и безопасная часть install/build logs без секретов. Диагностику вести по этому deployment, не удалять npm lock и не добавлять --no-frozen-lockfile к pnpm.

## Возврат

Этот этап — один логический коммит поверх `2dd1b4d…` в той же ветке PR #3. Для просмотра исходного состояния использовать отдельный detached worktree на исходном SHA. Для отмены в будущем — новый revert-коммит в review-ветке и PR, без force push/reset main. Возврат Git-конфигурации не меняет уже опубликованный deployment. Производственных действий этот этап не выполняет.
