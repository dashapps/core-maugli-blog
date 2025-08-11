import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

/**
 * Универсальный менеджер featured-элементов для коллекций: blog, products, projects
 */
export class FeaturedManager {
  private static readonly MAX_FEATURED = 3;
  private static readonly CONTENT_DIRS = {
    blog: './src/content/blog',
    products: './src/content/products',
    projects: './src/content/projects',
  };

  /**
   * Добавляет элемент в featured и управляет лимитом
   */
  static async addFeatured(collection: 'blog' | 'products' | 'projects', newId: string): Promise<void> {
    try {
      // Получаем все элементы коллекции
      const allItems = await getCollection(collection);
      // Находим текущие featured, сортируем по дате (старые первые)
      const currentFeatured = allItems
        .filter(item => item.data.isFeatured)
        .sort((a, b) => a.data.publishDate.getTime() - b.data.publishDate.getTime());
      // Если уже есть MAX_FEATURED, удаляем самый старый
      if (currentFeatured.length >= this.MAX_FEATURED) {
        const oldestFeatured = currentFeatured[0];
        await this.removeFeatured(collection, oldestFeatured.id);
        console.log(`🗑️ Убрали из featured самый старый: ${oldestFeatured.id}`);
      }
      // Добавляем новый элемент в featured
      await this.setFeaturedStatus(collection, newId, true);
      console.log(`⭐ Добавили в featured: ${newId}`);
      // Выводим текущий список featured
      await this.logCurrentFeatured(collection);
    } catch (error) {
      console.error('Ошибка при управлении featured:', error);
    }
  }

  /**
   * Убирает элемент из featured
   */
  static async removeFeatured(collection: 'blog' | 'products' | 'projects', id: string): Promise<void> {
    await this.setFeaturedStatus(collection, id, false);
  }

  /**
   * Изменяет статус isFeatured в frontmatter файла
   */
  private static async setFeaturedStatus(collection: 'blog' | 'products' | 'projects', id: string, isFeatured: boolean): Promise<void> {
    const dir = this.CONTENT_DIRS[collection];
    const filePath = path.join(dir, `${id}.md`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) {
        throw new Error(`Не найден frontmatter в файле: ${filePath}`);
      }
      let [, frontmatter, body] = frontmatterMatch;
      if (frontmatter.includes('isFeatured:')) {
        frontmatter = frontmatter.replace(
          /isFeatured:\s*(true|false)/,
          `isFeatured: ${isFeatured}`
        );
      } else {
        if (frontmatter.includes('title:')) {
          frontmatter = frontmatter.replace(
            /(title:.*\n)/,
            `$1isFeatured: ${isFeatured}\n`
          );
        } else {
          frontmatter = `${frontmatter.trim()}\nisFeatured: ${isFeatured}`;
        }
      }
      const updatedContent = `---\n${frontmatter}\n---\n${body}`;
      await fs.writeFile(filePath, updatedContent, 'utf-8');
    } catch (error) {
      console.error(`Ошибка при обновлении файла ${filePath}:`, error);
    }
  }

  /**
   * Выводит текущий список featured элементов
   */
  static async logCurrentFeatured(collection: 'blog' | 'products' | 'projects'): Promise<void> {
    try {
      const allItems = await getCollection(collection);
      const featured = allItems
        .filter(item => item.data.isFeatured)
        .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
      console.log(`\n📌 Текущие featured (${collection}):`);
      featured.forEach((item, index) => {
        console.log(`${index + 1}. ${item.id} (${item.data.publishDate.toLocaleDateString()})`);
      });
      console.log(`📊 Всего featured: ${featured.length}/${this.MAX_FEATURED}\n`);
    } catch (error) {
      console.error('Ошибка при получении featured:', error);
    }
  }

  /**
   * Получает все featured элементы для отображения
   */
  static async getFeaturedItems(collection: 'blog' | 'products' | 'projects') {
    try {
      const allItems = await getCollection(collection);
      return allItems
        .filter(item => item.data.isFeatured)
        .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
    } catch (error) {
      console.error('Ошибка при получении featured:', error);
      return [];
    }
  }
}
