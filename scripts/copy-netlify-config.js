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
            const hasCustomizations = 
                !existingContent.includes('# Auto-copied from core-maugli package') ||
                existingContent.includes('# CUSTOMIZED') ||
                (existingContent.includes('netlify-plugin-bluesky') && !existingContent.includes('# [[plugins]]')) ||
                (existingContent.includes('@supabase/netlify-integration') && !existingContent.includes('# [[plugins]]')) ||
                // Проверяем на активные (не закомментированные) дополнительные плагины
                existingContent.split('\n').some(line => 
                    line.trim().startsWith('package = ') && 
                    !['netlify-plugin-astro', '@netlify/plugin-lighthouse', 'netlify-plugin-image-optim', 
                      'netlify-plugin-minify-html', 'netlify-plugin-submit-sitemap'].some(plugin => 
                        line.includes(plugin)
                    )
                );
            
            if (hasCustomizations) {
                console.log('📋 netlify.toml exists and appears customized - skipping copy');
                console.log('💡 To force update: delete netlify.toml and reinstall');
                return;
            } else {
                console.log('📋 netlify.toml exists but not customized - updating to latest template');
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
