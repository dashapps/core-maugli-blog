#!/usr/bin/env node
const [, , cmd, target] = process.argv;

if (cmd === 'init') {
  const mod = await import('./init.js');
  await mod.default(target);
} else {
  await import('../scripts/upgrade-config.js');
}
