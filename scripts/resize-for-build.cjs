// resize-for-build.cjs - генерация ресайзированных изображений только для сборки
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Размеры для генерации
const sizes = [400, 800, 1200];

const inputDir = './public';
const outputDir = './dist'; // Генерируем прямо в dist
const processedFiles = new Set();

// Функция для создания папки, если она не существует
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Рекурсивная функция для обхода папок
function processDirectory(dir, relativePath = '') {
  if (!fs.existsSync(dir)) {
    console.log(`Папка ${dir} не существует`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    const currentRelativePath = path.join(relativePath, item);
    
    if (stat.isDirectory()) {
      // Рекурсивно обрабатываем подпапки
      processDirectory(itemPath, currentRelativePath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const baseName = path.basename(item, ext);
      
      // Проверяем, что это изображение и не содержит размер в названии
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Исключаем PWA иконки и служебные файлы
        const excludePatterns = [
          'icon-192', 'icon-512', // PWA иконки
          'favicon', // Фавиконки
          'logo', // Логотипы
          'manifest' // Файлы манифеста
        ];
        
        const shouldExclude = excludePatterns.some(pattern => baseName.includes(pattern));
        
        // Пропускаем файлы, которые уже содержат размер
        const hasResizeSuffix = sizes.some(size => baseName.includes(`-${size}`));
        
        if (!hasResizeSuffix && !shouldExclude && !processedFiles.has(itemPath)) {
          processedFiles.add(itemPath);
          
          console.log(`🔄 Обрабатываем для сборки: ${currentRelativePath}`);
          
          // Сначала копируем оригинал
          const outputDirPath = path.join(outputDir, relativePath);
          ensureDir(outputDirPath);
          
          const originalOutputPath = path.join(outputDirPath, item);
          if (!fs.existsSync(originalOutputPath)) {
            fs.copyFileSync(itemPath, originalOutputPath);
            console.log(`📋 Скопирован оригинал: ${path.relative('./dist', originalOutputPath)}`);
          }
          
          // Генерируем ресайзированные версии
          sizes.forEach(width => {
            const outputPath = path.join(outputDirPath, `${baseName}-${width}${ext}`);
            
            if (!fs.existsSync(outputPath)) {
              sharp(itemPath)
                .resize(width)
                .toFile(outputPath, (err) => {
                  if (err) {
                    console.error(`❌ Ошибка при создании ${outputPath}:`, err.message);
                  } else {
                    console.log(`✅ Создан: ${path.relative('./dist', outputPath)}`);
                  }
                });
            }
          });
        }
      }
    }
  });
}

// Убеждаемся, что dist существует
ensureDir(outputDir);

console.log('🚀 Начинаем генерацию изображений для сборки...');
processDirectory(inputDir);
console.log('✅ Генерация изображений завершена!');
