// resize-all.cjs - recursive image resizing
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Sizes for generation
const sizes = [400, 800, 1200];

const inputDir = './public';
const processedFiles = new Set(); // Track processed files

// Recursive function for directory traversal
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist`);
    return;
  }

  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      const baseName = path.basename(item, ext);
      
      // Check if it's an image and doesn't contain size in filename
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        // Exclude PWA icons and service files
        const excludePatterns = [
          'icon-192', 'icon-512', // PWA иконки
          'favicon', // Фавиконки
          'logo', // Логотипы (часто SVG, но на всякий случай)
          'manifest' // Файлы манифеста
        ];
        
        const shouldExclude = excludePatterns.some(pattern => baseName.includes(pattern));
        
        // Skip files that already contain size (e.g., image-400.webp, image-800-800.webp)
        // Enhanced check: skip files with -400, -800, -1200 anywhere in the name
        const hasResizeSuffix = sizes.some(size => baseName.includes(`-${size}`));
        
        if (!hasResizeSuffix && !shouldExclude && !processedFiles.has(itemPath)) {
          processedFiles.add(itemPath);
          
          console.log(`Processing: ${itemPath}`);
          
          sizes.forEach(width => {
            const outputPath = path.join(path.dirname(itemPath), `${baseName}-${width}${ext}`);
            
            // Check if file doesn't already exist
            if (!fs.existsSync(outputPath)) {
              sharp(itemPath)
                .resize(width)
                .toFile(outputPath, (err) => {
                  if (err) {
                    console.error(`Error creating ${outputPath}:`, err.message);
                  } else {
                    console.log(`✅ Created: ${path.relative('./public', outputPath)}`);
                  }
                });
            } else {
              console.log(`⏭️  Skipping (already exists): ${path.relative('./public', outputPath)}`);
            }
          });
        }
      }
    }
  });
}

console.log('🔄 Starting image resize process...');
processDirectory(inputDir);
console.log('✅ Image processing completed!');
