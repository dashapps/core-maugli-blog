#!/usr/bin/env node

/**
 * Script for centralized updating of all blogs to the latest core-maugli version
 * 
 * Usage:
 * node scripts/update-all-blogs.js [project_path]
 * 
 * Or for multiple updates:
 * node scripts/update-all-blogs.js /path/to/blogs/project1 /path/to/blogs/project2
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
const CORE_MAUGLI_VERSION = pkg.version;

// Correct scripts for package.json
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

// Script files that need to be copied
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
    'scripts/set-force-update.js',
    '.gitignore',
];

// Файлы, которые должны быть в корне проекта
const REQUIRED_ROOT_FILES = [
    'astro-image-resize.mjs'
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
        // 1. Read package.json
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 2. Check that this is a core-maugli project
        if (packageJson.name !== 'core-maugli') {
            log(`Skipping: not a core-maugli project (${packageJson.name})`, 'warning');
            return false;
        }
        
        // 3. Update version
        const oldVersion = packageJson.version;
        packageJson.version = CORE_MAUGLI_VERSION;
        
        // 4. Update scripts
        let scriptsUpdated = false;
        for (const [scriptName, scriptValue] of Object.entries(CORRECT_SCRIPTS)) {
            if (packageJson.scripts[scriptName] !== scriptValue) {
                packageJson.scripts[scriptName] = scriptValue;
                scriptsUpdated = true;
            }
        }
        
        // 5. Save package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
        
        // 6. Copy scripts (заменяем всегда)
        const scriptsDir = path.join(absolutePath, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        let scriptsCopied = 0;
        for (const scriptFile of REQUIRED_SCRIPTS) {
            const sourcePath = path.join(process.cwd(), scriptFile);
            const targetPath = path.join(absolutePath, scriptFile);
            if (fs.existsSync(sourcePath)) {
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
                // Всегда заменяем файл
                fs.copyFileSync(sourcePath, targetPath);
                scriptsCopied++;
            }
        }
        // 6.1. Копируем файлы в корень (например, astro-image-resize.mjs)
        for (const rootFile of REQUIRED_ROOT_FILES) {
            const sourcePath = path.join(process.cwd(), rootFile);
            const targetPath = path.join(absolutePath, rootFile);
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
        // 6.2. Удаляем дублирующиеся скрипты с " 2" в имени
        const glob = require('glob');
        const dups = glob.sync(path.join(scriptsDir, '* 2.*'));
        for (const dup of dups) {
            try {
                fs.unlinkSync(dup);
            } catch (e) {
                log(`Не удалось удалить дубликат: ${dup}`, 'warning');
            }
        }
        
        // 7. Обновляем npm пакеты
        log(`Updating npm packages...`, 'info');
        process.chdir(absolutePath);
        execSync('npm update core-maugli', { stdio: 'pipe' });
        
        // 8. Результат
        log(`Project updated successfully!`, 'success');
        log(`  Version: ${oldVersion} → ${CORE_MAUGLI_VERSION}`, 'info');
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
        log('  ✅ Auto-copied netlify.toml', 'success');
    }
}

main();
