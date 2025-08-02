#!/usr/bin/env node

import { execSync } from 'child_process';
import { cpSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.join(__dirname, '..');

export default function init(targetName) {
  const targetDir = targetName ? path.resolve(targetName) : process.cwd();

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
}

// Если скрипт запускается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  init(process.argv[2]);
}