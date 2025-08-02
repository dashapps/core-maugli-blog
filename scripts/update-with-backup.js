#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  const root = process.cwd();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(root, `maugli-backup-${stamp}`);
  await fs.mkdir(backupDir, { recursive: true });

  const items = [
    { src: 'src/content', dest: 'content' },
    { src: 'src/styles/global.css', dest: 'global.css' },
    { src: 'src/config/maugli.config.ts', dest: 'maugli.config.ts' }
  ];

  for (const { src, dest } of items) {
    const from = path.join(root, src);
    try {
      await fs.cp(from, path.join(backupDir, dest), { recursive: true });
    } catch (err) {
      // ignore missing files
    }
  }

  console.log(`Backup created at ${backupDir}`);
  execSync('npm update', { stdio: 'inherit' });
}

main().catch(err => {
  console.error('Backup update failed:', err);
  process.exit(1);
});
