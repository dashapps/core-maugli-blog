// src/utils/image-utils.ts - Утилиты для работы с изображениями

/**
 * Определяет правильный путь к изображению в зависимости от типа контента
 * Все пользовательские изображения должны находиться в /img/page-images/
 * Системные файлы остаются в /img/default/ и /img/examples/
 */
export function getImagePath(imageName: string, contentType?: 'blog' | 'author' | 'product' | 'project' | 'tag'): string {
  // Если путь уже абсолютный (начинается с /), возвращаем как есть
  if (imageName.startsWith('/')) {
    return imageName;
  }
  
  // Если это системные папки, не меняем путь
  if (imageName.startsWith('default/') || imageName.startsWith('examples/')) {
    return `/img/${imageName}`;
  }
  
  // Все остальные изображения ищем в page-images
  return `/img/page-images/${imageName}`;
}

/**
 * Получает путь к изображению для конкретного типа контента
 * Добавляет префикс типа если его нет
 */
export function getContentImagePath(slug: string, contentType: 'blog' | 'author' | 'product' | 'project' | 'tag', extension: string = '.webp'): string {
  const fileName = `${contentType}_${slug}${extension}`;
  return getImagePath(fileName);
}

/**
 * Получает путь к превью изображению
 */
export function getPreviewImagePath(slug: string, contentType: 'blog' | 'author' | 'product' | 'project' | 'tag', extension: string = '.webp'): string {
  const fileName = `previews_${contentType}_${slug}${extension}`;
  return getImagePath(fileName);
}

/**
 * Получает fallback путь для изображения в зависимости от типа контента
 */
export function getDefaultImagePath(contentType: 'blog' | 'author' | 'product' | 'project' | 'tag'): string {
  const defaultImages = {
    blog: '/img/default/blog_default.webp',
    author: '/img/default/autor_default.webp', 
    product: '/img/default/product_default.webp',
    project: '/img/default/project_default.webp',
    tag: '/img/default/rubric_default.webp'
  };
  
  return defaultImages[contentType];
}

/**
 * Конвертирует старые пути к новой структуре
 * Для обратной совместимости
 */
export function convertLegacyImagePath(imagePath: string): string {
  // Конвертируем старые пути в новые
  const conversions = [
    { from: '/img/blog/', to: '/img/page-images/' },
    { from: '/img/authors/', to: '/img/page-images/' },
    { from: '/img/products/', to: '/img/page-images/' },
    { from: '/img/projects/', to: '/img/page-images/' },
    { from: '/img/uploads/', to: '/img/page-images/' }
  ];
  
  for (const conversion of conversions) {
    if (imagePath.startsWith(conversion.from)) {
      return imagePath.replace(conversion.from, conversion.to);
    }
  }
  
  return imagePath;
}
