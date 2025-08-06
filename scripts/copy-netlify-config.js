#!/usr/bin/env node

/**
 * Копирует netlify.toml из пакета core-maugli в проект
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
    try {
        const targetPath = path.join(process.cwd(), 'netlify.toml');
        
        // Проверяем, есть ли уже netlify.toml
        if (fs.existsSync(targetPath)) {
            const existingContent = fs.readFileSync(targetPath, 'utf8');
            
            // Проверяем, кастомизирован ли файл пользователем
            const hasBlueskyActive = existingContent.includes('bluesky-custom-domain') && 
                                    !existingContent.includes('# [[plugins]]');
            const hasSupabaseActive = existingContent.includes('@supabase/netlify-integration') && 
                                     !existingContent.includes('# [[plugins]]');
            const hasCustomComment = existingContent.includes('# CUSTOMIZED');
            const hasUserModifications = !existingContent.includes('# Auto-copied from core-maugli package');
            
            const hasCustomizations = hasBlueskyActive || hasSupabaseActive || hasCustomComment || hasUserModifications;
            
            if (hasCustomizations) {
                console.log('📋 netlify.toml exists with active integrations - preserving user settings');
                if (hasBlueskyActive) console.log('   🔵 Bluesky integration detected');
                if (hasSupabaseActive) console.log('   🟢 Supabase integration detected');
                if (hasCustomComment) console.log('   ✏️  Custom modifications marked');
                console.log('💡 To force update: delete netlify.toml and reinstall');
                return;
            } else {
                console.log('📋 netlify.toml exists but no active integrations - updating to latest template');
                // Создадим бэкап на всякий случай
                fs.copyFileSync(targetPath, targetPath + '.backup');
                console.log('📦 Created backup: netlify.toml.backup');
            }
        }
        
        // Ищем исходный файл в пакете
        let sourcePath;
        
        // Если запускаем из node_modules
        const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'core-maugli', 'netlify.toml');
        if (fs.existsSync(nodeModulesPath)) {
            sourcePath = nodeModulesPath;
        } 
        // Если запускаем из самого пакета (для разработки)
        else {
            sourcePath = path.join(__dirname, '..', 'netlify.toml');
        }
        
        if (!fs.existsSync(sourcePath)) {
            console.log('⚠️  netlify.toml template not found');
            return;
        }
        
        // Копируем файл
        fs.copyFileSync(sourcePath, targetPath);
        console.log('✅ netlify.toml copied successfully');
        console.log('');
        console.log('📝 Manual setup required for:');
        console.log('   • Bluesky: https://app.netlify.com/extensions/bluesky-custom-domain');
        console.log('   • Supabase: https://app.netlify.com/extensions/supabase');
        console.log('');
        console.log('💡 Uncomment plugins in netlify.toml after setup');
        
    } catch (error) {
        console.error('❌ Error copying netlify.toml:', error.message);
    }
}

main();
