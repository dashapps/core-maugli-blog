import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Список системных файлов PWA, которые не должны обрабатываться динамическими маршрутами
  const pwaFiles = [
    '/sw.js',
    '/manifest.json',
    '/manifest.webmanifest',
    '/workbox-',
    '/service-worker.js'
  ];

  // Проверяем, является ли запрос системным файлом PWA
  if (pwaFiles.some(file => context.url.pathname.startsWith(file))) {
    // Если это системный файл, пропускаем обработку Astro и позволяем Vite/PWA плагину обработать его
    return next();
  }

  // Для всех остальных запросов продолжаем обычную обработку
  return next();
});
