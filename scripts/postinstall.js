#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runUpgrade() {
    const upgradePath = path.join(__dirname, 'upgrade-config.js');
    await import(pathToFileURL(upgradePath).href);
}

async function runSetupImages() {
    const { setupUserImages } = await import('./setup-user-images.js');
    await setupUserImages();
}

async function main() {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    const currentVersion = pkg.version;

    const userRoot = process.env.INIT_CWD || process.cwd();
    const versionFile = path.join(userRoot, '.core-maugli-version');

    let previousVersion = null;
    try {
        previousVersion = (await fs.readFile(versionFile, 'utf8')).trim();
    } catch {}

    if (previousVersion !== currentVersion) {
        console.log(`Detected core-maugli version change (${previousVersion || 'none'} -> ${currentVersion}).`);
        await runUpgrade();
        await fs.writeFile(versionFile, currentVersion, 'utf8');
    } else {
        console.log(`core-maugli version ${currentVersion} unchanged, skipping upgrade.`);
    }

    await runSetupImages();
}

main().catch((err) => {
    console.error('Postinstall failed:', err);
    process.exit(1);
});
