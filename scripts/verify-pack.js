#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

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

console.log('All required package files are present.');
