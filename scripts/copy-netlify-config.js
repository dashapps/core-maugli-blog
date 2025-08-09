#!/usr/bin/env node

/**
 * Copies netlify.toml only when initializing a new blog
 * DOES NOT TOUCH existing netlify.toml files!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
    try {
        const targetPath = path.join(process.cwd(), 'netlify.toml');
        
        // Если netlify.toml уже существует - НЕ ТРОГАЕМ!
        if (fs.existsSync(targetPath)) {
            console.log('📋 netlify.toml already exists - leaving unchanged');
            console.log('� Configure Netlify plugins manually via Netlify UI');
            return;
        }
        
        // Search for source file in package
        let sourcePath;
        const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'core-maugli', 'netlify.toml');
        if (fs.existsSync(nodeModulesPath)) {
            sourcePath = nodeModulesPath;
        } else {
            sourcePath = path.join(__dirname, '..', 'netlify.toml');
        }
        
        if (!fs.existsSync(sourcePath)) {
            console.log('⚠️  netlify.toml template not found');
            return;
        }
        
        // Copy file only for new blog
        fs.copyFileSync(sourcePath, targetPath);
        console.log('✅ netlify.toml created for new blog');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Deploy to Netlify');
        console.log('   2. Configure plugins via Netlify UI');
        console.log('   3. Add "# CUSTOMIZED" comment to prevent overwrites');
        
    } catch (error) {
        console.error('❌ Error copying netlify.toml:', error.message);
    }
}

main();
