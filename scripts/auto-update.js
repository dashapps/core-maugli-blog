#!/usr/bin/env node

/**
 * Auto-update script for CI/CD environments
 * Automatically updates core-maugli to the latest version without prompts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

async function getCurrentVersion() {
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageJson.dependencies?.['core-maugli'] || packageJson.version;
    } catch (error) {
        return null;
    }
}

async function getLatestVersion() {
    try {
        const result = execSync('npm view core-maugli version', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return null;
    }
}

function compareVersions(current, latest) {
    if (!current || !latest) return false;
    
    current = current.replace(/^[\^~]/, '');
    
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
        const currentPart = currentParts[i] || 0;
        const latestPart = latestParts[i] || 0;
        
        if (latestPart > currentPart) return true;
        if (latestPart < currentPart) return false;
    }
    
    return false;
}

async function performAutoUpdate() {
    console.log(colorize('🤖 CI/CD Auto-update mode activated', 'cyan'));
    console.log(colorize('🔄 Updating core-maugli automatically...', 'blue'));
    
    try {
        // Check if update script exists
        const updateScriptPath = path.join(process.cwd(), 'scripts', 'update-all-blogs.js');
        if (fs.existsSync(updateScriptPath)) {
            console.log(colorize('📦 Running comprehensive update script...', 'cyan'));
            execSync(`node ${updateScriptPath} ${process.cwd()}`, { stdio: 'inherit' });
        } else {
            // Fallback to simple npm update
            console.log(colorize('📦 Running npm update...', 'cyan'));
            execSync('npm update core-maugli', { stdio: 'inherit' });
        }
        
        console.log(colorize('✅ Auto-update completed successfully!', 'green'));
        return true;
    } catch (error) {
        console.error(colorize('❌ Auto-update failed:', 'red'), error.message);
        return false;
    }
}

async function main() {
    console.log(colorize('🔍 Checking for core-maugli updates...', 'cyan'));
    
    const currentVersion = await getCurrentVersion();
    const latestVersion = await getLatestVersion();
    
    if (!currentVersion || !latestVersion) {
        console.log(colorize('⚠️  Could not check version. Proceeding...', 'yellow'));
        return;
    }
    
    console.log(colorize(`📦 Current version: ${currentVersion}`, 'white'));
    console.log(colorize(`📦 Latest version: ${latestVersion}`, 'white'));
    
    if (!compareVersions(currentVersion, latestVersion)) {
        console.log(colorize('✅ Already using the latest version!', 'green'));
        return;
    }
    
    // Auto-update without prompts
    console.log(colorize(`🚀 New version ${latestVersion} available! Auto-updating...`, 'magenta'));
    
    const success = await performAutoUpdate();
    if (!success) {
        console.error(colorize('❌ Auto-update failed. Build may fail or produce unexpected results.', 'red'));
        process.exit(1);
    }
    
    console.log(colorize('✅ Ready to proceed with updated version!', 'green'));
}

main().catch(error => {
    console.error(colorize('❌ Auto-update check failed:', 'red'), error.message);
    process.exit(1);
});
