#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const dirs = ['src/components', 'src/utils', 'public/flags'];
const patterns = [/\(\d+\)$/i, /\s\d+$/i, /- copy$/i, /_copy$/i];

async function scan(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scan(fullPath);
      continue;
    }
    const base = path.basename(entry.name, path.extname(entry.name));
    if (patterns.some((p) => p.test(base))) {
      await fs.unlink(fullPath);
      console.log(`Removed duplicate: ${fullPath}`);
    }
  }
}

for (const dir of dirs) {
  await scan(dir);
}
