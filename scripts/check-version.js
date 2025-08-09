#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Handle CLI arguments and environment variables first
const args = process.argv.slice(2);
if (args.includes('--skip-check') || 
    process.env.SKIP_VERSION_CHECK === 'true' ||
    process.env.DISABLE_AUTO_UPDATE === 'true') {
    console.log(colorize('⏭️  Version check skipped', 'yellow'));
    process.exit(0);
}

async function getMaugliConfig() {
    try {
        const configPath = path.join(process.cwd(), 'src/config/maugli.config.ts');
        if (!fs.existsSync(configPath)) {
            console.log(colorize('⚠️  maugli.config.ts not found at src/config/maugli.config.ts', 'yellow'));
            return null;
        }
        
        const configContent = fs.readFileSync(configPath, 'utf8');
        console.log(colorize('🔍 Reading maugli.config.ts...', 'cyan'));
        
        // Simple and reliable forceUpdate search
        let forceUpdate = false;
        
        // Search for all lines with forceUpdate
        const lines = configContent.split('\n');
        const forceUpdateLines = lines.filter(line => line.includes('forceUpdate'));
        
        console.log(colorize(`🔍 Found ${forceUpdateLines.length} lines with forceUpdate:`, 'cyan'));
        
        for (const line of forceUpdateLines) {
            console.log(colorize(`   ${line.trim()}`, 'gray'));
            
            // Check different formats
            if (line.includes('forceUpdate') && line.includes('true')) {
                // Check that this is not a comment
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith('//') && !trimmedLine.startsWith('*')) {
                    forceUpdate = true;
                    console.log(colorize(`✅ Found forceUpdate: true in line: ${trimmedLine}`, 'green'));
                    break;
                }
            }
        }
        
        if (!forceUpdate && forceUpdateLines.length > 0) {
            console.log(colorize('⚠️  forceUpdate found but not set to true', 'yellow'));
        } else if (!forceUpdate) {
            console.log(colorize('⚠️  No forceUpdate setting found in config', 'yellow'));
            console.log(colorize('💡 Make sure your config has: automation: { forceUpdate: true }', 'cyan'));
        }
        
        return {
            automation: {
                forceUpdate: forceUpdate
            }
        };
    } catch (error) {
        console.warn(colorize('⚠️  Could not read maugli.config.ts: ' + error.message, 'yellow'));
        return null;
    }
}

async function getCurrentVersion() {
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageJson.dependencies?.['core-maugli'] || packageJson.version;
    } catch (error) {
        console.warn(colorize('⚠️  Could not read package.json', 'yellow'));
        return null;
    }
}

async function getLatestVersion() {
    try {
        const result = execSync('npm view core-maugli version', { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        console.warn(colorize('⚠️  Could not fetch latest version from npm', 'yellow'));
        return null;
    }
}

function compareVersions(current, latest) {
    if (!current || !latest) return false;
    
    // Remove ^ or ~ from version if present
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

async function performUpdate() {
    console.log(colorize('\n🔄 Updating core-maugli...', 'blue'));
    
    try {
        // Check if update script exists
        const updateScriptPath = path.join(process.cwd(), 'scripts', 'update-all-blogs.js');
        if (fs.existsSync(updateScriptPath)) {
            console.log(colorize('📦 Running update script...', 'cyan'));
            execSync(`node ${updateScriptPath} ${process.cwd()}`, { stdio: 'inherit' });
        } else {
            // Fallback to simple npm update
            console.log(colorize('📦 Running npm update...', 'cyan'));
            execSync('npm update core-maugli', { stdio: 'inherit' });
        }
        
        console.log(colorize('✅ Update completed successfully!', 'green'));
        return true;
    } catch (error) {
        console.error(colorize('❌ Update failed:', 'red'), error.message);
        return false;
    }
}

async function main() {
    console.log(colorize('\n🔍 Checking for core-maugli updates...', 'cyan'));
    
    const currentVersion = await getCurrentVersion();
    const latestVersion = await getLatestVersion();
    const maugliConfig = await getMaugliConfig();
    
    if (!currentVersion || !latestVersion) {
        console.log(colorize('⚠️  Could not check version. Continuing with build...', 'yellow'));
        return;
    }
    
    console.log(colorize(`📦 Current version: ${currentVersion}`, 'white'));
    console.log(colorize(`📦 Latest version: ${latestVersion}`, 'white'));
    
    if (!compareVersions(currentVersion, latestVersion)) {
        console.log(colorize('✅ You are using the latest version!', 'green'));
        return;
    }
    
    // New version available
    console.log(colorize('\n🎉 A new version of core-maugli is available!', 'magenta'));
    
    // Check for CI/CD environments and forceUpdate setting
    const isCI = process.env.CI === 'true' || 
                process.env.NETLIFY === 'true' || 
                process.env.VERCEL === '1' || 
                process.env.GITHUB_ACTIONS === 'true' ||
                process.env.BUILD_ID || // Netlify
                process.env.VERCEL_ENV || // Vercel
                !process.stdin.isTTY; // Non-interactive terminal
    
    const forceUpdate = maugliConfig?.automation?.forceUpdate || false;
    
    console.log(colorize(`\n🔧 Configuration check:`, 'cyan'));
    console.log(colorize(`   • maugli.config.ts found: ${maugliConfig ? 'Yes' : 'No'}`, 'white'));
    console.log(colorize(`   • forceUpdate setting: ${forceUpdate}`, 'white'));
    console.log(colorize(`   • CI/CD detected: ${isCI}`, 'white'));
    
    if (isCI) {
        console.log(colorize('\n🤖 CI/CD environment detected. Updating automatically...', 'cyan'));
        const success = await performUpdate();
        if (!success) {
            console.log(colorize('\n❌ Auto-update failed in CI/CD environment. Build cancelled.', 'red'));
            process.exit(1);
        }
        return;
    }
    
    if (forceUpdate) {
        console.log(colorize('\n🤖 Force update enabled in config. Updating automatically...', 'cyan'));
        const success = await performUpdate();
        if (!success) {
            console.log(colorize('\n❌ Auto-update failed. Continuing with build...', 'yellow'));
        }
        return;
    }
    
    // If forceUpdate is false, show update notification without prompts
    console.log(colorize('\n💡 To update core-maugli, run:', 'cyan'));
    console.log(colorize('   npm run update', 'white'));
    console.log(colorize('   # or', 'gray'));
    console.log(colorize('   npm update core-maugli', 'white'));
    
    console.log(colorize('\n✅ Proceeding with build...\n', 'green'));
}

main().catch(error => {
    console.error(colorize('❌ Version check failed:', 'red'), error.message);
    console.log(colorize('⚠️  Continuing with build...', 'yellow'));
    process.exit(0);
});
