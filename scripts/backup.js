#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), `backup-${timestamp}`);

fs.mkdirSync(backupDir, { recursive: true });

const items = [
  'src/content',
  'src/styles/global.css',
  'src/config/maugli.config.ts'
];

for (const item of items) {
  const src = path.join(process.cwd(), item);
  const dest = path.join(backupDir, item);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Backed up ${item} to ${dest}`);
}

console.log(`Backup complete: ${backupDir}`);
