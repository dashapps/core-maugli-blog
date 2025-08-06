#!/usr/bin/env node

/**
 * Очищает ресайзеные изображения из git
 * Удаляет уже закоммиченные файлы с суффиксами -400, -800, -1200
 */

import { execSync } from 'child_process';

function main() {
    try {
        console.log('🧹 Cleaning resized images from git...');
        
        // Ищем все ресайзеные изображения в git
        let resizedFiles;
        try {
            resizedFiles = execSync('git ls-files | grep -E ".*-(400|800|1200)\\.webp$"', { encoding: 'utf8' });
        } catch (error) {
            console.log('✅ No resized images found in git - nothing to clean');
            return;
        }
        
        if (!resizedFiles.trim()) {
            console.log('✅ No resized images found in git - nothing to clean');
            return;
        }
        
        const files = resizedFiles.trim().split('\n');
        console.log(`📋 Found ${files.length} resized images in git:`);
        files.forEach(file => console.log(`   🗑️  ${file}`));
        
        // Удаляем файлы из git индекса (но оставляем на диске)
        const filesString = files.join(' ');
        execSync(`git rm --cached ${filesString}`, { encoding: 'utf8' });
        
        console.log(`✅ Removed ${files.length} resized images from git`);
        console.log('💡 Files remain on disk but will be ignored by git');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. git add .gitignore');
        console.log('   2. git commit -m "chore: remove resized images from git"');
        console.log('');
        console.log('🔄 Resized images will be regenerated automatically during build');
        
    } catch (error) {
        console.error('❌ Error cleaning resized images:', error.message);
        console.log('💡 You can manually run: git rm --cached public/**/*-{400,800,1200}.webp');
    }
}

main();
