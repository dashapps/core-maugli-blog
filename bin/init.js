#!/usr/bin/env node

import { execSync } from 'child_process';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.join(__dirname, '..');

function getLanguageCodes() {
  const file = readFileSync(path.join(templateRoot, 'src/i18n/languages.ts'), 'utf8');
  const codes = [];
  const regex = /{\s*code:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(file)) !== null) {
    codes.push(match[1]);
  }
  return codes;
}

function promptLang(codes) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(`Choose language (${codes.join(', ')}): `, answer => {
      rl.close();
      resolve(codes.includes(answer) ? answer : codes[0]);
    });
  });
}

function updateConfig(targetDir, lang) {
  const configPath = path.join(targetDir, 'src', 'config', 'maugli.config.ts');
  if (!existsSync(configPath)) return;
  let content = readFileSync(configPath, 'utf8');
  content = content.replace(/defaultLang:\s*'[^']*'/, `defaultLang: '${lang}'`);
  const multiMatch = content.match(/enableMultiLang:\s*(true|false)/);
  const multi = multiMatch ? multiMatch[1] === 'true' : false;
  content = content.replace(/showLangSwitcher:\s*(true|false)/, `showLangSwitcher: ${multi}`);
  writeFileSync(configPath, content);
  console.log(`Configured default language to ${lang}`);
}

export default async function init(targetName, langOption) {
  const targetDir = targetName ? path.resolve(targetName) : process.cwd();
  const codes = getLanguageCodes();
  const lang = langOption && codes.includes(langOption) ? langOption : await promptLang(codes);

  function copyItem(item) {
    const src = path.join(templateRoot, item);
    const dest = path.join(targetDir, item);
    
    if (!existsSync(src)) {
      console.log(`Skipped ${item} (not found)`);
      return;
    }
    
    cpSync(src, dest, { recursive: true });
    console.log(`Copied ${item}`);
  }

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
  console.log('Created .gitignore');
  
  writeFileSync(path.join(targetDir, '.prettierrc'), prettierrcContent);
  console.log('Created .prettierrc');

  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  updateConfig(targetDir, lang);
}

// Если скрипт запускается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let targetName;
  let lang;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && i + 1 < args.length) {
      lang = args[i + 1];
      i++;
    } else {
      targetName = args[i];
    }
  }
  await init(targetName, lang);
}