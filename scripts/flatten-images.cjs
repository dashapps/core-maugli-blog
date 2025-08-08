// flatten-images.cjs - Move all images from public/img subfolders to public/img root
const fs = require('fs');
const path = require('path');

const sourceDir = './public/img';
const targetDir = './public/img';

// Function to recursively find and copy images from subfolders
async function flattenImages(currentDir) {
    const items = fs.readdirSync(currentDir);
    let copiedCount = 0;

    for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively process subfolders
            const copied = await flattenImages(itemPath);
            copiedCount += copied;
        } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            
            // Check if it's an image and NOT in public/img root
            if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                const isInSubfolder = currentDir !== sourceDir;
                
                if (isInSubfolder) {
                    const targetPath = path.join(sourceDir, item);
                    
                    // Check that file with this name doesn't exist in root
                    if (!fs.existsSync(targetPath)) {
                        fs.copyFileSync(itemPath, targetPath);
                        console.log(`📋 Moved: ${path.relative('./public', itemPath)} → img/${item}`);
                        copiedCount++;
                    } else {
                        // If file already exists, add folder prefix
                        const folderName = path.basename(currentDir);
                        const nameWithoutExt = path.parse(item).name;
                        const extension = path.parse(item).ext;
                        const newName = `${folderName}_${nameWithoutExt}${extension}`;
                        const targetPathWithPrefix = path.join(sourceDir, newName);
                        
                        if (!fs.existsSync(targetPathWithPrefix)) {
                            fs.copyFileSync(itemPath, targetPathWithPrefix);
                            console.log(`📋 Moved with prefix: ${path.relative('./public', itemPath)} → img/${newName}`);
                            copiedCount++;
                        } else {
                            console.log(`⚠️  Skipped (already exists): ${item}`);
                        }
                    }
                }
            }
        }
    }

    return copiedCount;
}

async function main() {
    console.log('🚀 Starting image flattening from public/img subfolders to public/img root...');
    
    if (!fs.existsSync(sourceDir)) {
        console.log(`📁 Folder ${sourceDir} does not exist!`);
        return;
    }
    
    // Move all images from subfolders to root
    const totalCopied = await flattenImages(sourceDir);
    
    console.log('');
    console.log(`✅ Flattening completed! Copied ${totalCopied} images to public/img/ root`);
    console.log('🔄 Netlify Image Optimization can now process them more easily');
    console.log('⚡ Sharp optimization will also be applied to files in root');
    console.log('📁 All images are now available directly from /img/filename.webp');
}

main().catch(console.error);
