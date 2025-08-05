// copy-content-images.cjs - выносим все изображения из подпапок public/img в корень public/img
const fs = require('fs');
const path = require('path');

const sourceDir = './public/img';
const targetDir = './public/img';

// Функция для рекурсивного поиска и копирования изображений из подпапок
async function flattenImages(currentDir) {
    const items = fs.readdirSync(currentDir);
    let copiedCount = 0;

    for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Рекурсивно обрабатываем подпапки
            const copied = await flattenImages(itemPath);
            copiedCount += copied;
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            
            // Проверяем, что это изображение и что оно НЕ в корне public/img
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                const isInSubfolder = currentDir !== sourceDir;
                
                if (isInSubfolder) {
                    const targetPath = path.join(sourceDir, item);
                    
                    // Проверяем, что файл с таким именем не существует в корне
                    if (!fs.existsSync(targetPath)) {
                        fs.copyFileSync(itemPath, targetPath);
                        console.log(`📋 Вынесено: ${path.relative('./public', itemPath)} → img/${item}`);
                        copiedCount++;
                    } else {
                        // Если файл уже существует, добавляем префикс папки
                        const folderName = path.basename(currentDir);
                        const nameWithoutExt = path.parse(item).name;
                        const extension = path.parse(item).ext;
                        const newName = `${folderName}_${nameWithoutExt}${extension}`;
                        const targetPathWithPrefix = path.join(sourceDir, newName);
                        
                        if (!fs.existsSync(targetPathWithPrefix)) {
                            fs.copyFileSync(itemPath, targetPathWithPrefix);
                            console.log(`📋 Вынесено с префиксом: ${path.relative('./public', itemPath)} → img/${newName}`);
                            copiedCount++;
                        } else {
                            console.log(`⚠️  Пропущено (уже существует): ${item}`);
                        }
                    }
                }
            }
        }
    }

    return copiedCount;
}

async function main() {
    console.log('🚀 Начинаем вынос изображений из подпапок public/img в корень public/img...');
    
    if (!fs.existsSync(sourceDir)) {
        console.log(`📁 Папка ${sourceDir} не существует!`);
        return;
    }
    
    // Выносим все изображения из подпапок в корень
    const totalCopied = await flattenImages(sourceDir);
    
    console.log('');
    console.log(`✅ Вынос завершен! Скопировано ${totalCopied} изображений в корень public/img/`);
    console.log('🔄 Netlify Image Optimization теперь сможет их легче обрабатывать');
    console.log('⚡ Sharp оптимизация также будет применена к файлам в корне');
    console.log('📁 Все изображения теперь доступны напрямую из /img/имя_файла.webp');
}

main().catch(console.error);
