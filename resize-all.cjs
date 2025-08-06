// resize-all.cjs - рекурсивный ресайз изображений
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Размеры для генерации
const sizes = [400, 800, 1200];

const inputDir = './public';
const processedFiles = new Set(); // Отслеживаем обработанные файлы

// Рекурсивная функция для обхода папок
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Папка ${dir} не существует`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Рекурсивно обрабатываем подпапки
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const baseName = path.basename(item, ext);
      
      // Проверяем, что это изображение и не содержит размер в названии
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Пропускаем файлы, которые уже содержат размер (например, image-400.webp, image-800-800.webp)
        // Улучшенная проверка: пропускаем файлы с -400, -800, -1200 в любом месте названия
        const hasResizeSuffix = sizes.some(size => baseName.includes(`-${size}`));
        
        if (!hasResizeSuffix && !processedFiles.has(itemPath)) {
          processedFiles.add(itemPath);
          
          console.log(`Обрабатываем: ${itemPath}`);
          
          sizes.forEach(width => {
            const outputPath = path.join(path.dirname(itemPath), `${baseName}-${width}${ext}`);
            
            // Проверяем, что файл еще не существует
            if (!fs.existsSync(outputPath)) {
              sharp(itemPath)
                .resize(width)
                .toFile(outputPath, (err) => {
                  if (err) {
                    console.error(`Ошибка при создании ${outputPath}:`, err.message);
                  } else {
                    console.log(`✅ Создан: ${path.relative('./public', outputPath)}`);
                  }
                });
            } else {
              console.log(`⏭️  Пропускаем (уже существует): ${path.relative('./public', outputPath)}`);
            }
          });
        }
      }
    }
  });
}

console.log('🔄 Начинаем ресайз всех изображений...');
processDirectory(inputDir);
console.log('✅ Обработка завершена!');
