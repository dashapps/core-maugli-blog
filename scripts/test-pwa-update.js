#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPWAConfig() {
  try {
    const configPath = join(__dirname, '..', 'astro.config.mjs');
    const configContent = await readFile(configPath, 'utf-8');
    
    console.log('🔍 Проверяем PWA конфигурацию в astro.config.mjs...\n');
    
    // Проверяем наличие VitePWA
    const hasVitePWA = configContent.includes('VitePWA');
    const hasPWAImport = configContent.includes('vite-plugin-pwa');
    
    console.log(`✅ VitePWA plugin: ${hasVitePWA ? '✅ Найден' : '❌ Не найден'}`);
    console.log(`✅ vite-plugin-pwa import: ${hasPWAImport ? '✅ Найден' : '❌ Не найден'}`);
    
    // Проверяем manifest
    const hasManifest = configContent.includes('manifest');
    console.log(`✅ Manifest config: ${hasManifest ? '✅ Найден' : '❌ Не найден'}`);
    
    // Проверяем service worker (workbox config)
    const hasWorkbox = configContent.includes('workbox');
    console.log(`✅ Workbox config: ${hasWorkbox ? '✅ Найден' : '❌ Не найден'}`);
    
    // Проверяем pwaOptions
    const hasPWAOptions = configContent.includes('pwaOptions');
    console.log(`✅ PWA Options: ${hasPWAOptions ? '✅ Найден' : '❌ Не найден'}`);
    
    // Проверяем registerType
    const hasRegisterType = configContent.includes('registerType');
    console.log(`✅ Register Type: ${hasRegisterType ? '✅ Найден' : '❌ Не найден'}`);
    
    if (hasVitePWA && hasPWAImport && hasManifest && hasWorkbox && hasPWAOptions) {
      console.log('\n🚀 PWA конфигурация полная и готова к развертыванию!');
      console.log('💡 Эта конфигурация будет принудительно обновлена в пользовательских блогах');
    } else {
      console.log('\n⚠️  PWA конфигурация неполная');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке PWA:', error.message);
  }
}

testPWAConfig();
