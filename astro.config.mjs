import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import remarkSlug from 'remark-slug';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import imageResize from './astro-image-resize.mjs';
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
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                limitInputPixels: false,
                // Aggressive optimization for better performance
                jpeg: { quality: 75, progressive: true },
                webp: { quality: 75, effort: 6 },
                avif: { quality: 65, effort: 6 },
                png: { quality: 75, compressionLevel: 9 },
            }
        }
    },
    integrations: [
        mdx(),
        sitemap(),
        imageResize()
    ],
    vite: {
        plugins: [
            tailwindcss(),
            imagetools({
                // Aggressive image optimization
                defaultDirectives: () => {
                    return new URLSearchParams({
                        format: 'webp',
                        quality: '75',
                        progressive: 'true',
                        // Enable compression
                        effort: '6'
                    });
                },
                // Additional formats for fallback
                formats: ['webp', 'avif'],
                // Disable for development to speed up build
                disabled: process.env.NODE_ENV === 'development'
            }),
            VitePWA(pwaOptions)
        ],
        build: {
            cssCodeSplit: true,
            minify: 'esbuild',
            target: 'es2020',
            rollupOptions: {
                output: {
                    // Separate CSS chunks for better caching
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                            return 'assets/css/[name].[hash][extname]';
                        }
                        if (assetInfo.name && /\.(png|jpe?g|svg|gif|webp|avif)$/.test(assetInfo.name)) {
                            return 'assets/img/[name].[hash][extname]';
                        }
                        return 'assets/[name].[hash][extname]';
                    },
                    chunkFileNames: 'assets/js/[name].[hash].js',
                    manualChunks: {
                        // Split vendor code for better caching - removed astro from manual chunks
                    }
                },
                // Remove problematic external configuration
            },
            // Additional optimization settings
            reportCompressedSize: false, // Faster build
            chunkSizeWarningLimit: 1000
        },
        css: {
            // Optimize CSS processing
            preprocessorOptions: {
                scss: {
                    // Additional SCSS options if needed
                }
            }
        },
        optimizeDeps: {
            // Improve dev performance - astro should not be excluded
        }
    },
    markdown: {
        remarkPlugins: [
            [remarkSlug, { slug: customSlugify }]
        ]
    }
});
