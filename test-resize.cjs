// test-resize.cjs - тестовый ресайз для проверки
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Размеры для генерации
const sizes = [400, 800, 1200];

// Тестируем только на файлах из default
const testDir = './public/img/default';
const processedFiles = new Set();

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Папка ${dir} не существует`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const baseName = path.basename(item, ext);
      
      // Проверяем, что это изображение и не содержит размер в названии
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Пропускаем файлы, которые уже содержат размер (например, image-400.webp)
        if (!/-\d+$/.test(baseName) && !processedFiles.has(itemPath) && !dir.includes('previews')) {
          processedFiles.add(itemPath);
          
          console.log(`Обрабатываем: ${itemPath}`);
          
          sizes.forEach(width => {
            const outputPath = path.join(path.dirname(itemPath), `${baseName}-${width}${ext}`);
            
            sharp(itemPath)
              .resize(width)
              .toFile(outputPath, (err) => {
                if (err) {
                  console.error(`Ошибка при создании ${outputPath}:`, err.message);
                } else {
                  console.log(`✅ Создан: ${path.relative('./public', outputPath)}`);
                }
              });
          });
        }
      }
    }
  });
}

console.log('🔄 Тестируем ресайз на папке img/default...');
processDirectory(testDir);
console.log('✅ Тест завершен!');
