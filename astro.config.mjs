import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import siteConfig from './src/data/site-config';
import remarkSlug from 'remark-slug';
import customSlugify from './src/utils/remark-slugify';

export const pwaOptions = {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
        name: "Maugli Blog",
        short_name: "Maugli",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0cbf11",
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
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
        ]
    },
    markdown: {
        remarkPlugins: [
            [remarkSlug, { slug: customSlugify }]
        ]
    }
});
