/**
 * Вычисляет время чтения статьи на основе количества слов
 * @param content - HTML или markdown контент
 * @returns время чтения в формате "X мин"
 */
export function calculateReadingTime(content: string): string {
    // Убираем HTML теги и markdown разметку
    const plainText = content
        .replace(/<[^>]*>/g, '') // убираем HTML теги
        .replace(/#{1,6}\s+/g, '') // убираем markdown заголовки
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // убираем markdown жирный/курсив
        .replace(/`([^`]+)`/g, '$1') // убираем код в бэктиках
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // убираем markdown ссылки
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // убираем markdown изображения
        .trim();
    
    // Считаем слова (разделяем по пробелам и фильтруем пустые)
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Средняя скорость чтения на русском языке: 200-250 слов в минуту
    // Используем 220 слов в минуту как среднее значение
    const wordsPerMinute = 220;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    // Минимум 1 минута
    return `${Math.max(1, minutes)} `;
}
