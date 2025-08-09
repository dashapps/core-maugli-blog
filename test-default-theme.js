// test-default-theme.js - тест настроек темы по умолчанию
const testTheme = () => {
    console.log('🧪 Тестируем настройки темы по умолчанию...');
    
    // Check that nothing is saved in localStorage
    localStorage.removeItem('theme');
    console.log('🔄 Очистили localStorage');
    
    // Перезагружаем страницу, чтобы проверить значение по умолчанию
    setTimeout(() => {
        const isDark = document.documentElement.classList.contains('dark');
        const savedTheme = localStorage.getItem('theme');
        
        console.log('📊 Результаты теста:');
        console.log(`  - Тёмная тема активна: ${isDark}`);
        console.log(`  - Сохранённая тема: ${savedTheme}`);
        console.log(`  - Ожидаемый результат: тёмная тема по умолчанию`);
        
        if (isDark && savedTheme === 'dark') {
            console.log('✅ Тест пройден! Тёмная тема применяется по умолчанию');
        } else {
            console.log('❌ Тест не пройден');
        }
    }, 100);
};

// Запускаем тест при загрузке страницы
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', testTheme);
} else {
    console.log('Этот скрипт должен выполняться в браузере');
}
