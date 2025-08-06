#!/usr/bin/env node

/**
 * Умно обновляет netlify.toml, мерджит плагины и сохраняет пользовательские настройки
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Базовые плагины из core-maugli (будут обновляться)
const BASE_PLUGINS = [
    'netlify-plugin-astro',
    '@netlify/plugin-lighthouse',
    'netlify-plugin-image-optim',
    'netlify-plugin-minify-html',
    'netlify-plugin-submit-sitemap',
    'netlify-plugin-checklinks',
    'netlify-plugin-inline-critical-css',
    'netlify-plugin-hashfiles'
];

// Опциональные плагины (требуют ручной настройки)
const OPTIONAL_PLUGINS = [
    'netlify-plugin-bluesky',
    '@supabase/netlify-integration',
    'netlify-plugin-bluesky-custom-domain'
];

/**
 * Парсит TOML файл и извлекает плагины
 */
function parseNetlifyToml(content) {
    const plugins = [];
    const lines = content.split('\n');
    let currentPlugin = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Проверяем начало секции плагина
        if (line === '[[plugins]]') {
            currentPlugin = {};
        }
        // Извлекаем package
        else if (currentPlugin && line.match(/package\s*=\s*["']([^"']+)["']/)) {
            const match = line.match(/package\s*=\s*["']([^"']+)["']/);
            currentPlugin.package = match[1];
            plugins.push(currentPlugin);
            currentPlugin = null;
        }
    }
    
    return plugins;
}

/**
 * Получает плагины из maugli.config.ts
 */
async function getMaugliConfigPlugins() {
    try {
        const configPath = path.join(process.cwd(), 'src', 'config', 'maugli.config.ts');
        if (!fs.existsSync(configPath)) {
            console.log('📝 maugli.config.ts not found, using default plugins');
            return BASE_PLUGINS;
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Ищем секцию netlify.plugins
        const netlifyMatch = configContent.match(/netlify:\s*{[\s\S]*?plugins:\s*\[([\s\S]*?)\]/);
        
        if (netlifyMatch) {
            const pluginsString = netlifyMatch[1];
            const plugins = [];
            
            // Разбираем построчно, чтобы правильно обработать комментарии
            const lines = pluginsString.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                // Пропускаем пустые строки и комментарии
                if (!trimmed || trimmed.startsWith('//')) continue;
                
                // Извлекаем строку плагина
                const match = trimmed.match(/['"]([^'"]+)['"]/);
                if (match) {
                    const pluginName = match[1].trim();
                    if (pluginName && !pluginName.includes('//')) {
                        plugins.push(pluginName);
                    }
                }
            }
            
            console.log(`📋 Found ${plugins.length} plugins in maugli.config.ts`);
            return plugins;
        }
        
        console.log('📝 No plugins found in maugli.config.ts, using defaults');
        return BASE_PLUGINS;
    } catch (error) {
        console.log(`⚠️  Error reading maugli.config.ts: ${error.message}`);
        return BASE_PLUGINS;
    }
}

/**
 * Мерджит плагины: базовые + из конфига + пользовательские
 */
function mergePlugins(existingPlugins, configPlugins) {
    const merged = new Set();
    const userPlugins = [];
    
    // Добавляем все плагины из конфига
    configPlugins.forEach(plugin => merged.add(plugin));
    
    // Добавляем пользовательские плагины (не из базового списка)
    existingPlugins.forEach(plugin => {
        const packageName = plugin.package;
        if (!BASE_PLUGINS.includes(packageName) && !configPlugins.includes(packageName)) {
            userPlugins.push(packageName);
            merged.add(packageName);
        }
    });
    
    return {
        all: Array.from(merged),
        user: userPlugins,
        config: configPlugins
    };
}

/**
 * Генерирует TOML секцию плагинов
 */
function generatePluginsToml(plugins, userPlugins, optionalActive) {
    let toml = '\n# Плагины (автоматически управляемые)\n';
    
    plugins.forEach(plugin => {
        const isOptional = OPTIONAL_PLUGINS.includes(plugin);
        const isActive = optionalActive.includes(plugin);
        const isUser = userPlugins.includes(plugin);
        
        if (isOptional && !isActive) {
            // Опциональный плагин, неактивный - комментируем
            toml += `# [[plugins]]\n#   package = "${plugin}"\n`;
        } else {
            // Активный плагин
            toml += `[[plugins]]\n  package = "${plugin}"`;
            if (isUser) {
                toml += '  # user-added';
            }
            toml += '\n';
        }
        toml += '\n';
    });
    
    return toml;
}

async function main() {
    try {
        const targetPath = path.join(process.cwd(), 'netlify.toml');
        
        // Получаем плагины из конфига
        const configPlugins = await getMaugliConfigPlugins();
        
        let existingPlugins = [];
        let existingContent = '';
        let activeOptionalPlugins = [];
        let shouldPreserve = false;
        
        // Анализируем существующий файл
        if (fs.existsSync(targetPath)) {
            existingContent = fs.readFileSync(targetPath, 'utf8');
            existingPlugins = parseNetlifyToml(existingContent);
            
            // Определяем активные опциональные плагины
            activeOptionalPlugins = existingPlugins
                .map(p => p.package)
                .filter(pkg => OPTIONAL_PLUGINS.includes(pkg));
            
            // Проверяем, нужно ли сохранить файл
            const hasCustomComment = existingContent.includes('# CUSTOMIZED') && 
                                    !existingContent.includes('Add "# CUSTOMIZED" comment'); // Исключаем инструкцию
            const hasUserModifications = !existingContent.includes('# Auto-copied from core-maugli package');
            
            if (hasCustomComment) {
                console.log('📋 Found "# CUSTOMIZED" marker - preserving entire file');
                return;
            }
            
            if (activeOptionalPlugins.length > 0) {
                console.log('📋 Found active integrations:');
                activeOptionalPlugins.forEach(plugin => {
                    console.log(`   � ${plugin}`);
                });
                shouldPreserve = true;
            }
        }
        
        // Мерджим плагины
        const mergedPlugins = mergePlugins(existingPlugins, configPlugins);
        
        if (mergedPlugins.user.length > 0) {
            console.log('📦 Found user plugins:');
            mergedPlugins.user.forEach(plugin => {
                console.log(`   ✨ ${plugin}`);
            });
            shouldPreserve = true;
        }
        
        // Читаем базовый шаблон
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
        
        let templateContent = fs.readFileSync(sourcePath, 'utf8');
        
        // Заменяем секцию плагинов
        const pluginsToml = generatePluginsToml(
            mergedPlugins.all, 
            mergedPlugins.user, 
            activeOptionalPlugins
        );
        
        // Удаляем старую секцию плагинов и вставляем новую
        const beforePlugins = templateContent.split('# Обязательные плагины')[0];
        const afterPlugins = templateContent.split('# Redirects')[1] || templateContent.split('[[redirects]]')[0];
        
        const updatedContent = beforePlugins.trim() + '\n' + pluginsToml + '\n# Redirects' + (afterPlugins || '');
        
        // Создаем бэкап если файл существует
        if (fs.existsSync(targetPath) && shouldPreserve) {
            fs.copyFileSync(targetPath, targetPath + '.backup');
            console.log('📦 Created backup: netlify.toml.backup');
        }
        
        // Записываем обновленный файл
        fs.writeFileSync(targetPath, updatedContent);
        
        console.log('✅ netlify.toml updated successfully');
        console.log(`📋 Total plugins: ${mergedPlugins.all.length}`);
        console.log(`   � From config: ${mergedPlugins.config.length}`);
        console.log(`   ✨ User added: ${mergedPlugins.user.length}`);
        console.log(`   🔵 Active integrations: ${activeOptionalPlugins.length}`);
        
        if (OPTIONAL_PLUGINS.some(p => !activeOptionalPlugins.includes(p))) {
            console.log('\n📝 Available integrations (currently disabled):');
            OPTIONAL_PLUGINS.forEach(plugin => {
                if (!activeOptionalPlugins.includes(plugin)) {
                    const setupUrl = plugin.includes('bluesky') 
                        ? 'https://app.netlify.com/extensions/bluesky-custom-domain'
                        : plugin.includes('supabase')
                        ? 'https://app.netlify.com/extensions/supabase'
                        : 'Netlify Extensions';
                    console.log(`   � ${plugin}: ${setupUrl}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating netlify.toml:', error.message);
    }
}

main().catch(console.error);
