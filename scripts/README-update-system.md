# Система централизованного обновления и контроля версий

## Описание

Комплексная система для централизованного управления версиями и обновления всех экземпляров блогов на базе core-maugli.

## Компоненты системы

### 1. Проверка версий (`check-version.js`)

- ✅ Автоматическая проверка доступных обновлений
- ✅ Интерактивный интерфейс с подробной информацией
- ✅ Принудительная проверка при сборке
- ✅ Красивый цветной вывод с описанием изменений

### 2. Автообновление (`auto-update.js`)

- ✅ Неинтерактивное обновление для CI/CD
- ✅ Автоматическое применение всех обновлений
- ✅ Интеграция с системами непрерывной интеграции

### 3. Централизованное обновление (`update-all-blogs.js`)

- ✅ Массовое обновление множества проектов
- ✅ Синхронизация конфигурации и скриптов
- ✅ Резервное копирование и откат

## Использование

### Для разработчиков (интерактивный режим)

```bash
# Обычная сборка с проверкой версий
npm run build

# Сборка без проверки версий (быстрая)
npm run build:fast

# Принудительная проверка версий
npm run check-version

# Обновление конкретного проекта
npm run update-all-blogs /path/to/blog/project
```

### Для CI/CD (автоматический режим)

```bash
# Автообновление без интерактивных запросов
npm run auto-update

# Сборка для CI/CD (пропускает проверку версий)
npm run build:ci
# или
SKIP_VERSION_CHECK=true npm run build
```

### Массовое обновление проектов

```bash
# Создайте список проектов
echo "/Users/username/blog1
/Users/username/blog2
/Users/username/blog3" > blog-paths.txt

# Обновите все проекты
while IFS= read -r path; do
  npm run update-all-blogs "$path"
done < blog-paths.txt
```

## Интеграция с системами сборки

### GitHub Actions

```yaml
name: Build with Auto-Update
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Автообновление перед сборкой
      - name: Auto-update core-maugli
        run: npm run auto-update

      # Сборка с пропуском проверки версий
      - name: Build
        run: npm run build:ci
```

### Netlify

```toml
[build]
  command = "npm run auto-update && npm run build:ci"
  publish = "dist"
```

### Vercel

```json
{
  "buildCommand": "npm run auto-update && npm run build:ci"
}
```

## Что происходит при обновлении

### Интерактивный режим (check-version.js)

При запуске `npm run build` система:

1. 🔍 **Проверяет версии** - сравнивает текущую и последнюю версии
2. 🎉 **Показывает информацию об обновлении** - на английском языке
3. 💡 **Описывает преимущества** - новые функции и улучшения
4. ❓ **Спрашивает разрешение** - интерактивный запрос Y/n
5. 🔄 **Выполняет обновление** - при согласии пользователя
6. ✅ **Продолжает сборку** - после завершения обновления

### Автоматический режим (auto-update.js)

При запуске `npm run auto-update`:

1. 🤖 **Активирует CI/CD режим** - без интерактивных запросов
2. 🔄 **Автоматически обновляет** - до последней версии
3. 📦 **Использует полный скрипт** - обновляет все файлы и конфигурацию
4. ✅ **Завершается успешно** - или прерывает процесс при ошибке

## Пример интерактивного вывода

```
🔍 Checking for core-maugli updates...
📦 Current version: 1.2.38
📦 Latest version: 1.2.39

🎉 A new version of core-maugli is available!
════════════════════════════════════════════════════════════

📋 What's new in v1.2.39:
Astro & Tailwind CSS blog theme for Maugli.

🚀 New features include:
• Enhanced image optimization pipeline
• Improved build performance
• Better asset management
• Centralized update system
• Bug fixes and stability improvements

💡 Benefits of updating:
• Faster build times with flatten-images optimization
• Better Netlify compatibility
• Enhanced security and bug fixes
• Access to latest features and improvements

════════════════════════════════════════════════════════════

⚠️  Your current version (1.2.38) is outdated.
To ensure optimal performance and security, updating is recommended.

� Would you like to update now? (Y/n):
```

## Переменные окружения

- `SKIP_VERSION_CHECK=true` - пропускает проверку версий
- `CI=true` - автоматически активирует неинтерактивный режим

## Устранение неполадок

### "Non-interactive mode detected"

Система автоматически определяет CI/CD окружения и пропускает интерактивные запросы.

### "Version check failed"

Проверьте подключение к интернету и доступность npm registry.

### "Update failed"

Проверьте права доступа к файлам и наличие всех зависимостей.
