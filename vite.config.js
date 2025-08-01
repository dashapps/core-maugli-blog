import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaOptions } from './astro.config.mjs';

export default defineConfig({
  plugins: [
    imagetools(),
    VitePWA(pwaOptions)
  ]
});