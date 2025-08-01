#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultConfigPath = path.join(__dirname, '../src/config/maugli.config.ts');
const userConfigPath = path.join(process.cwd(), 'src/config/maugli.config.ts');

async function loadTsModule(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  const js = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const tmp = path.join(os.tmpdir(), `maugli-${Date.now()}.mjs`);
  await fs.writeFile(tmp, js, 'utf8');
  const mod = await import(pathToFileURL(tmp).href);
  await fs.unlink(tmp);
  return mod;
}

function mergeMissing(target, source) {
  for (const key of Object.keys(source)) {
    if (key === 'configVersion') continue;
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      if (!tv || typeof tv !== 'object' || Array.isArray(tv)) {
        if (!(key in target)) target[key] = sv;
      } else {
        mergeMissing(tv, sv);
      }
    } else {
      if (!(key in target)) target[key] = sv;
    }
  }
}

async function main() {
  const pkg = await loadTsModule(defaultConfigPath);
  const defCfg = pkg.maugliConfig;
  const newVersion = pkg.MAUGLI_CONFIG_VERSION || defCfg.configVersion;

  let user;
  try {
    user = await loadTsModule(userConfigPath);
  } catch (err) {
    console.error(`Cannot find user config at ${userConfigPath}`);
    process.exit(1);
  }
  const userCfg = user.maugliConfig;
  if (userCfg.configVersion === newVersion) {
    console.log('maugli.config.ts is already up to date');
    return;
  }

  mergeMissing(userCfg, defCfg);
  userCfg.configVersion = newVersion;

  const defText = await fs.readFile(defaultConfigPath, 'utf8');
  const headerEnd = defText.indexOf('export const maugliConfig');
  let header = defText.slice(0, headerEnd);
  header = header.replace(/MAUGLI_CONFIG_VERSION\s*=\s*['\"][^'\"]*['\"]/, `MAUGLI_CONFIG_VERSION = '${newVersion}'`);
  let bracePos = defText.indexOf('{', headerEnd);
  let count = 0, i = bracePos;
  for (; i < defText.length; i++) {
    if (defText[i] === '{') count++;
    else if (defText[i] === '}') count--;
    if (count === 0) break;
  }
  let j = i;
  while (j < defText.length && defText[j] !== ';') j++;
  const tail = defText.slice(j + 1);

  const newObject = JSON.stringify(userCfg, null, 2);
  const result = `${header}export const maugliConfig: MaugliConfig = ${newObject};${tail}`;
  await fs.writeFile(userConfigPath, result, 'utf8');
  console.log(`Upgraded maugli.config.ts to version ${newVersion}`);
}

main().catch(err => {
  console.error('Upgrade failed:', err);
  process.exit(1);
});

