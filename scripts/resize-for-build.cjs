// resize-for-build.cjs - Generate resized images for build in dist/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Sizes to generate
const sizes = [400, 800, 1200];

const inputDir = './public';
const outputDir = './dist';
const processedFiles = new Set();

// Function to create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy file if it doesn't exist
function copyIfNotExists(src, dest) {
  if (!fs.existsSync(dest)) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    console.log(`📋 Copied: ${path.relative('./dist', dest)}`);
    return true;
  }
  return false;
}

// Recursive function to process directories
function processDirectory(dir, relativePath = '') {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    const currentRelativePath = path.join(relativePath, item);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(itemPath, currentRelativePath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const baseName = path.basename(item, ext);
      
      // Check if it's an image and doesn't contain size in name
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Exclude PWA icons and system files
        const excludePatterns = [
          'icon-192', 'icon-512', // PWA icons
          'favicon', // Favicons
          'logo', // Logos
          'manifest' // Manifest files
        ];
        
        const shouldExclude = excludePatterns.some(pattern => baseName.includes(pattern));
        
        // Skip files that already contain size
        const hasResizeSuffix = sizes.some(size => baseName.includes(`-${size}`));
        
        if (!hasResizeSuffix && !shouldExclude && !processedFiles.has(itemPath)) {
          processedFiles.add(itemPath);
          
          console.log(`🔄 Processing for build: ${currentRelativePath}`);
          
          // First copy original
          const outputDirPath = path.join(outputDir, relativePath);
          const originalOutputPath = path.join(outputDirPath, item);
          copyIfNotExists(itemPath, originalOutputPath);
          
          // Generate resized versions
          sizes.forEach(width => {
            const outputPath = path.join(outputDirPath, `${baseName}-${width}${ext}`);
            
            if (!fs.existsSync(outputPath)) {
              ensureDir(path.dirname(outputPath));
              sharp(itemPath)
                .resize(width)
                .toFile(outputPath, (err) => {
                  if (err) {
                    console.error(`❌ Error creating ${outputPath}:`, err.message);
                  } else {
                    console.log(`✅ Created: ${path.relative('./dist', outputPath)}`);
                  }
                });
            } else {
              console.log(`⏭️  Skipped (exists): ${path.relative('./dist', outputPath)}`);
            }
          });
        }
      } else {
        // Copy non-image files as is
        const outputDirPath = path.join(outputDir, relativePath);
        const outputPath = path.join(outputDirPath, item);
        copyIfNotExists(itemPath, outputPath);
      }
    }
  });
}

// Ensure dist exists
ensureDir(outputDir);

console.log('🚀 Starting image processing for build...');
processDirectory(inputDir);
console.log('✅ Image processing completed!');
