#!/usr/bin/env node

// Тест responsive изображений
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename));

function getResponsiveImages(imagePath) {
    const basePath = imagePath.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    const extension = imagePath.match(/\.(webp|jpg|jpeg|png)$/i)?.[0] || '.webp';

    const variants = [
        { suffix: '-400', width: '400w' },
        { suffix: '-800', width: '800w' },
        { suffix: '-1200', width: '1200w' }
    ];

    const srcsetItems = [];

    // Добавляем адаптивные версии, если они существуют
    for (const variant of variants) {
        const variantPath = `${basePath}${variant.suffix}${extension}`;
        const filePath = path.join(projectRoot, 'public', variantPath.replace(/^\//, ''));

        console.log(`Checking: ${filePath} - ${fs.existsSync(filePath) ? 'FOUND' : 'NOT FOUND'}`);
    });

    // Always add the original image

        if (fs.existsSync(filePath)) {
            srcsetItems.push(`${variantPath} ${variant.width}`);
        }
    }

    // Всегда добавляем оригинальное изображение
    srcsetItems.push(`${imagePath} 1200w`);

    return {
        src: imagePath,
        srcset: srcsetItems.join(', '),
        sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'
    };
}

// Testing with our image
const testImage = '/img/blog/agent-test-image.webp';
console.log('🧪 Testing getResponsiveImages function');
console.log('📁 Базовый путь проекта:', projectRoot);
console.log('🖼️ Test image:', testImage);
console.log('');

const result = getResponsiveImages(testImage);

console.log('✅ Результат:');
console.log('src:', result.src);
console.log('srcset:', result.srcset);
console.log('sizes:', result.sizes);
