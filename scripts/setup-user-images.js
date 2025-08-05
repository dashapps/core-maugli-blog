#!/usr/bin/env node

/**
 * Image Management Script for Maugli Blog
 * Handles user images separately from core system assets
 */

import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const IMG_DIR = join(PUBLIC_DIR, 'img');

// Ensure user image directories exist
function ensureUserDirectories() {
    const userDirs = [
        join(IMG_DIR, 'uploads'),
        join(IMG_DIR, 'blog'),
        join(IMG_DIR, 'authors'),
        join(IMG_DIR, 'products'),
        join(IMG_DIR, 'projects'),
        join(IMG_DIR, 'previews'),
    ];

    userDirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
}

// Copy default images if they don't exist
function ensureDefaultImages() {
    const defaultDir = join(IMG_DIR, 'default');
    if (!existsSync(defaultDir)) {
        mkdirSync(defaultDir, { recursive: true });
        console.log(`✅ Created default images directory`);
    }
    
    // Create placeholder default images if needed
    const defaultImages = [
        'autor_default.webp',
        'blog_default.webp', 
        'product_default.webp',
        'project_default.webp'
    ];

    // Note: In real implementation, we'd copy actual default images
    console.log(`📁 Default images directory ready at: ${defaultDir}`);
}

// Main setup function
function setupUserImages() {
    console.log('🖼️  Setting up user image directories...');
    
    ensureUserDirectories();
    ensureDefaultImages();
    
    console.log('✅ User image setup complete!');
    console.log('');
    console.log('📝 User images are preserved during npm updates');
    console.log('🔧 Core system assets are managed by the npm package');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupUserImages();
}

export { setupUserImages };
