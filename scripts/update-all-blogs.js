#!/usr/bin/env node

/**
 * Скрипт для централизованного обновления всех блогов до последней версии core-maugli
 * 
 * Использование:
 * node scripts/update-all-blogs.js [путь_к_проекту]
 * 
 * Или для множественного обновления:
 * node scripts/update-all-blogs.js /path/to/blogs/project1 /path/to/blogs/project2
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CURRENT_VERSION = '1.2.39';

// Правильные скрипты для package.json
const CORRECT_SCRIPTS = {
    "typograf": "node typograf-batch.js",
    "dev": "node resize-all.cjs && node scripts/generate-previews.js && astro dev",
    "prestart": "node resize-all.cjs && node scripts/generate-previews.js",
    "start": "astro dev",
    "build": "node scripts/flatten-images.cjs && node scripts/optimize-images.cjs && node typograf-batch.js && node scripts/verify-assets.js && node scripts/generate-previews.js && astro build",
    "build:fast": "node resize-all.cjs && node typograf-batch.js && node scripts/verify-assets.js && node scripts/generate-previews.js && astro build",
    "optimize": "node scripts/optimize-images.cjs",
    "optimize:squoosh": "node scripts/squoosh-optimize.js",
    "test": "node tests/examplesFilter.test.ts",
    "astro": "astro",
    "featured:add": "node scripts/featured.js add",
    "featured:remove": "node scripts/featured.js remove",
    "featured:list": "node scripts/featured.js list",
    "upgrade": "node scripts/upgrade-config.js",
    "update-components": "node scripts/update-components.js",
    "backup-update": "node scripts/update-with-backup.js",
    "postinstall": "node scripts/upgrade-config.js && node scripts/setup-user-images.js",
    "generate-previews": "node scripts/generate-previews.js"
};

// Файлы скриптов, которые нужно скопировать
const REQUIRED_SCRIPTS = [
    'scripts/flatten-images.cjs',
    'scripts/optimize-images.cjs',
    'scripts/generate-previews.js',
    'scripts/verify-assets.js',
    'scripts/upgrade-config.js',
    'scripts/setup-user-images.js',
    'scripts/featured.js',
    'scripts/update-components.js',
    'scripts/update-with-backup.js'
];

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',    // cyan
        success: '\x1b[32m', // green
        warning: '\x1b[33m', // yellow
        error: '\x1b[31m',   // red
        reset: '\x1b[0m'
    };
    
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function updateBlogProject(projectPath) {
    const absolutePath = path.resolve(projectPath);
    
    if (!fs.existsSync(absolutePath)) {
        log(`Путь не существует: ${absolutePath}`, 'error');
        return false;
    }
    
    const packageJsonPath = path.join(absolutePath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        log(`package.json не найден в: ${absolutePath}`, 'error');
        return false;
    }
    
    log(`Обновляем проект: ${absolutePath}`, 'info');
    
    try {
        // 1. Читаем package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 2. Проверяем, что это проект core-maugli
        if (packageJson.name !== 'core-maugli') {
            log(`Пропускаем: не core-maugli проект (${packageJson.name})`, 'warning');
            return false;
        }
        
        // 3. Обновляем версию
        const oldVersion = packageJson.version;
        packageJson.version = CURRENT_VERSION;
        
        // 4. Обновляем скрипты
        let scriptsUpdated = false;
        for (const [scriptName, scriptValue] of Object.entries(CORRECT_SCRIPTS)) {
            if (packageJson.scripts[scriptName] !== scriptValue) {
                packageJson.scripts[scriptName] = scriptValue;
                scriptsUpdated = true;
            }
        }
        
        // 5. Сохраняем package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
        
        // 6. Копируем недостающие скрипты
        const scriptsDir = path.join(absolutePath, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        
        let scriptsCopied = 0;
        const sourceScriptsDir = path.join(process.cwd(), 'scripts');
        
        for (const scriptFile of REQUIRED_SCRIPTS) {
            const sourcePath = path.join(process.cwd(), scriptFile);
            const targetPath = path.join(absolutePath, scriptFile);
            
            if (fs.existsSync(sourcePath)) {
                // Создаем директорию если не существует
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                
                // Копируем файл
                fs.copyFileSync(sourcePath, targetPath);
                scriptsCopied++;
            }
        }
        
        // 7. Обновляем npm пакеты
        log(`Обновляем npm пакеты...`, 'info');
        process.chdir(absolutePath);
        execSync('npm update core-maugli', { stdio: 'pipe' });
        
        // 8. Результат
        log(`Проект обновлен успешно!`, 'success');
        log(`  Версия: ${oldVersion} → ${CURRENT_VERSION}`, 'info');
        log(`  Скрипты обновлены: ${scriptsUpdated ? 'Да' : 'Нет'}`, 'info');
        log(`  Файлы скриптов скопированы: ${scriptsCopied}`, 'info');
        
        return true;
        
    } catch (error) {
        log(`Ошибка при обновлении: ${error.message}`, 'error');
        return false;
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('Использование: node scripts/update-all-blogs.js [путь_к_проекту]', 'info');
        log('Пример: node scripts/update-all-blogs.js /Users/daria/Documents/GitHub/blogru', 'info');
        process.exit(1);
    }
    
    let successCount = 0;
    let totalCount = 0;
    
    for (const projectPath of args) {
        totalCount++;
        if (updateBlogProject(projectPath)) {
            successCount++;
        }
    }
    
    log(`\nОбновление завершено: ${successCount}/${totalCount} проектов обновлено`, 'info');
    
    if (successCount > 0) {
        log('🎉 Теперь во всех проектах:', 'success');
        log('  ✅ Правильная версия core-maugli', 'success');
        log('  ✅ Актуальные скрипты сборки', 'success');
        log('  ✅ Оптимизация изображений работает', 'success');
    }
}

main();
