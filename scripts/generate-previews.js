import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Универсальное определение корня проекта для работы как из node_modules, так и из исходников
const rootDir = __dirname.includes('node_modules')
  ? path.join(__dirname, '../../..')
  : path.join(__dirname, '..');

const inputDir = path.join(rootDir, 'public/img/examples/blog');
const outputDir = path.join(rootDir, 'public/img/examples/blog/previews');

const previewWidth = 400;
const previewHeight = 210;

if (!fs.existsSync(inputDir)) {
  console.error('Input directory does not exist:', inputDir);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  if (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png')) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    sharp(inputPath)
      .resize(previewWidth, previewHeight, { fit: 'cover' })
      .toFile(outputPath)
      .then(() => console.log(`Preview created: ${outputPath}`))
      .catch(err => console.error(`Error processing ${file}:`, err));
  }
});
