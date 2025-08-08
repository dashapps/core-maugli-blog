// astro-image-resize.mjs - Astro интеграция для генерации изображений
import { execSync } from 'child_process';

export default function imageResize() {
  return {
    name: 'image-resize',
    hooks: {
      'astro:build:start': () => {
        console.log('🖼️  Запуск генерации ресайзированных изображений...');
        try {
          execSync('node scripts/resize-for-build.cjs', { stdio: 'inherit' });
        } catch (error) {
          console.error('❌ Ошибка при генерации изображений:', error.message);
        }
      }
    }
  };
}
