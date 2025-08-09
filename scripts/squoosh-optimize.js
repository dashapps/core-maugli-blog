#!/usr/bin/env node

// squoosh-optimize.js - automatic optimization through Squoosh CLI
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

// Function to get all images
function getAllImages(dir, images = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            getAllImages(itemPath, images);
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                // Skip already processed resized images
                const baseName = path.basename(item, ext);
                if (!/-\d+$/.test(baseName)) {
                    images.push(itemPath);
                }
            }
        }
    }
    
    return images;
}

// Function to create temporary directory
function createTempDir() {
    const tempDir = path.join(projectRoot, '.temp-optimization');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
}

// Function to optimize through Squoosh CLI
async function optimizeWithSquoosh() {
    console.log('🚀 Starting optimization through Squoosh CLI...');
    
    const images = getAllImages(publicDir);
    console.log(`📁 Found ${images.length} images for optimization`);
    
    if (images.length === 0) {
        console.log('📷 No images to optimize');
        return;
    }
    
    const tempDir = createTempDir();
    
    try {
        // Create directory for input files
        const inputDir = path.join(tempDir, 'input');
        const outputDir = path.join(tempDir, 'output');
        
        if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        
        // Copy files to temporary directory
        console.log('📋 Preparing files...');
        images.forEach((imagePath, index) => {
            const ext = path.extname(imagePath);
            const tempFileName = `image_${index}${ext}`;
            const tempFilePath = path.join(inputDir, tempFileName);
            fs.copyFileSync(imagePath, tempFilePath);
        });
        
        // Run Squoosh CLI for WebP optimization
        console.log('⚡ Running Squoosh CLI...');
        const squooshCommand = `npx @squoosh/cli --webp auto "${inputDir}/*" -d "${outputDir}"`;
        
        try {
            execSync(squooshCommand, { 
                stdio: 'inherit',
                cwd: projectRoot 
            });
            
            console.log('✅ Squoosh CLI completed');
            
            // Copy optimized files back
            const optimizedFiles = fs.readdirSync(outputDir);
            let totalSavings = 0;
            let processedCount = 0;
            
            optimizedFiles.forEach((fileName, index) => {
                if (index < images.length) {
                    const originalPath = images[index];
                    const optimizedPath = path.join(outputDir, fileName);
                    
                    if (fs.existsSync(optimizedPath)) {
                        const originalSize = fs.statSync(originalPath).size;
                        const optimizedSize = fs.statSync(optimizedPath).size;
                        
                        if (optimizedSize < originalSize) {
                            const savings = originalSize - optimizedSize;
                            const savingsPercent = Math.round((savings / originalSize) * 100);
                            
                            // Заменяем оригинал на оптимизированную версию
                            fs.copyFileSync(optimizedPath, originalPath);
                            
                            totalSavings += savings;
                            processedCount++;
                            
                            console.log(`💾 ${path.relative(publicDir, originalPath)}: ${Math.round(savings/1024)}KB saved (${savingsPercent}%)`);
                        }
                    }
                }
            });
            
            console.log(`\n🎉 Processed ${processedCount} images`);
            console.log(`💰 Total savings: ${Math.round(totalSavings/1024)}KB`);
            
        } catch (squooshError) {
            console.error('❌ Squoosh CLI error:', squooshError.message);
            console.log('🔄 Switching to Sharp optimization...');
            return false;
        }
        
    } finally {
        // Clean up temporary files
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
    
    return true;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    optimizeWithSquoosh().catch(console.error);
}

export { optimizeWithSquoosh };
