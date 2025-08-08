# Исправление проблемы с forceUpdate

## Проблема

Пользователи устанавливали `"forceUpdate": true` в `maugli.config.ts`, но система все равно запрашивала подтверждение обновления вместо автоматического обновления.

## Исправление в версии 1.2.62

### Что было исправлено:

1. **Улучшен парсинг конфигурации** - скрипт `scripts/check-version.js` теперь правильно извлекает настройку `forceUpdate` из секции `automation` в файле `maugli.config.ts`

2. **Добавлена подробная диагностика** - теперь скрипт показывает:
   - Найден ли файл `maugli.config.ts`
   - Какое значение имеет `forceUpdate`
   - Обнаружена ли CI/CD среда

3. **Исправлено регулярное выражение** для поиска настройки `forceUpdate` в конфигурации

### Как проверить, что исправление работает:

1. Обновитесь до версии 1.2.62:

   ```bash
   npm update core-maugli
   ```

2. Убедитесь, что в `src/config/maugli.config.ts` установлено:

   ```typescript
   automation: {
     forceUpdate: true;
   }
   ```

3. Запустите команду build и проверьте вывод:

   ```bash
   npm run build
   ```

4. В выводе должно быть:

   ```
   🔧 Configuration check:
      • maugli.config.ts found: Yes
      • forceUpdate setting: true
      • CI/CD detected: false

   🤖 Force update enabled in config. Updating automatically...
   ```

### Если проблема остается:

1. Проверьте путь к файлу конфигурации: `src/config/maugli.config.ts`
2. Убедитесь, что секция `automation` правильно оформлена
3. Проверьте, что нет синтаксических ошибок в TypeScript

## Техническая информация

### Старое регулярное выражение (не работало):

```javascript
const forceUpdateMatch = configContent.match(/automation:\s*{[^}]*?forceUpdate:\s*(true|false)/s);
```

### Новое регулярное выражение (работает):

```javascript
const automationMatch = configContent.match(/automation\s*:\s*{([^}]+)}/s);
const forceUpdateMatch = automationSection.match(/forceUpdate\s*:\s*(true|false)/);
```

### Дополнительные улучшения:

- Добавлено логирование процесса чтения конфигурации
- Добавлена диагностическая информация о найденных настройках
- Улучшена обработка ошибок при парсинге конфигурации
