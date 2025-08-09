# Changelog

## [1.2.68] - 2025-08-09

### Исправления

- 🔧 **PWA Build Fix**: Исправлена критическая ошибка сборки `ENOTDIR: not a directory, mkdir 'dist/sw.js/'`
- ⚙️ **PWA Конфигурация**: Правильно подключен VitePWA плагин в astro.config.mjs
- 🚫 **Роутинг PWA**: Добавлен `/^\/sw\.js$/` в navigateFallbackDenylist для корректной обработки service worker

### Удалено

- ❌ `src/pages/sw.js.astro` (вызывал конфликт сборки)
- ❌ `src/middleware.ts` (больше не нужен)
- ❌ `public/sw.js` (placeholder больше не нужен)

## [1.2.67] - 2025-08-09

### Исправления

- 🔧 **PWA Service Worker маршрутизация**: Исправлены предупреждения `[WARN] [router] A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`/sw.js\``
- 🧹 **Очистка скриптов**: Удалены 6 неиспользуемых скриптов из папки `/scripts`
- ⚡ **Автоматическое обновление**: Скрипт обновления теперь автоматически создает файл `src/pages/sw.js.astro` для корректной работы PWA

### Добавлено

- 📄 Файл `src/pages/sw.js.astro` для обработки PWA service worker запросов
- 📚 Обновлен UPGRADE-GUIDE.md с инструкциями по исправлению PWA

### Удалено

- ❌ `scripts/check-version-old.js` (неиспользуемый)
- ❌ `scripts/copy-content-images.cjs` (неиспользуемый)
- ❌ `scripts/copy-netlify-config-simple.js` (неиспользуемый)
- ❌ `scripts/generate-previews-build.js` (неиспользуемый)
- ❌ `scripts/test-package-update.js` (неиспользуемый)
- ❌ `scripts/test-version-update.js` (неиспользуемый)

## [1.2.66] - 2025-08-08

### Предыдущие изменения

- Базовая функциональность блога
- Система генерации превью изображений
- PWA поддержка
