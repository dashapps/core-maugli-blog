#!/usr/bin/env node

/**
 * Generate netlify.toml from maugli.config.ts
 * This script creates a Netlify configuration file based on the Maugli configuration
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadTsModule(filePath) {
    const code = await fs.promises.readFile(filePath, 'utf8');
    const js = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const tmp = path.join(os.tmpdir(), `netlify-gen-${Date.now()}.mjs`);
    await fs.promises.writeFile(tmp, js, 'utf8');
    const mod = await import(pathToFileURL(tmp).href);
    await fs.promises.unlink(tmp);
    return mod;
}

async function loadMaugliConfig() {
    try {
        // Try to load from user project first
        const userConfigPath = path.join(process.cwd(), 'src/config/maugli.config.ts');
        if (fs.existsSync(userConfigPath)) {
            const mod = await loadTsModule(userConfigPath);
            return mod.maugliConfig;
        }
        
        // Fallback to default config
        const defaultConfigPath = path.join(__dirname, '../src/config/maugli.config.ts');
        const mod = await loadTsModule(defaultConfigPath);
        return mod.maugliConfig;
    } catch (error) {
        console.warn('Could not load maugli.config.ts:', error.message);
        return null;
    }
}

function generateNetlifyToml(config) {
    const netlifyConfig = config.netlify || {};
    
    let toml = `# Netlify configuration generated from maugli.config.ts\n\n`;
    
    // Build settings
    toml += `[build]\n`;
    toml += `  command = "${netlifyConfig.buildCommand || 'npm run build'}"\n`;
    toml += `  publish = "${netlifyConfig.publishDir || 'dist'}"\n\n`;
    
    // Environment variables
    if (netlifyConfig.environment) {
        toml += `[build.environment]\n`;
        
        // Add auto-update control
        if (netlifyConfig.autoUpdate === false) {
            toml += `  DISABLE_AUTO_UPDATE = "true"\n`;
        }
        
        for (const [key, value] of Object.entries(netlifyConfig.environment)) {
            toml += `  ${key} = "${value}"\n`;
        }
        toml += `\n`;
    } else if (netlifyConfig.autoUpdate === false) {
        toml += `[build.environment]\n`;
        toml += `  DISABLE_AUTO_UPDATE = "true"\n\n`;
    }
    
    // Plugins
    if (netlifyConfig.plugins && netlifyConfig.plugins.length > 0) {
        toml += `# Netlify plugins\n`;
        netlifyConfig.plugins.forEach(plugin => {
            toml += `[[plugins]]\n`;
            toml += `  package = "${plugin}"\n\n`;
        });
    }
    
    // Redirects
    if (netlifyConfig.redirects && netlifyConfig.redirects.length > 0) {
        toml += `# Redirects\n`;
        netlifyConfig.redirects.forEach(redirect => {
            toml += `[[redirects]]\n`;
            toml += `  from = "${redirect.from}"\n`;
            toml += `  to = "${redirect.to}"\n`;
            toml += `  status = ${redirect.status || 301}\n`;
            if (redirect.force) {
                toml += `  force = true\n`;
            }
            toml += `\n`;
        });
    }
    
    // Headers
    if (netlifyConfig.headers && netlifyConfig.headers.length > 0) {
        toml += `# Headers\n`;
        netlifyConfig.headers.forEach(header => {
            toml += `[[headers]]\n`;
            toml += `  for = "${header.for}"\n`;
            for (const [key, value] of Object.entries(header.values)) {
                toml += `  [headers.values]\n`;
                toml += `    "${key}" = "${value}"\n`;
            }
            toml += `\n`;
        });
    }
    
    return toml;
}

async function main() {
    console.log('🔧 Generating netlify.toml from maugli.config.ts...');
    
    const config = await loadMaugliConfig();
    if (!config) {
        console.error('❌ Could not load maugli configuration');
        process.exit(1);
    }
    
    const tomlContent = generateNetlifyToml(config);
    const outputPath = path.join(process.cwd(), 'netlify.toml');
    
    // Check if netlify.toml already exists
    if (fs.existsSync(outputPath)) {
        console.log('⚠️  netlify.toml already exists. Creating backup...');
        fs.copyFileSync(outputPath, `${outputPath}.backup`);
    }
    
    fs.writeFileSync(outputPath, tomlContent, 'utf8');
    console.log('✅ netlify.toml generated successfully!');
    
    if (config.netlify?.autoUpdate === false) {
        console.log('🚫 Auto-update disabled in Netlify configuration');
    } else {
        console.log('🔄 Auto-update enabled for Netlify builds');
    }
    
    console.log('📁 File location:', outputPath);
}

main().catch(error => {
    console.error('❌ Failed to generate netlify.toml:', error.message);
    process.exit(1);
});
