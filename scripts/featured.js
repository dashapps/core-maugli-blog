#!/usr/bin/env node

/**
 * Скрипт для управления featured постами
 * Использование:
 * npm run featured:add post-slug
 * npm run featured:remove post-slug
 * npm run featured:list
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_CONTENT_DIR = path.join(__dirname, '../src/content/blog');
const MAX_FEATURED = 3;

const [,, command, postId] = process.argv;

/**
 * Получает все посты из директории
 */
async function getAllPosts() {
  try {
    const files = await fs.readdir(BLOG_CONTENT_DIR);
    const posts = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(BLOG_CONTENT_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const isFeatured = frontmatter.includes('isFeatured: true');
          const titleMatch = frontmatter.match(/title:\s*['"]?(.*?)['"]?\s*$/m);
          const dateMatch = frontmatter.match(/publishDate:\s*['"]?(.*?)['"]?\s*$/m);
          
          posts.push({
            id: file.replace('.md', ''),
            title: titleMatch ? titleMatch[1] : 'Без названия',
            publishDate: dateMatch ? new Date(dateMatch[1]) : new Date(),
            isFeatured,
            filePath
          });
        }
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Ошибка при чтении постов:', error);
    return [];
  }
}

/**
 * Изменяет статус isFeatured в frontmatter файла
 */
async function setFeaturedStatus(postId, isFeatured) {
  const filePath = path.join(BLOG_CONTENT_DIR, `${postId}.md`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Разделяем на frontmatter и содержимое
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error(`Не найден frontmatter в файле: ${filePath}`);
    }

    let [, frontmatter, body] = frontmatterMatch;
    
    // Обновляем или добавляем isFeatured
    if (frontmatter.includes('isFeatured:')) {
      // Заменяем существующее значение
      frontmatter = frontmatter.replace(
        /isFeatured:\s*(true|false)/,
        `isFeatured: ${isFeatured}`
      );
    } else {
      // Добавляем новое поле после title (если есть)
      if (frontmatter.includes('title:')) {
        frontmatter = frontmatter.replace(
          /(title:.*\n)/,
          `$1isFeatured: ${isFeatured}\n`
        );
      } else {
        // Добавляем в конец frontmatter
        frontmatter = `${frontmatter.trim()}\nisFeatured: ${isFeatured}`;
      }
    }

    // Записываем обновленный файл
    const updatedContent = `---\n${frontmatter}\n---\n${body}`;
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
  } catch (error) {
    console.error(`Ошибка при обновлении файла ${filePath}:`, error);
  }
}

/**
 * Добавляет статью в featured и управляет лимитом
 */
async function addFeatured(newPostId) {
  try {
    const allPosts = await getAllPosts();
    
    // Находим текущие featured посты, отсортированные по дате (старые первые)
    const currentFeatured = allPosts
      .filter(post => post.isFeatured)
      .sort((a, b) => a.publishDate.getTime() - b.publishDate.getTime());

    // Если уже есть MAX_FEATURED featured постов, удаляем самый старый
    if (currentFeatured.length >= MAX_FEATURED) {
      const oldestFeatured = currentFeatured[0];
      await setFeaturedStatus(oldestFeatured.id, false);
      console.log(`🗑️ Убрали из featured самый старый пост: ${oldestFeatured.id}`);
    }

    // Добавляем новый пост в featured
    await setFeaturedStatus(newPostId, true);
    console.log(`⭐ Добавили в featured: ${newPostId}`);
    
    // Выводим текущий список featured постов
    await logCurrentFeatured();
    
  } catch (error) {
    console.error('Ошибка при управлении featured постами:', error);
  }
}

/**
 * Убирает статью из featured
 */
async function removeFeatured(postId) {
  await setFeaturedStatus(postId, false);
}

/**
 * Выводит текущий список featured постов
 */
async function logCurrentFeatured() {
  try {
    const allPosts = await getAllPosts();
    const featured = allPosts
      .filter(post => post.isFeatured)
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

    console.log('\n📌 Текущие featured посты:');
    featured.forEach((post, index) => {
      console.log(`${index + 1}. ${post.id} (${post.publishDate.toLocaleDateString()})`);
    });
    console.log(`📊 Всего featured: ${featured.length}/${MAX_FEATURED}\n`);
    
  } catch (error) {
    console.error('Ошибка при получении featured постов:', error);
  }
}

async function main() {
  switch (command) {
    case 'add':
      if (!postId) {
        console.error('❌ Укажите ID поста: npm run featured:add post-id');
        process.exit(1);
      }
      await addFeatured(postId);
      break;

    case 'remove':
      if (!postId) {
        console.error('❌ Укажите ID поста: npm run featured:remove post-id');
        process.exit(1);
      }
      await removeFeatured(postId);
      console.log(`🗑️ Убрали из featured: ${postId}`);
      await logCurrentFeatured();
      break;

    case 'list':
      await logCurrentFeatured();
      break;

    default:
      console.log(`
📌 Управление featured постами

Команды:
  add <post-id>    - Добавить пост в featured (макс. 3)
  remove <post-id> - Убрать пост из featured
  list            - Показать текущие featured посты

Примеры:
  npm run featured:add post-1-avtomatizaciya-marketinga-kak-ii-osvobozhdaet-predprinimatelei-ot-cifrovogo-rabstva
  npm run featured:remove post-2-avtomatizaciya-kontenta-kak-neiroseti-ubivayut-perfekcionizm-v-biznese
  npm run featured:list
      `);
  }
}

main().catch(console.error);
