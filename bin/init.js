#!/usr/bin/env node

import { cpSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.join(__dirname, '..');
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

function copyItem(item) {
  const src = path.join(templateRoot, item);
  const dest = path.join(targetDir, item);
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
  'public',
  'src',
  'scripts',
  'typograf-batch.js',
  'resize-all.cjs'
];
items.forEach(copyItem);

execSync('npm install', { cwd: targetDir, stdio: 'inherit' });