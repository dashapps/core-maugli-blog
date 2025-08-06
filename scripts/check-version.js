#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle CLI arguments and environment variables first
const args = process.argv.slice(2);
if (args.includes('--skip-check') || 
    process.env.SKIP_VERSION_CHECK === 'true' ||
    process.env.DISABLE_AUTO_UPDATE === 'true') {
    console.log(colorize('⏭️  Version check skipped', 'yellow'));
    process.exit(0);
}

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

async function getMaugliConfig() {
    try {
        const configPath = path.join(process.cwd(), 'src/config/maugli.config.ts');
        if (!fs.existsSync(configPath)) {
            return null;
        }
        
        // Простое чтение конфига через регулярные выражения
        const configContent = fs.readFileSync(configPath, 'utf8');
        const forceUpdateMatch = configContent.match(/forceUpdate:\s*(true|false)/);
        
        return {
            forceUpdate: forceUpdateMatch ? forceUpdateMatch[1] === 'true' : false
        };
    } catch (error) {
        console.warn(colorize('⚠️  Could not read maugli.config.ts', 'yellow'));
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

function isCriticalUpdate(current, latest) {
    // Определяем критические обновления (major version или серьезные security fixes)
    const currentParts = current.replace(/^[\^~]/, '').split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    // Разница в major версии - критическое обновление
    if (latestParts[0] > currentParts[0]) return true;
    
    // Разница в minor версии больше 2 - критическое
    if (latestParts[1] - currentParts[1] > 2) return true;
    
    // Разница в patch версии больше 10 - критическое  
    if (latestParts[1] === currentParts[1] && latestParts[2] - currentParts[2] > 10) return true;
    
    return false;
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

async function getUpdateContent(version) {
    try {
        // Try to get changelog or release notes
        const result = execSync(`npm view core-maugli@${version} description`, { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        return "New version available with improvements and bug fixes.";
    }
}

async function promptUpdate() {
    return new Promise((resolve) => {
        // Check for CI/CD environments
        const isCI = process.env.CI === 'true' || 
                    process.env.NETLIFY === 'true' || 
                    process.env.VERCEL === '1' || 
                    process.env.GITHUB_ACTIONS === 'true' ||
                    process.env.BUILD_ID || // Netlify
                    process.env.VERCEL_ENV || // Vercel
                    !process.stdin.isTTY; // Non-interactive terminal
        
        if (isCI) {
            console.log(colorize('\n🤖 CI/CD environment detected. Auto-updating...', 'cyan'));
            resolve(true);
            return;
        }
        
        // Simple input handling that works across all environments
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        const handleInput = (data) => {
            const input = data.toString().trim().toLowerCase();
            process.stdin.pause();
            process.stdin.removeListener('data', handleInput);
            
            if (input === 'y' || input === 'yes' || input === '') {
                resolve(true);
            } else if (input === 'n' || input === 'no') {
                resolve(false);
            } else {
                console.log(colorize('\nPlease enter Y for yes or N for no:', 'yellow'));
                process.stdout.write(colorize('🔄 Would you like to update now? (Y/n): ', 'bold'));
                process.stdin.resume();
                process.stdin.once('data', handleInput);
            }
        };
        
        process.stdin.once('data', handleInput);
    });
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
    console.log(colorize('═'.repeat(60), 'magenta'));
    
    const updateContent = await getUpdateContent(latestVersion);
    console.log(colorize(`\n📋 What's new in v${latestVersion}:`, 'bold'));
    console.log(colorize(updateContent, 'white'));
    
    console.log(colorize('\n🚀 New features include:', 'bold'));
    console.log(colorize('• Enhanced image optimization pipeline', 'green'));
    console.log(colorize('• Improved build performance', 'green'));
    console.log(colorize('• Better asset management', 'green'));
    console.log(colorize('• Centralized update system', 'green'));
    console.log(colorize('• Bug fixes and stability improvements', 'green'));
    
    console.log(colorize('\n💡 Benefits of updating:', 'bold'));
    console.log(colorize('• Faster build times with flatten-images optimization', 'cyan'));
    console.log(colorize('• Better Netlify compatibility', 'cyan'));
    console.log(colorize('• Enhanced security and bug fixes', 'cyan'));
    console.log(colorize('• Access to latest features and improvements', 'cyan'));
    
    console.log(colorize('\n═'.repeat(60), 'magenta'));
    
    // Проверяем, является ли обновление критическим
    const isCritical = isCriticalUpdate(currentVersion, latestVersion);
    
    if (isCritical) {
        console.log(colorize(`\n🚨 CRITICAL UPDATE REQUIRED!`, 'red'));
        console.log(colorize(`Your version (${currentVersion}) is significantly outdated.`, 'red'));
        console.log(colorize('This update contains important security fixes and breaking changes.', 'red'));
        console.log(colorize('Building with outdated version may cause errors.', 'red'));
    } else {
        console.log(colorize(`\n⚠️  Your current version (${currentVersion}) is outdated.`, 'yellow'));
        console.log(colorize('To ensure optimal performance and security, updating is recommended.', 'yellow'));
    }
    
    // Check for CI/CD environments and forceUpdate setting
    const isCI = process.env.CI === 'true' || 
                process.env.NETLIFY === 'true' || 
                process.env.VERCEL === '1' || 
                process.env.GITHUB_ACTIONS === 'true' ||
                process.env.BUILD_ID || // Netlify
                process.env.VERCEL_ENV || // Vercel
                !process.stdin.isTTY; // Non-interactive terminal
    
    // Check forceUpdate setting from maugli.config.ts
    const forceUpdate = maugliConfig?.forceUpdate || false;
    
    if (forceUpdate || isCI) {
        console.log(colorize('\n🤖 Automatic update enabled. Updating...', 'cyan'));
        const success = await performUpdate();
        if (!success) {
            if (isCI) {
                console.log(colorize('\n❌ Auto-update failed in CI/CD environment. Build cancelled.', 'red'));
                process.exit(1);
            } else {
                console.log(colorize('\n⚠️  Update failed. Continuing with build...', 'yellow'));
            }
        }
        return;
    }
    
    if (!isCI && isCritical) {
        console.log(colorize('\n🚨 CRITICAL UPDATE: Automatic update will start in 10 seconds...', 'red'));
        console.log(colorize('Press Ctrl+C to cancel and update manually.', 'yellow'));
        
        // 10-секундный таймер для критических обновлений
        for (let i = 10; i > 0; i--) {
            process.stdout.write(colorize(`\r⏰ Updating in ${i} seconds... `, 'yellow'));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log(colorize('\n🔄 Starting automatic update...', 'cyan'));
        
        const success = await performUpdate();
        if (!success) {
            console.log(colorize('\n❌ Critical update failed! Please update manually:', 'red'));
            console.log(colorize('npm update core-maugli', 'white'));
            process.exit(1);
        }
        return;
    }
    
    if (!isCI) {
        const prompt = isCritical ? 
            colorize('\n🚨 Update now? Critical fixes included! (Y/n): ', 'red') :
            colorize('\n🔄 Would you like to update now? (Y/n): ', 'bold');
        process.stdout.write(prompt);
    }
    
    const shouldUpdate = await promptUpdate();
    
    if (shouldUpdate) {
        const success = await performUpdate();
        if (!success) {
            if (isCI) {
                console.log(colorize('\n❌ Auto-update failed in CI/CD environment. Build cancelled.', 'red'));
                process.exit(1);
            } else {
                console.log(colorize('\n⚠️  Update failed. You can continue with the build, but some features may not work correctly.', 'yellow'));
                process.stdout.write(colorize('Continue anyway? (Y/n): ', 'yellow'));
                const continueAnyway = await promptUpdate();
                if (!continueAnyway) {
                    console.log(colorize('\n❌ Build cancelled. Please update manually and try again.', 'red'));
                    process.exit(1);
                }
            }
        }
    } else {
        // Пользователь отказался от обновления
        if (isCritical) {
            console.log(colorize('\n🚨 WARNING: Building with critically outdated version!', 'red'));
            console.log(colorize('This may cause build failures or security issues.', 'red'));
            console.log(colorize('Please update as soon as possible: npm update core-maugli', 'yellow'));
        }
        
        if (isCI) {
            console.log(colorize('\n⚠️  CI/CD auto-update disabled. Continuing with build...', 'yellow'));
        } else {
            console.log(colorize('\n⚠️  Continuing without update. Some features may not work correctly.', 'yellow'));
            console.log(colorize('💡 You can update later by running: npm run update-all-blogs', 'cyan'));
        }
    }
    
    console.log(colorize('\n✅ Proceeding with build...\n', 'green'));
}

main().catch(error => {
    console.error(colorize('❌ Version check failed:', 'red'), error.message);
    console.log(colorize('⚠️  Continuing with build...', 'yellow'));
    process.exit(0);
});
