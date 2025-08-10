#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define root directories
const isInNodeModules = __dirname.includes('node_modules');
const isSourceProject = !isInNodeModules && (
  __dirname.includes('core-maugli-blog') || 
  process.cwd().includes('core-maugli-blog') ||
  __dirname.includes('core-maugli')
);

const packageRoot = isInNodeModules 
  ? path.join(__dirname, '../../..', 'node_modules', 'core-maugli') // из node_modules
  : path.join(__dirname, '..'); // из исходников

const userRoot = isInNodeModules
  ? path.join(__dirname, '../../..') // корень пользовательского проекта
  : process.env.INIT_CWD || process.cwd(); // для разработки

// Debug режим включается через переменную окружения DEBUG=true
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
    console.log('🔍 Debug paths:');
    console.log('  __dirname:', __dirname);
    console.log('  isInNodeModules:', isInNodeModules);
    console.log('  isSourceProject:', isSourceProject);
    console.log('  packageRoot:', packageRoot);
    console.log('  userRoot:', userRoot);
    console.log('  packageRoot === userRoot:', packageRoot === userRoot);
}

// Список папок и файлов для полного обновления (перезаписи)
const FORCE_UPDATE_PATHS = [
  'src/components',
  'src/layouts', 
  'src/pages',
  'src/utils',
  'src/scripts',
  'src/icons',
  'src/i18n',
  'scripts', // Скрипты в корне проекта (включая generate-previews.js)
  'typograf-batch.js', // Отдельный файл
  'resize-all.cjs', // Отдельный файл для ресайза
  'public/flags',
  'public/img/default'
  // Исключили src/styles - может содержать пользовательские стили
];

// Список файлов, которые НЕ должны перезаписываться (пользовательские)
const PRESERVE_PATHS = [
  'src/content',
  'src/config/maugli.config.ts', // обновляется через upgrade-config.js
  'src/styles/global.css', // может быть кастомизирован пользователем
  'package.json',
  'astro.config.mjs',
  'tailwind.config.js',
  'tsconfig.json',
  'scripts/custom-*' // Пользовательские скрипты с префиксом custom-
];

async function updateConfigVersion() {
  try {
    // Получаем версию из package.json пакета
    const packageJsonPath = path.join(packageRoot, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageData = JSON.parse(packageJsonContent);
    const newVersion = packageData.version;

    // Путь к package.json пользователя
    const userPackageJsonPath = path.join(userRoot, 'package.json');
    
    try {
      // Читаем package.json пользователя
      const userPackageContent = await fs.readFile(userPackageJsonPath, 'utf-8');
      const userPackageData = JSON.parse(userPackageContent);
      
      let updated = false;
      
      // Update dependency version
      if (userPackageData.dependencies && userPackageData.dependencies['core-maugli']) {
        const currentVersion = userPackageData.dependencies['core-maugli'];
        if (currentVersion !== `^${newVersion}`) {
          userPackageData.dependencies['core-maugli'] = `^${newVersion}`;
          updated = true;
        }
      }
      
      if (userPackageData.devDependencies && userPackageData.devDependencies['core-maugli']) {
        const currentVersion = userPackageData.devDependencies['core-maugli'];
        if (currentVersion !== `^${newVersion}`) {
          userPackageData.devDependencies['core-maugli'] = `^${newVersion}`;
          updated = true;
        }
      }
      
      // Update build script to include preview generation
      if (userPackageData.scripts) {
        const expectedBuildScript = "node typograf-batch.js && node scripts/generate-previews.js && node scripts/verify-assets.js && astro build";
        const currentBuildScript = userPackageData.scripts.build;
        
        // Check if build script contains preview generation
        if (currentBuildScript && !currentBuildScript.includes('generate-previews.js')) {
          // Add preview generation to build process
          if (currentBuildScript.includes('astro build')) {
            userPackageData.scripts.build = currentBuildScript.replace(
              'astro build',
              'node scripts/generate-previews.js && astro build'
            );
            updated = true;
            console.log('📦 Added generate-previews.js to build script');
          }
        }
      }
      
      if (updated) {
        await fs.writeFile(userPackageJsonPath, JSON.stringify(userPackageData, null, 2) + '\n', 'utf-8');
        console.log(`📦 Updated package.json with version ^${newVersion}`);
      } else {
        console.log(`📦 Package.json already up to date`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📦 User package.json not found, skipping version update');
      } else {
        console.warn('Warning: Could not update package.json version:', error.message);
      }
    }
  } catch (error) {
    console.warn('Warning: Could not read package version:', error.message);
  }
}

// Функция для принудительного обновления PWA конфигурации
async function forceUpdatePWAConfig() {
  try {
    const packageConfigPath = path.join(packageRoot, 'astro.config.mjs');
    const userConfigPath = path.join(userRoot, 'astro.config.mjs');
    
    // Проверяем, существует ли конфиг в пакете
    try {
      await fs.access(packageConfigPath);
    } catch {
      console.log('🔧 PWA config not found in package, skipping PWA update');
      return;
    }
    
    // Читаем конфигурацию из пакета
    const packageConfigContent = await fs.readFile(packageConfigPath, 'utf-8');
    
    // Проверяем, есть ли PWA в конфигурации пакета
    if (packageConfigContent.includes('VitePWA') || packageConfigContent.includes('@vite-pwa')) {
      // Если у пользователя уже есть конфиг, делаем резервную копию
      try {
        await fs.access(userConfigPath);
        const backupPath = `${userConfigPath}.backup.${Date.now()}`;
        await fs.copyFile(userConfigPath, backupPath);
        console.log(`🔧 Backed up existing config to ${path.basename(backupPath)}`);
      } catch {
        // Конфига у пользователя нет, это нормально
      }
      
      // Копируем новую конфигурацию с PWA
      await fs.copyFile(packageConfigPath, userConfigPath);
      console.log('🚀 Updated astro.config.mjs with PWA configuration');
    } else {
      console.log('🔧 No PWA configuration found in package config');
    }
  } catch (error) {
    console.warn('Warning: Could not update PWA configuration:', error.message);
  }
}

async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        console.log(`Updated: ${path.relative(userRoot, destPath)}`);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not copy ${src} to ${dest}:`, error.message);
  }
}

async function updateStyles() {
  const srcStylesPath = path.join(packageRoot, 'src/styles');
  const destStylesPath = path.join(userRoot, 'src/styles');
  
  try {
    // Проверяем, существует ли папка styles в пакете
    await fs.stat(srcStylesPath);
    
    // Проверяем, есть ли уже пользовательские стили
    try {
      const userGlobalCss = path.join(destStylesPath, 'global.css');
      await fs.stat(userGlobalCss);
      console.log('📝 Preserving user styles (global.css exists)');
      
      // Копируем только новые файлы стилей, не трогая global.css
      const entries = await fs.readdir(srcStylesPath, { withFileTypes: true });
      await fs.mkdir(destStylesPath, { recursive: true });
      
      for (const entry of entries) {
        if (entry.name !== 'global.css') {
          const srcFile = path.join(srcStylesPath, entry.name);
          const destFile = path.join(destStylesPath, entry.name);
          await fs.copyFile(srcFile, destFile);
          console.log(`Updated style: ${entry.name}`);
        }
      }
    } catch {
      // Пользовательских стилей нет, копируем все
      await copyDirectory(srcStylesPath, destStylesPath);
      console.log('📝 Copied default styles');
    }
  } catch (error) {
    console.warn('Warning: Could not update styles:', error.message);
  }
}

async function updateComponents() {
  console.log('🔄 Updating Maugli components and assets...');
  
  // Проверяем, что мы не в исходном проекте (чтобы не удалить исходники)
  if (isSourceProject) {
    console.log('⚠️  Skipping component update (running in source project)');
    return;
  }
  
  // Additional check
  if (packageRoot === userRoot) {
    console.log('⚠️  Skipping component update (packageRoot equals userRoot)');
    return;
  }
  
  let updatedCount = 0;
  
  for (const updatePath of FORCE_UPDATE_PATHS) {
    const srcPath = path.join(packageRoot, updatePath);
    const destPath = path.join(userRoot, updatePath);
    
    try {
      // Проверяем, существует ли исходная папка/файл
      const stats = await fs.stat(srcPath);
      
      if (stats.isDirectory()) {
        // Удаляем существующую папку и копируем новую
        try {
          await fs.rm(destPath, { recursive: true, force: true });
        } catch (e) {
          // Папки может не быть - это нормально
        }
        
        await copyDirectory(srcPath, destPath);
        updatedCount++;
      } else if (stats.isFile()) {
        // Копируем отдельный файл
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(srcPath, destPath);
        console.log(`Updated: ${path.relative(userRoot, destPath)}`);
        updatedCount++;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`Warning: Could not update ${updatePath}:`, error.message);
      }
    }
  }
  
  // Обрабатываем стили отдельно
  await updateStyles();
  
  // Update version in config
  await updateConfigVersion();
  
  // Force update PWA configuration
  await forceUpdatePWAConfig();
  
  console.log(`✅ Updated ${updatedCount} component directories/files`);
}

async function main() {
  try {
    await updateComponents();
    console.log('🎉 Component update completed successfully!');
  } catch (error) {
    console.error('❌ Component update failed:', error);
    process.exit(1);
  }
}

// Запускаем только если вызывается напрямую
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export { updateComponents };
