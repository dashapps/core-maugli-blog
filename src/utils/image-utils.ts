// src/utils/image-utils.ts - Утилиты для работы с изображениями

/**
 * Определяет правильный путь к изображению
 * Все пользовательские изображения находятся в /img/ и подпапках
 * Автоматическая оптимизация применяется ко всем изображениям в public/img/
 */
export function getImagePath(imageName: string, contentType?: 'blog' | 'author' | 'product' | 'project' | 'tag'): string {
  // Если путь уже абсолютный (начинается с /), возвращаем как есть
  if (imageName.startsWith('/')) {
    return imageName;
  }
  
  // Все изображения идут в /img/
  return `/img/${imageName}`;
}

/**
 * Получает путь к изображению для конкретного типа контента
 * Все файлы просто в /img/ без подпапок
 */
export function getContentImagePath(slug: string, contentType: 'blog' | 'author' | 'product' | 'project' | 'tag', extension: string = '.webp'): string {
  const fileName = `${contentType}_${slug}${extension}`;
  return `/img/${fileName}`;
}

/**
 * Получает путь к превью изображению
 * Все файлы просто в /img/ без подпапок
 */
export function getPreviewImagePath(slug: string, contentType: 'blog' | 'author' | 'product' | 'project' | 'tag', extension: string = '.webp'): string {
  const fileName = `previews_${contentType}_${slug}${extension}`;
  return `/img/${fileName}`;
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
 * Все изображения теперь просто в /img/ и подпапках
 */
export function convertLegacyImagePath(imagePath: string): string {
  // Убираем page-images из пути - теперь всё просто в /img/
  if (imagePath.includes('/img/page-images/')) {
    return imagePath.replace('/img/page-images/', '/img/');
  }
  
  return imagePath;
}
