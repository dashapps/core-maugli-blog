import { getCollection } from 'astro:content';

/**
 * Получает featured посты для отображения на главной странице
 */
export async function getFeaturedPosts() {
  try {
    const allPosts = await getCollection('blog');
    return allPosts
      .filter(post => post.data.isFeatured)
      .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
      .slice(0, 3); // Максимум 3 featured поста
  } catch (error) {
    console.error('Ошибка при получении featured постов:', error);
    return [];
  }
}

/**
 * Получает все посты (не featured) для отображения в блоге
 */
export async function getAllPosts() {
  try {
    const allPosts = await getCollection('blog');
    return allPosts
      .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
  } catch (error) {
    console.error('Ошибка при получении постов:', error);
    return [];
  }
}

/**
 * Получает только обычные посты (не featured)
 */
export async function getRegularPosts() {
  try {
    const allPosts = await getCollection('blog');
    return allPosts
      .filter(post => !post.data.isFeatured)
      .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
  } catch (error) {
    console.error('Ошибка при получении обычных постов:', error);
    return [];
  }
}
