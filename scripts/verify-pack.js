#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Run `npm pack --dry-run` and capture JSON output describing package contents
const env = { ...process.env, npm_config_loglevel: 'error' };
const raw = execSync('npm pack --dry-run --json', { encoding: 'utf8', env });
// npm may print warnings before JSON; find the JSON start
const jsonStart = raw.indexOf('[');
const info = JSON.parse(raw.slice(jsonStart))[0];
const files = info.files.map((f) => f.path);

// Build list of expected files based on package.json `files` plus common extras
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const expected = [ ...(pkg.files || []), 'README.md', 'LICENSE' ];
const missing = [];

for (const entry of expected) {
  if (entry.includes('*')) {
    const regex = new RegExp('^' + entry
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*'));
    if (!files.some((f) => regex.test(f))) missing.push(entry);
    continue;
  }

  let isDir = false;
  try {
    isDir = statSync(entry).isDirectory();
  } catch {
    // If local file doesn't exist, we'll report it as missing below
  }

  if (isDir || entry.endsWith('/')) {
    const prefix = entry.endsWith('/') ? entry : entry + '/';
    if (!files.some((f) => f.startsWith(prefix))) missing.push(entry);
  } else if (!files.includes(entry)) {
    missing.push(entry);
  }
}

if (missing.length > 0) {
  console.error('Missing required files in npm package:', missing.join(', '));
  process.exit(1);
}

const duplicatePatterns = [/\(\d+\)$/i, /\s\d+$/i, /- copy$/i, /_copy$/i];
const duplicateDirs = ['src/components', 'src/utils', 'public/flags'];

function findDuplicates(dir, results = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findDuplicates(full, results);
    } else {
      const base = path.basename(entry.name, path.extname(entry.name));
      if (duplicatePatterns.some((p) => p.test(base))) results.push(full);
    }
  }
  return results;
}

const duplicates = duplicateDirs.flatMap((d) => findDuplicates(d));
if (duplicates.length > 0) {
  console.warn('Warning: duplicate files detected:', duplicates.join(', '));
}

console.log('All required package files are present.');
