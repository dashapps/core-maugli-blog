// copy-content-images.cjs - Move all images from public/img subfolders to public/img root
const fs = require('fs');
const path = require('path');

const sourceDir = './public/img';
const targetDir = './public/img';

// Function to recursively find and copy images from subfolders
async function flattenImages(sourceDir, targetDir) {
    if (!fs.existsSync(sourceDir)) {
        console.log(`📁 Folder ${sourceDir} does not exist, skipping`);
        return 0;
    }

    const items = fs.readdirSync(sourceDir);
    let copiedCount = 0;

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            // Recursively process subfolders
            const copied = await flattenImages(sourcePath, targetDir);
            copiedCount += copied;
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            
            // Check if it's an image and it's in a subfolder (not in root)
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                const relativePath = path.relative(sourceDir, sourcePath);
                
                // If file is not in public/img root, copy it to root
                if (relativePath.includes(path.sep)) {
                    const targetPath = path.join(targetDir, item);
                    
                    // Check that file with this name doesn't exist in root
                    if (!fs.existsSync(targetPath)) {
                        fs.copyFileSync(sourcePath, targetPath);
                        console.log(`📋 Moved: ${relativePath} → ${item}`);
                        copiedCount++;
                    } else {
                        console.log(`⚠️  Skipped (already exists): ${item}`);
                    }
                }
            }
        }
    }

    return copiedCount;
}

async function main() {
    console.log('🚀 Starting image flattening from public/img subfolders to public/img root...');
    
    // Move all images from subfolders to root
    const totalCopied = await flattenImages(sourceDir, targetDir);
    
    console.log('');
    console.log(`✅ Flattening completed! Copied ${totalCopied} images to public/img/ root`);
    console.log('🔄 Netlify Image Optimization can now process them more easily');
    console.log('⚡ Sharp optimization will also be applied to files in root');
    console.log('📁 All images are now available directly from /img/filename.webp');
}

main().catch(console.error);
