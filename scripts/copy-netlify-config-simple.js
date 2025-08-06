#!/usr/bin/env node

/**
 * Простое копирование netlify.toml из пакета core-maugli
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
    try {
        const targetPath = path.join(process.cwd(), 'netlify.toml');
        
        // Проверяем, есть ли уже netlify.toml с маркером "CUSTOMIZED"
        if (fs.existsSync(targetPath)) {
            const existingContent = fs.readFileSync(targetPath, 'utf8');
            
            if (existingContent.includes('# CUSTOMIZED')) {
                console.log('📋 Found "# CUSTOMIZED" marker - preserving entire file');
                return;
            }
            
            // Создаем бэкап
            fs.copyFileSync(targetPath, targetPath + '.backup');
            console.log('📦 Created backup: netlify.toml.backup');
        }
        
        // Ищем исходный файл в пакете
        let sourcePath;
        const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'core-maugli', 'netlify.toml');
        if (fs.existsSync(nodeModulesPath)) {
            sourcePath = nodeModulesPath;
        } else {
            sourcePath = path.join(__dirname, '..', 'netlify.toml');
        }
        
        if (!fs.existsSync(sourcePath)) {
            console.log('⚠️  netlify.toml template not found');
            return;
        }
        
        // Просто копируем файл
        fs.copyFileSync(sourcePath, targetPath);
        console.log('✅ netlify.toml copied successfully');
        
        console.log('');
        console.log('💡 Add "# CUSTOMIZED" comment to prevent auto-updates');
        
    } catch (error) {
        console.error('❌ Error copying netlify.toml:', error.message);
    }
}

main();
