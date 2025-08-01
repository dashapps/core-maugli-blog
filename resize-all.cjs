// resize-all.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Какие размеры тебе нужны
const sizes = [400, 800, 1200];

const inputDir = './public';   // свои пути
const outputDir = './public';

// Перебираем все файлы в исходной папке
fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) return;

  sizes.forEach(width => {
    sharp(path.join(inputDir, file))
      .resize(width)
      .toFile(path.join(outputDir, `${base}-${width}${ext}`), (err) => {
        if (err) console.error(`Ошибка на ${base}-${width}${ext}:`, err);
        else console.log(`Сделан: ${base}-${width}${ext}`);
      });
  });

  // Копируем оригинал тоже (максимальный)
  fs.copyFileSync(path.join(inputDir, file), path.join(outputDir, `${base}${ext}`));
});
