// demo-theme-configs.js - демонстрация различных настроек темы

const themeConfigs = {
    // Тёмная тема по умолчанию (текущая настройка)
    dark: {
        defaultTheme: 'dark',
        description: 'Тёмная тема применяется при первом посещении сайта'
    },
    
    // Светлая тема по умолчанию
    light: {
        defaultTheme: 'light', 
        description: 'Светлая тема применяется при первом посещении сайта'
    },
    
    // Автоматический выбор темы
    auto: {
        defaultTheme: 'auto',
        description: 'Тема выбирается автоматически на основе системных настроек пользователя'
    }
};

console.log('🎨 Доступные конфигурации темы:');
Object.entries(themeConfigs).forEach(([key, config]) => {
    console.log(`\n${key.toUpperCase()}:`);
    console.log(`  defaultTheme: '${config.defaultTheme}'`);
    console.log(`  📝 ${config.description}`);
});

console.log('\n📋 Как изменить настройку:');
console.log('1. Откройте src/config/maugli.config.ts');
console.log('2. Найдите строку: defaultTheme: "dark"');
console.log('3. Измените на нужное значение: "light", "dark" или "auto"');
console.log('4. Save the file and restart the dev server');

export { themeConfigs };
