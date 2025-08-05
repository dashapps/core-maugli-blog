#!/usr/bin/env node

// squoosh-optimize.js - автоматическая оптимизация через Squoosh CLI
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

// Функция для получения всех изображений
function getAllImages(dir, images = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            getAllImages(itemPath, images);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                // Пропускаем уже обработанные ресайзы
                const baseName = path.basename(item, ext);
                if (!/-\d+$/.test(baseName)) {
                    images.push(itemPath);
                }
            }
        }
    }
    
    return images;
}

// Функция для создания временной директории
function createTempDir() {
    const tempDir = path.join(projectRoot, '.temp-optimization');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

// Функция для оптимизации через Squoosh CLI
async function optimizeWithSquoosh() {
    console.log('🚀 Начинаем оптимизацию через Squoosh CLI...');
    
    const images = getAllImages(publicDir);
    console.log(`📁 Найдено ${images.length} изображений для оптимизации`);
    
    if (images.length === 0) {
        console.log('📷 Нет изображений для оптимизации');
        return;
    }
    
    const tempDir = createTempDir();
    
    try {
        // Создаем директорию для входных файлов
        const inputDir = path.join(tempDir, 'input');
        const outputDir = path.join(tempDir, 'output');
        
        if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        
        // Копируем файлы во временную директорию
        console.log('📋 Подготавливаем файлы...');
        images.forEach((imagePath, index) => {
            const ext = path.extname(imagePath);
            const tempFileName = `image_${index}${ext}`;
            const tempFilePath = path.join(inputDir, tempFileName);
            fs.copyFileSync(imagePath, tempFilePath);
        });
        
        // Запускаем Squoosh CLI для WebP оптимизации
        console.log('⚡ Запускаем Squoosh CLI...');
        const squooshCommand = `npx @squoosh/cli --webp auto "${inputDir}/*" -d "${outputDir}"`;
        
        try {
            execSync(squooshCommand, { 
                stdio: 'inherit',
                cwd: projectRoot 
            });
            
            console.log('✅ Squoosh CLI завершен');
            
            // Копируем оптимизированные файлы обратно
            const optimizedFiles = fs.readdirSync(outputDir);
            let totalSavings = 0;
            let processedCount = 0;
            
            optimizedFiles.forEach((fileName, index) => {
                if (index < images.length) {
                    const originalPath = images[index];
                    const optimizedPath = path.join(outputDir, fileName);
                    
                    if (fs.existsSync(optimizedPath)) {
                        const originalSize = fs.statSync(originalPath).size;
                        const optimizedSize = fs.statSync(optimizedPath).size;
                        
                        if (optimizedSize < originalSize) {
                            const savings = originalSize - optimizedSize;
                            const savingsPercent = Math.round((savings / originalSize) * 100);
                            
                            // Заменяем оригинал на оптимизированную версию
                            fs.copyFileSync(optimizedPath, originalPath);
                            
                            totalSavings += savings;
                            processedCount++;
                            
                            console.log(`💾 ${path.relative(publicDir, originalPath)}: ${Math.round(savings/1024)}KB экономии (${savingsPercent}%)`);
                        }
                    }
                }
            });
            
            console.log(`\n🎉 Обработано ${processedCount} изображений`);
            console.log(`💰 Общая экономия: ${Math.round(totalSavings/1024)}KB`);
            
        } catch (squooshError) {
            console.error('❌ Ошибка Squoosh CLI:', squooshError.message);
            console.log('🔄 Переключаемся на Sharp оптимизацию...');
            return false;
        }
        
    } finally {
        // Очищаем временные файлы
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
    
    return true;
}

// Запуск если вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
    optimizeWithSquoosh().catch(console.error);
}

export { optimizeWithSquoosh };
