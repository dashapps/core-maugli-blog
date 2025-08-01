#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function copyItem(item, targetDir) {
  const src = path.join(rootDir, item);
  const dest = path.join(targetDir, item);
  await fs.cp(src, dest, { recursive: true });
}

async function npmInstall(targetDir) {
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], { cwd: targetDir, stdio: 'inherit' });
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`npm install failed with code ${code}`))));
  });
}

export default async function init(targetArg) {
  const target = targetArg || '.';
  const targetDir = path.resolve(process.cwd(), target);
  await fs.mkdir(targetDir, { recursive: true });
  for (const item of ['src', 'public', 'scripts', 'astro.config.mjs']) {
    await copyItem(item, targetDir);
  }
  await npmInstall(targetDir);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  init(process.argv[2]).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
