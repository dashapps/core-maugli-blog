import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Универсальное определение корня проекта
const rootDir = __dirname.includes('node_modules')
  ? path.join(__dirname, '../../..')
  : path.join(__dirname, '..');

// Размеры для разных типов контента
const blogPreviewWidth = 400;
const blogPreviewHeight = 210;
const rubricPreviewWidth = 210; // Увеличенный размер для качества на retina дисплеях (105px * 2)
const rubricPreviewHeight = 214; // Увеличенный размер для качества на retina дисплеях (107px * 2)

// Функция для извлечения путей изображений из markdown файлов
function extractImagePaths() {
  const imagePaths = new Set();
  const contentDir = path.join(rootDir, 'src/content');
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        const content = fs.readFileSync(itemPath, 'utf-8');
        
        // Извлекаем изображения из frontmatter (image: путь)
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          // Улучшенные регулярки для frontmatter
          const imageMatches = frontmatter.match(/(?:^|\n)\s*(?:image|src):\s*['"]*([^'">\s\n]+)['"]*(?:\s|$)/g);
          if (imageMatches) {
            imageMatches.forEach(match => {
              const imagePath = match.replace(/.*?(?:image|src):\s*['"]*/, '').replace(/['"]*\s*$/, '');
              if (imagePath && !imagePath.startsWith('http') && imagePath.includes('/') && !imagePath.includes('authors/')) {
                imagePaths.add(imagePath);
              }
            });
          }
        }
        
        // Извлекаем изображения из содержимого markdown (![](путь) и <img src="путь">)
        const imgMatches = content.match(/!\[.*?\]\(([^)]+)\)|<img[^>]+src\s*=\s*['"]*([^'">\s]+)['"]*[^>]*>/g);
        if (imgMatches) {
          imgMatches.forEach(match => {
            let imagePath;
            if (match.startsWith('![')) {
              imagePath = match.match(/!\[.*?\]\(([^)]+)\)/)?.[1];
            } else {
              imagePath = match.match(/src\s*=\s*['"]*([^'">\s]+)['"]*/)?.[1];
            }
            if (imagePath && !imagePath.startsWith('http') && imagePath.includes('/') && !imagePath.includes('authors/')) {
              imagePaths.add(imagePath);
            }
          });
        }
      }
    }
  }
  
  scanDirectory(contentDir);
  
  // Также добавляем изображения из public/img/examples/ кроме авторов
  const examplesDir = path.join(rootDir, 'public/img/examples');
  if (fs.existsSync(examplesDir)) {
    function addExampleImages(dir, relativePath = '') {
      // Пропускаем папку authors - аватары не нужно обрабатывать
      if (relativePath.includes('authors/')) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Пропускаем папку authors
          if (item === 'authors') continue;
          addExampleImages(itemPath, `${relativePath}${item}/`);
        } else if (item.match(/\.(webp|jpg|jpeg|png)$/i) && !dir.includes('previews')) {
          imagePaths.add(`/img/examples/${relativePath}${item}`);
        }
      }
    }
    addExampleImages(examplesDir);
  }
  
  // Добавляем дефолтные изображения (включая изображения рубрик)
  const defaultDir = path.join(rootDir, 'public/img/default');
  if (fs.existsSync(defaultDir)) {
    const items = fs.readdirSync(defaultDir);
    for (const item of items) {
      if (item.match(/\.(webp|jpg|jpeg|png)$/i)) {
        // Исключаем изображения авторов и рубрик
        if (item.includes('autor') || item.includes('author') || item.includes('rubric')) continue;
        imagePaths.add(`/img/default/${item}`);
      }
    }
  }
  
  return Array.from(imagePaths);
}

// Функция для очистки всех существующих превьюшек
function cleanupExistingPreviews() {
  const publicDir = path.join(rootDir, 'public');
  
  function removePreviewDirs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (item === 'previews') {
          console.log(`Removing existing preview directory: ${itemPath}`);
          fs.rmSync(itemPath, { recursive: true, force: true });
        } else {
          removePreviewDirs(itemPath);
        }
      }
    }
  }
  
  removePreviewDirs(publicDir);
}

// Функция для создания превьюшки
async function createPreview(imagePath) {
  const fullImagePath = path.join(rootDir, 'public', imagePath.replace(/^\//, ''));

  if (!fs.existsSync(fullImagePath)) {
    console.warn(`Image not found: ${fullImagePath}`);
    return;
  }

  const dir = path.dirname(fullImagePath);
  const ext = path.extname(fullImagePath);
  const name = path.basename(fullImagePath, ext);
  const previewPath = path.join(dir, 'previews', `${name}${ext}`);

  // Определяем размер превью в зависимости от типа изображения
  let previewWidth, previewHeight;
  if (imagePath.includes('/img/default/') && (name.includes('rubric') || name.includes('tag'))) {
    previewWidth = rubricPreviewWidth;
    previewHeight = rubricPreviewHeight;
    console.log(`Creating rubric preview (${previewWidth}x${previewHeight}): ${name}`);
  } else {
    previewWidth = blogPreviewWidth;
    previewHeight = blogPreviewHeight;
    console.log(`Creating blog preview (${previewWidth}x${previewHeight}): ${name}`);
  }

  // Создаем папку previews если её нет
  const previewDir = path.dirname(previewPath);
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  // Если превью уже существует — пропускаем генерацию
  if (fs.existsSync(previewPath)) {
    // console.log(`Preview already exists: ${previewPath}`);
    return;
  }
  try {
    await sharp(fullImagePath)
      .resize(previewWidth, previewHeight, { fit: 'cover' })
      .toFile(previewPath);
    console.log(`Preview created: ${previewPath}`);
  } catch (error) {
    console.error(`Error processing ${fullImagePath}:`, error.message);
  }
}

// Основная функция
async function generatePreviews() {
  // Очистка превью только если явно указано (например, через переменную)
  const CLEAN_PREVIEWS = process.env.CLEAN_PREVIEWS === '1';
  if (CLEAN_PREVIEWS) {
    console.log('Cleaning up existing previews...');
    cleanupExistingPreviews();
  }

  console.log('Scanning content for images...');
  const imagePaths = extractImagePaths();

  console.log(`Found ${imagePaths.length} images to process`);

  for (const imagePath of imagePaths) {
    await createPreview(imagePath);
  }

  console.log('Preview generation completed!');
}

generatePreviews().catch(console.error);
