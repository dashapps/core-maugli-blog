import { registerSW } from 'virtual:pwa-register';

// Регистрируем Service Worker для PWA
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Показываем уведомление о доступном обновлении
      console.log('PWA update available');
    },
    onOfflineReady() {
      // Приложение готово к работе офлайн
      console.log('PWA ready to work offline');
    },
  });
}
