// optimize-images.cjs - продвинутая оптимизация изображений с Sharp
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Размеры для генерации
const sizes = [400, 800, 1200];

// Настройки оптимизации для разных форматов
const optimizationSettings = {
    webp: {
        quality: 80,
        effort: 6, // Максимальное сжатие (0-6)
        lossless: false
    },
    jpeg: {
        quality: 85,
        progressive: true,
        mozjpeg: true
    },
    png: {
        quality: 90,
        compressionLevel: 9, // Максимальное сжатие
        progressive: true
    }
};

const inputDir = './public';
const processedFiles = new Set();

// Функция для оптимизации изображения
async function optimizeImage(inputPath, outputPath, width = null) {
    try {
        const ext = path.extname(outputPath).toLowerCase();
        let sharpInstance = sharp(inputPath);
        
        // Ресайз если указана ширина
        if (width) {
            sharpInstance = sharpInstance.resize(width, null, {
                withoutEnlargement: true,
                fit: 'inside'
            });
        }
        
        // Применяем оптимизацию в зависимости от формата
        switch (ext) {
            case '.webp':
                await sharpInstance
                    .webp(optimizationSettings.webp)
                    .toFile(outputPath);
                break;
                
            case '.jpg':
            case '.jpeg':
                await sharpInstance
                    .jpeg(optimizationSettings.jpeg)
                    .toFile(outputPath);
                break;
                
            case '.png':
                await sharpInstance
                    .png(optimizationSettings.png)
                    .toFile(outputPath);
                break;
                
            default:
                // Для других форматов используем WebP по умолчанию
                const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');
                await sharpInstance
                    .webp(optimizationSettings.webp)
                    .toFile(webpPath);
                console.log(`🔄 Конвертирован в WebP: ${path.relative('./public', webpPath)}`);
                return;
        }
        
        console.log(`✅ Оптимизирован: ${path.relative('./public', outputPath)}`);
        
    } catch (err) {
        console.error(`❌ Ошибка оптимизации ${outputPath}:`, err.message);
    }
}

// Получение статистики размера файла
function getFileSizeStats(originalPath, optimizedPath) {
    if (!fs.existsSync(originalPath) || !fs.existsSync(optimizedPath)) {
        return null;
    }
    
    const originalSize = fs.statSync(originalPath).size;
    const optimizedSize = fs.statSync(optimizedPath).size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = Math.round((savings / originalSize) * 100);
    
    return {
        original: Math.round(originalSize / 1024),
        optimized: Math.round(optimizedSize / 1024),
        savings: Math.round(savings / 1024),
        savingsPercent
    };
}

// Recursive function to traverse folders
async function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`📁 Folder ${dir} does not exist`);
        return;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // Recursively process subfolders
            await processDirectory(itemPath);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            const baseName = path.basename(item, ext);
            
            // Check if it's an image and doesn't contain size in the name
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                // Skip files that already contain size (e.g., image-400.webp)
                if (!/-\d+$/.test(baseName) && !processedFiles.has(itemPath)) {
                    processedFiles.add(itemPath);
                    
                    console.log(`🔄 Processing: ${itemPath}`);
                    
                    // First optimize the original
                    const optimizedOriginal = path.join(path.dirname(itemPath), `${baseName}_optimized${ext}`);
                    await optimizeImage(itemPath, optimizedOriginal);
                    
                    // Replace original with optimized version
                    if (fs.existsSync(optimizedOriginal)) {
                        const stats = getFileSizeStats(itemPath, optimizedOriginal);
                        if (stats && stats.savings > 0) {
                            fs.renameSync(optimizedOriginal, itemPath);
                            console.log(`💾 Savings: ${stats.savings}KB (${stats.savingsPercent}%) - ${itemPath}`);
                        } else {
                            fs.unlinkSync(optimizedOriginal);
                        }
                    }
                    
                    // Create resizes
                    for (const width of sizes) {
                        const outputPath = path.join(path.dirname(itemPath), `${baseName}-${width}${ext}`);
                        await optimizeImage(itemPath, outputPath, width);
                    }
                }
            }
        }
    }
}

async function main() {
    console.log('🚀 Starting image optimization with Sharp...');
    console.log('⚙️ Optimization settings:');
    console.log('  WebP: quality 80, maximum compression');
    console.log('  JPEG: quality 85, progressive loading');
    console.log('  PNG: quality 90, maximum compression');
    console.log('');
    
    await processDirectory(inputDir);
    
    console.log('');
    console.log('✅ Optimization completed!');
    console.log('📊 All images optimized for maximum performance');
}

main().catch(console.error);
