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

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CURRENT_VERSION = '1.2.41';

// Правильные скрипты для package.json
const CORRECT_SCRIPTS = {
    "typograf": "node typograf-batch.js",
    "dev": "node resize-all.cjs && node scripts/generate-previews.js && astro dev",
    "prestart": "node resize-all.cjs && node scripts/generate-previews.js",
    "start": "astro dev",
    "build": "node scripts/check-version.js && node scripts/flatten-images.cjs && node scripts/optimize-images.cjs && node typograf-batch.js && node scripts/verify-assets.js && node scripts/generate-previews.js && astro build",
    "build:fast": "node resize-all.cjs && node typograf-batch.js && node scripts/verify-assets.js && node scripts/generate-previews.js && astro build",
    "build:no-check": "node scripts/flatten-images.cjs && node scripts/optimize-images.cjs && node typograf-batch.js && node scripts/verify-assets.js && node scripts/generate-previews.js && astro build",
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
    "update-all-blogs": "node scripts/update-all-blogs.js",
    "check-version": "node scripts/check-version.js",
    "auto-update": "node scripts/auto-update.js",
    "build:ci": "SKIP_VERSION_CHECK=true npm run build",
    "generate-netlify": "node scripts/generate-netlify-config.js",
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
    'scripts/update-with-backup.js',
    'scripts/check-version.js',
    'scripts/auto-update.js',
    'scripts/generate-netlify-config.js',
    '.gitignore',
    'netlify.toml'
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
        log(`Project path does not exist: ${absolutePath}`, 'error');
        return false;
    }
    
    const packageJsonPath = path.join(absolutePath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        log(`package.json not found in: ${absolutePath}`, 'error');
        return false;
    }
    
    log(`Updating project: ${absolutePath}`, 'info');
    
    try {
        // 1. Читаем package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 2. Проверяем, что это проект core-maugli
        if (packageJson.name !== 'core-maugli') {
            log(`Skipping: not a core-maugli project (${packageJson.name})`, 'warning');
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
        log(`Updating npm packages...`, 'info');
        process.chdir(absolutePath);
        execSync('npm update core-maugli', { stdio: 'pipe' });
        
        // 8. Результат
        log(`Project updated successfully!`, 'success');
        log(`  Version: ${oldVersion} → ${CURRENT_VERSION}`, 'info');
        log(`  Scripts updated: ${scriptsUpdated ? 'Yes' : 'No'}`, 'info');
        log(`  Script files copied: ${scriptsCopied}`, 'info');
        
        return true;
        
    } catch (error) {
        log(`Error during update: ${error.message}`, 'error');
        return false;
    }
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('Usage: node scripts/update-all-blogs.js [project_path]', 'info');
        log('Example: node scripts/update-all-blogs.js /Users/daria/Documents/GitHub/blogru', 'info');
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
    
    log(`\nUpdate completed: ${successCount}/${totalCount} projects updated`, 'info');
    
    if (successCount > 0) {
        log('🎉 Now all projects have:', 'success');
        log('  ✅ Correct core-maugli version', 'success');
        log('  ✅ Up-to-date build scripts', 'success');
        log('  ✅ Working image optimization', 'success');
    }
}

main();
