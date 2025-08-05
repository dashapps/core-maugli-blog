#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPackageJsonUpdate() {
  console.log('🧪 Testing package.json version update...');
  
  // Создаем тестовый package.json
  const testPackageJson = {
    "name": "test-blog",
    "version": "1.0.0",
    "dependencies": {
      "core-maugli": "^1.2.3",
      "astro": "^5.5.6"
    }
  };
  
  const testPath = path.join(__dirname, 'test-package.json');
  await fs.writeFile(testPath, JSON.stringify(testPackageJson, null, 2), 'utf-8');
  
  try {
    // Получаем текущую версию из основного package.json
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageData = JSON.parse(packageJsonContent);
    const newVersion = packageData.version;

    // Читаем тестовый package.json
    const testPackageContent = await fs.readFile(testPath, 'utf-8');
    const testPackageData = JSON.parse(testPackageContent);
    
    console.log(`📦 Current test dependency: core-maugli@${testPackageData.dependencies['core-maugli']}`);
    console.log(`📦 New version: ${newVersion}`);
    
    // Обновляем версию
    if (testPackageData.dependencies && testPackageData.dependencies['core-maugli']) {
      const currentVersion = testPackageData.dependencies['core-maugli'];
      if (currentVersion !== `^${newVersion}`) {
        testPackageData.dependencies['core-maugli'] = `^${newVersion}`;
        
        await fs.writeFile(testPath, JSON.stringify(testPackageData, null, 2) + '\n', 'utf-8');
        console.log(`✅ Updated dependency: ${currentVersion} → ^${newVersion}`);
      } else {
        console.log(`✅ Dependency already up to date: ^${newVersion}`);
      }
    }
    
    // Показываем результат
    const updatedContent = await fs.readFile(testPath, 'utf-8');
    console.log('\n📋 Updated test package.json:');
    console.log(updatedContent);
    
  } finally {
    // Удаляем тестовый файл
    await fs.unlink(testPath);
  }
}

testPackageJsonUpdate();
