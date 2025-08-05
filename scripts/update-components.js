#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Определяем корневые папки
const isInNodeModules = __dirname.includes('node_modules');
const isSourceProject = !isInNodeModules && (__dirname.includes('core-maugli-blog') || process.cwd().includes('core-maugli-blog'));

const packageRoot = isInNodeModules 
  ? path.join(__dirname, '../../..', 'node_modules', 'core-maugli') // из node_modules
  : path.join(__dirname, '..'); // из исходников

const userRoot = isInNodeModules
  ? path.join(__dirname, '../../..') // корень пользовательского проекта
  : process.env.INIT_CWD || process.cwd(); // для разработки

// Список папок и файлов для полного обновления (перезаписи)
const FORCE_UPDATE_PATHS = [
  'src/components',
  'src/layouts', 
  'src/pages',
  'src/utils',
  'src/scripts',
  'src/icons',
  'src/i18n',
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
  'tsconfig.json'
];

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
  
  // Дополнительная проверка
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
