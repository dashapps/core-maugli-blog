#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

const files = {
  'src/components/MaugliFloatingLabel.astro': 'ca96de8e3632806e83ab7db3973c569b0e039f98e2d8830175a559a0b239108e',
  'public/footerlabel.svg': '641b87e957ed5525b45f0bb94671e55f256302a64bbcd2f738a118bffa1f6bfe'
};

for (const [file, expectedHash] of Object.entries(files)) {
  const content = readFileSync(file);
  const hash = createHash('sha256').update(content).digest('hex');
  if (hash !== expectedHash) {
    console.error(`❌ Hash mismatch for ${file}. Build aborted.`);
    process.exit(1);
  }
}

const configContent = readFileSync('src/config/maugli.config.ts', 'utf8');
const proMatch = configContent.match(/isProTemplate:\s*(true|false)/);
const isProTemplate = proMatch && proMatch[1] === 'true';

if (isProTemplate && process.env.MAUGLI_LICENSE_CONFIRMED !== 'true') {
  console.error('❌ Pro template requires a confirmed license. Set MAUGLI_LICENSE_CONFIRMED=true.');
  process.exit(1);
}

console.log('✅ Asset hashes and license verified.');
