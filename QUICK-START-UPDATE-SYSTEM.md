# Quick Start Guide: Принудительное обновление версий

## 🚀 Что нового?

Теперь при каждой сборке (`npm run build`) система автоматически:

1. **Проверяет наличие обновлений** core-maugli
2. **Показывает новые функции** на английском языке
3. **Предлагает обновиться** с интерактивным выбором Y/n
4. **Выполняет полное обновление** при согласии

## 📋 Команды

### Для разработчиков

```bash
npm run build          # Сборка с проверкой версий
npm run build:fast     # Быстрая сборка без проверки
npm run check-version  # Принудительная проверка версий
```

### Для CI/CD

```bash
npm run auto-update    # Автообновление без запросов
npm run build:ci       # Сборка для CI/CD
```

### Для управления блогами

```bash
npm run update-all-blogs /path/to/blog    # Обновить один блог
```

## ⚙️ Переменные окружения

```bash
export SKIP_VERSION_CHECK=true    # Пропустить проверку версий
export CI=true                    # Активировать CI режим
```

## 🎯 Результат

- ✅ Все 100+ блогов можно обновлять централизованно
- ✅ Принудительная проверка при каждой сборке
- ✅ Красивый интерфейс с описанием обновлений
- ✅ Автоматический режим для CI/CD
- ✅ Полная совместимость со всеми системами сборки

## 🔄 Пример работы

```
🔍 Checking for core-maugli updates...
📦 Current version: 1.2.38
📦 Latest version: 1.2.39

🎉 A new version of core-maugli is available!
════════════════════════════════════════════════════════════

📋 What's new in v1.2.39:
• Enhanced image optimization pipeline
• Improved build performance
• Better asset management
• Centralized update system

🔄 Would you like to update now? (Y/n): Y

✅ Update completed successfully!
✅ Proceeding with build...
```

## 🛠️ Интеграция

Система автоматически интегрируется в любой проект core-maugli и не требует дополнительной настройки!
