// astro-image-resize.mjs - Astro integration for image processing and previews
import { execSync } from 'child_process';

export default function imageResize() {
  return {
    name: 'image-resize',
    hooks: {
      'astro:build:start': () => {
        console.log('🖼️  Starting image processing for build...');
        try {
          execSync('node scripts/resize-for-build.cjs', { stdio: 'inherit' });
        } catch (error) {
          console.error('❌ Error during image resizing:', error.message);
        }
        
        console.log('🎭 Starting preview generation for build...');
        try {
          execSync('BUILD_MODE=1 node scripts/generate-previews.js', { stdio: 'inherit' });
        } catch (error) {
          console.error('❌ Error during preview generation:', error.message);
        }
      }
    }
  };
}
