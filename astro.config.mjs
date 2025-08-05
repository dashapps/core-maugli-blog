import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import remarkSlug from 'remark-slug';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import { maugliConfig } from './src/config/maugli.config';
import siteConfig from './src/data/site-config';
import customSlugify from './src/utils/remark-slugify';

export const pwaOptions = {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
        name: "Maugli Blog",
        short_name: "Maugli",
        start_url: "/",
        display: "standalone",
        background_color: maugliConfig.pwa?.backgroundColor ?? '#ffffff',
        theme_color: maugliConfig.pwa?.themeColor ?? '#0cbf11',
        icons: maugliConfig.pwa?.icons ?? [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    },
    workbox: {
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/api\//],
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg}'],
        runtimeCaching: [
            {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: {
                    cacheName: 'images-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
                    }
                }
            },
            {
                urlPattern: ({ request }) => request.destination === 'font',
                handler: 'CacheFirst',
                options: {
                    cacheName: 'fonts-cache',
                    expiration: {
                        maxEntries: 20,
                        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 год
                    }
                }
            }
        ]
    },
    devOptions: {
        enabled: true, // чтобы работал в деве
        type: 'module',
    }
};

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    integrations: [
        mdx(),
        sitemap()
    ],
    vite: {
        plugins: [
            tailwindcss(),
            imagetools(),
            VitePWA(pwaOptions)
        ],
        build: {
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    // Separate CSS chunks for better caching
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                            return 'assets/css/[name].[hash][extname]';
                        }
                        return 'assets/[name].[hash][extname]';
                    }
                }
            }
        },
        css: {
            // Optimize CSS processing
            preprocessorOptions: {
                scss: {
                    // Additional SCSS options if needed
                }
            }
        }
    },
    markdown: {
        remarkPlugins: [
            [remarkSlug, { slug: customSlugify }]
        ]
    }
});
