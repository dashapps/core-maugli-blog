#!/usr/bin/env node

/**
 * Скрипт для включения/отключения автоматических обновлений без интерактивных промптов
 * 
 * Использование:
 * node scripts/set-force-update.js true   # Включить автообновления
 * node scripts/set-force-update.js false  # Отключить автообновления
 */

import fs from 'fs';
import path from 'path';

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node scripts/set-force-update.js [true|false]');
        console.log('');
        console.log('true  - Enable automatic updates without Y/n prompts');
        console.log('false - Disable automatic updates (interactive mode)');
        process.exit(1);
    }
    
    const enableForceUpdate = args[0] === 'true';
    const configPath = path.join(process.cwd(), 'src/config/maugli.config.ts');
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ maugli.config.ts not found. Run this from the project root.');
        process.exit(1);
    }
    
    try {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // Обновляем forceUpdate значение
        const forceUpdateRegex = /forceUpdate:\s*(true|false)/;
        
        if (forceUpdateRegex.test(content)) {
            content = content.replace(forceUpdateRegex, `forceUpdate: ${enableForceUpdate}`);
        } else {
            // Добавляем forceUpdate если его нет
            const automationRegex = /(automation:\s*{[^}]*)(})/s;
            content = content.replace(automationRegex, `$1    forceUpdate: ${enableForceUpdate},   // Force updates without Y/n prompts\n  $2`);
        }
        
        fs.writeFileSync(configPath, content, 'utf8');
        
        if (enableForceUpdate) {
            console.log('✅ Automatic updates enabled');
            console.log('   Now builds will automatically update core-maugli without prompts');
            console.log('   Perfect for CI/CD environments like Netlify');
        } else {
            console.log('✅ Interactive updates enabled');
            console.log('   Now builds will ask Y/n before updating');
            console.log('   Good for local development');
        }
        
    } catch (error) {
        console.error('❌ Error updating config:', error.message);
        process.exit(1);
    }
}

main();
