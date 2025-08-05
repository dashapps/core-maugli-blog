# Система централизованного обновления блогов

## Описание
Скрипт `update-all-blogs.js` предназначен для централизованного обновления всех экземпляров блогов на базе core-maugli.

## Возможности
- ✅ Обновление версии в package.json
- ✅ Синхронизация build скриптов
- ✅ Копирование обновленных скриптов оптимизации
- ✅ Автоматическое выполнение `npm update`
- ✅ Резервное копирование оригинального package.json
- ✅ Детальный лог операций

## Использование

### 1. Обновление одного проекта
```bash
npm run update-all-blogs /path/to/blog/project
```
или
```bash
node scripts/update-all-blogs.js /path/to/blog/project
```

### 2. Массовое обновление
Создайте файл со списком путей и используйте цикл:
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

### 3. С помощью find для автоматического поиска
```bash
# Найти и обновить все блоги в директории
find /Users/username/projects -name "package.json" -path "*/blog*" -exec dirname {} \; | while read dir; do
  npm run update-all-blogs "$dir"
done
```

## Что обновляется

### package.json
- Версия core-maugli обновляется до текущей
- Build скрипт синхронизируется с эталонным
- Добавляются недостающие скрипты

### Файлы скриптов
Копируются следующие файлы из основного проекта:
- `scripts/flatten-images.cjs`
- `scripts/optimize-images.cjs` 
- `scripts/verify-assets.js`
- `scripts/generate-previews.js`
- `scripts/featured.js`
- `scripts/upgrade-config.js`
- `scripts/update-components.js`
- `scripts/update-with-backup.js`
- `typograf-batch.js`

## Безопасность
- Создается резервная копия package.json
- Подробные логи всех операций
- Проверка существования файлов перед копированием

## Пример вывода
```
🔄 Обновляем проект: /Users/daria/Documents/GitHub/blogru
📦 Текущая версия core-maugli: 1.0.6
📦 Обновляем до версии: 1.2.39
💾 Создана резервная копия: package.json.backup
✏️ Обновлен package.json
📁 Скопированы файлы скриптов: 9
📦 Выполняется npm update...
✅ Проект обновлен успешно! Версия: 1.0.6 → 1.2.39, Скрипты обновлены: Да, Файлы скриптов скопированы: 9
```

## Устранение неполадок

### Ошибка "Project directory does not exist"
Проверьте правильность пути к проекту.

### Ошибка "package.json not found"
Убедитесь, что указываете корневую директорию проекта с package.json.

### Ошибка копирования файлов
Проверьте права доступа к файлам и директориям.

## Интеграция в CI/CD
```yaml
# GitHub Actions пример
- name: Update all blogs
  run: |
    for blog in /path/to/blog1 /path/to/blog2 /path/to/blog3; do
      npm run update-all-blogs "$blog"
    done
```
