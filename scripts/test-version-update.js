#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testVersionUpdate() {
  console.log('🧪 Testing version update function...');
  
  try {
    // Получаем версию из package.json
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageData = JSON.parse(packageJsonContent);
    const newVersion = packageData.version;

    // Путь к конфигу
    const configPath = path.join(__dirname, '../src/config/maugli.config.ts');
    
    // Читаем конфиг
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Ищем строку с MAUGLI_CONFIG_VERSION
    const versionRegex = /export const MAUGLI_CONFIG_VERSION = ['"`]([^'"`]+)['"`];/;
    const match = configContent.match(versionRegex);
    
    if (match) {
      const currentVersion = match[1];
      console.log(`📦 Current config version: ${currentVersion}`);
      console.log(`📦 Package version: ${newVersion}`);
      
      if (currentVersion !== newVersion) {
        const updatedContent = configContent.replace(
          versionRegex,
          `export const MAUGLI_CONFIG_VERSION = '${newVersion}';`
        );
        
        await fs.writeFile(configPath, updatedContent, 'utf-8');
        console.log(`✅ Updated config version: ${currentVersion} → ${newVersion}`);
      } else {
        console.log(`✅ Config version already up to date: ${newVersion}`);
      }
    } else {
      console.log('❌ Config version line not found');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVersionUpdate();
