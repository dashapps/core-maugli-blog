#!/usr/bin/env node

import { execSync } from 'child_process';
import { cpSync, existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.join(__dirname, '..');

// Доступные языки интерфейса
const availableLanguages = [
  { title: 'English', value: 'en' },
  { title: 'Русский', value: 'ru' },
  { title: 'Español', value: 'es' },
  { title: 'Deutsch', value: 'de' },
  { title: 'Português', value: 'pt' },
  { title: 'Français', value: 'fr' },
  { title: '中文', value: 'zh' },
  { title: '日本語', value: 'ja' }
];

export default async function init(targetName) {
  console.log('🐯 Welcome to Maugli Blog Setup!\n');

  // Настройки по умолчанию
  let settings = {
    blogName: 'My Maugli Blog',
    language: 'en',
    mainDomain: '',
    enableMultiLang: false
  };

  // Попытка загрузить prompts для интерактивного режима
  try {
    const prompts = await import('prompts').then(m => m.default);
    
    // Интерактивные настройки
    const response = await prompts([
      {
        type: 'text',
        name: 'blogName',
        message: 'What would you like to name your blog?',
        initial: settings.blogName
      },
      {
        type: 'select',
        name: 'language',
        message: 'Choose interface language:',
        choices: availableLanguages,
        initial: 0 // English по умолчанию
      },
      {
        type: 'text',
        name: 'mainDomain',
        message: 'Do you have a main domain to link this blog to? (e.g., mybrand.com - leave empty if none):',
        initial: settings.mainDomain
      },
      {
        type: 'confirm',
        name: 'enableMultiLang',
        message: 'Enable multilingual support?',
        initial: settings.enableMultiLang
      }
    ]);

    // Если пользователь отменил настройку
    if (!response.blogName && response.blogName !== '') {
      console.log('Setup cancelled.');
      return;
    }

    settings = { ...settings, ...response };
  } catch (error) {
    console.log('⚠️  Interactive mode unavailable, using default settings...\n');
  }

  createBlog(targetName, settings);
}

function createBlog(targetName, settings) {
  const targetDir = targetName ? path.resolve(targetName) : process.cwd();
  
  // Проверяем, создана ли папка
  if (targetName && !existsSync(targetDir)) {
    console.log(`\n📁 Creating folder: ${targetName}`);
  }

  function copyItem(item) {
    const src = path.join(templateRoot, item);
    const dest = path.join(targetDir, item);
    
    if (!existsSync(src)) {
      console.log(`⚠️  Skipped ${item} (not found)`);
      return;
    }
    
    cpSync(src, dest, { recursive: true });
    console.log(`✅ Copied ${item}`);
  }

  console.log('\n🔧 Copying files...\n');

  // Copy package files first so npm install works correctly
  ['package.json', 'package-lock.json'].forEach(file => {
    if (existsSync(path.join(templateRoot, file))) {
      copyItem(file);
    }
  });

  const items = [
    'astro.config.mjs',
    'tsconfig.json',
    'vite.config.js',
    'public',
    'src',
    'scripts',
    'typograf-batch.js',
    'resize-all.cjs',
    'README.md',
    'LICENSE'
  ];
  items.forEach(copyItem);

  // Создание конфигурационных файлов
  console.log('\n⚙️  Creating configuration files...\n');

  // Create essential config files
  const gitignoreContent = `
# Dependencies
node_modules/
.pnpm-debug.log*

# Environment
.env
.env.local
.env.production

# Build outputs
dist/
.astro/

# Generated files
.DS_Store
.vscode/settings.json

# Cache
.typograf-cache.json
`;

  const prettierrcContent = `{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
`;

  writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent.trim());
  console.log('✅ Created .gitignore');
  
  writeFileSync(path.join(targetDir, '.prettierrc'), prettierrcContent);
  console.log('✅ Created .prettierrc');

  // Обновление maugli.config.ts с пользовательскими настройками
  console.log('\n🎨 Configuring blog settings...\n');
  
  const configPath = path.join(targetDir, 'src/config/maugli.config.ts');
  if (existsSync(configPath)) {
    let configContent = readFileSync(configPath, 'utf8');
    
    // Обновляем название блога
    configContent = configContent.replace(
      /name: 'Maugli'/,
      `name: '${settings.blogName}'`
    );
    
    // Обновляем язык по умолчанию
    configContent = configContent.replace(
      /defaultLang: 'en'/,
      `defaultLang: '${settings.language}'`
    );
    
    // Обновляем мультиязычность
    configContent = configContent.replace(
      /enableMultiLang: false/,
      `enableMultiLang: ${settings.enableMultiLang}`
    );
    
    // Обновляем домен (если указан)
    if (settings.mainDomain) {
      configContent = configContent.replace(
        /logoHref: 'https:\/\/maugli\.cfd'/,
        `logoHref: '${settings.mainDomain}'`
      );
    } else {
      // Если домена нет, ссылка ведет на главную страницу блога
      configContent = configContent.replace(
        /logoHref: 'https:\/\/maugli\.cfd'/,
        `logoHref: '/'`
      );
    }
    
    // Отключаем примеры для нового блога
    configContent = configContent.replace(
      /showExamples: true/,
      `showExamples: false`
    );
    
    writeFileSync(configPath, configContent);
    console.log('✅ Updated maugli.config.ts');
  }

  console.log('\n📦 Installing dependencies...\n');
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

  console.log('\n🎉 Blog successfully created!\n');
  console.log('Settings:');
  console.log(`   📝 Name: ${settings.blogName}`);
  console.log(`   🌐 Language: ${availableLanguages.find(l => l.value === settings.language)?.title || settings.language}`);
  console.log(`   🔗 Domain: ${settings.mainDomain || 'local blog'}`);
  console.log(`   🌍 Multilingual: ${settings.enableMultiLang ? 'enabled' : 'disabled'}`);
  console.log('\nTo start:');
  if (targetName) {
    console.log(`   cd ${targetName}`);
  }
  console.log('   npm run dev\n');
  console.log('📚 All settings can be changed in src/config/maugli.config.ts');
}

// Если скрипт запускается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  init(process.argv[2]);
}