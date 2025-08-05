// copy-content-images.cjs - выносим все изображения из подпапок public/img в корень public/img
const fs = require('fs');
const path = require('path');

const sourceDir = './public/img';
const targetDir = './public/img';

// Функция для рекурсивного поиска и копирования изображений из подпапок
async function flattenImages(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) {
        console.log(`📁 Папка ${sourceDir} не существует, пропускаем`);
        return 0;
    }

    const items = fs.readdirSync(sourceDir);
    let copiedCount = 0;

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            // Рекурсивно обрабатываем подпапки
            const copied = await flattenImages(sourcePath, targetDir);
            copiedCount += copied;
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            
            // Проверяем, что это изображение и что оно в подпапке (не в корне)
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                const relativePath = path.relative(sourceDir, sourcePath);
                
                // Если файл не в корне public/img, то копируем его в корень
                if (relativePath.includes(path.sep)) {
                    const targetPath = path.join(targetDir, item);
                    
                    // Проверяем, что файл с таким именем не существует в корне
                    if (!fs.existsSync(targetPath)) {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`📋 Вынесено: ${relativePath} → ${item}`);
                        copiedCount++;
                    } else {
                        console.log(`⚠️  Пропущено (уже существует): ${item}`);
                    }
                }
            }
        }
    }

    return copiedCount;
}

async function main() {
    console.log('🚀 Начинаем вынос изображений из подпапок public/img в корень public/img...');
    
    // Выносим все изображения из подпапок в корень
    const totalCopied = await flattenImages(sourceDir, targetDir);
    
    console.log('');
    console.log(`✅ Вынос завершен! Скопировано ${totalCopied} изображений в корень public/img/`);
    console.log('🔄 Netlify Image Optimization теперь сможет их легче обрабатывать');
    console.log('⚡ Sharp оптимизация также будет применена к файлам в корне');
    console.log('📁 Все изображения теперь доступны напрямую из /img/имя_файла.webp');
}

main().catch(console.error);
