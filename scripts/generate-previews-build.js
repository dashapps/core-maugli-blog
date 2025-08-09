import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Universal project root detection
const rootDir = __dirname.includes('node_modules')
  ? path.join(__dirname, '../../..')
  : path.join(__dirname, '..');

// Sizes for different content types
const blogPreviewWidth = 400;
const blogPreviewHeight = 210;
const rubricPreviewWidth = 210;
const rubricPreviewHeight = 214;

// Generate in dist instead of public
const outputDir = path.join(rootDir, 'dist');

// Function to create preview in dist
async function createPreviewForBuild(sourcePath, outputPath, width, height) {
  const previewDir = path.dirname(outputPath);
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  if (fs.existsSync(outputPath)) {
    return; // Preview already exists
  }

  try {
    await sharp(sourcePath)
      .resize(width, height, { fit: 'cover' })
      .toFile(outputPath);
    console.log(`✅ Preview created: ${path.relative(rootDir, outputPath)}`);
  } catch (error) {
    console.error(`❌ Error creating preview ${outputPath}:`, error.message);
  }
}

// Function to process directory
async function processDirectory(sourceDir, outputSubDir) {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const items = fs.readdirSync(sourceDir);
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      if (item === 'previews') continue; // Skip preview folders
      await processDirectory(sourcePath, path.join(outputSubDir, item));
    } else if (item.match(/\.(webp|jpg|jpeg|png)$/i)) {
      const ext = path.extname(item);
      const name = path.basename(item, ext);
      
      // Skip files that already contain size suffix
      const hasResizeSuffix = [400, 800, 1200].some(size => name.includes(`-${size}`));
      if (hasResizeSuffix) continue;
      
      // Determine preview size
      let previewWidth, previewHeight;
      if (sourcePath.includes('/img/default/') && (name.includes('rubric') || name.includes('tag'))) {
        previewWidth = rubricPreviewWidth;
        previewHeight = rubricPreviewHeight;
      } else {
        previewWidth = blogPreviewWidth;
        previewHeight = blogPreviewHeight;
      }
      
      // Create preview
      const outputDir = path.join(rootDir, 'dist', outputSubDir, 'previews');
      const outputPath = path.join(outputDir, `${name}${ext}`);
      
      console.log(`🎭 Creating preview for build: ${name}`);
      await createPreviewForBuild(sourcePath, outputPath, previewWidth, previewHeight);
    }
  }
}

// Main function
async function generatePreviewsForBuild() {
  console.log('🚀 Starting preview generation for build...');
  
  // Process system folders
  await processDirectory(path.join(rootDir, 'public/img/default'), 'img/default');
  await processDirectory(path.join(rootDir, 'public/img/examples'), 'img/examples');
  
  // Process user images if they exist
  const pageImagesDir = path.join(rootDir, 'public/img/page-images');
  if (fs.existsSync(pageImagesDir)) {
    await processDirectory(pageImagesDir, 'img/page-images');
  }
  
  console.log('✅ Preview generation for build completed!');
}

generatePreviewsForBuild().catch(console.error);
