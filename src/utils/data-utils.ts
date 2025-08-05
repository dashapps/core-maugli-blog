import { type CollectionEntry } from 'astro:content';
import { maugliConfig } from '../config/maugli.config';
import { slugify } from './common-utils';

export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export function sortItemsWithFeaturedFirst(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    // Сначала сортируем по featured (featured посты идут первыми)
    if (itemA.data.isFeatured && !itemB.data.isFeatured) {
        return -1; // A идет первым
    }
    if (!itemA.data.isFeatured && itemB.data.isFeatured) {
        return 1; // B идет первым
    }
    
    // Если оба featured или оба не featured, сортируем по дате
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export function getAllTags(posts: CollectionEntry<'blog'>[]) {
    const tags: string[] = [...new Set(posts.flatMap((post) => post.data.tags || []).filter(Boolean))];
    return tags
        .map((tag) => {
            return {
                name: tag,
                id: slugify(tag)
            };
        })
        .filter((obj, pos, arr) => {
            return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos;
        });
}

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tagId: string) {
    const filteredPosts: CollectionEntry<'blog'>[] = posts.filter((post) => (post.data.tags || []).map((tag) => slugify(tag)).includes(tagId));
    return filteredPosts;
}

// Получение автора поста с fallback на дефолтного автора из конфига

// Получение автора поста с fallback на дефолтного автора из конфига
// Если автор не найден среди авторов, возвращаем дефолтного
import fs from 'fs';
import path from 'path';

function getAuthorSlugs() {
    try {
        const authorsDir = path.join(process.cwd(), 'src/content/authors');
        return fs.readdirSync(authorsDir)
            .filter(f => f.endsWith('.md'))
            .map(f => f.replace('.md', ''));
    } catch {
        return [];
    }
}

export function getPostAuthor(post: CollectionEntry<'blog'>): string {
    const author = post.data.author || maugliConfig.defaultAuthorId || 'unknown-author';
    const authorSlugs = getAuthorSlugs();
    return authorSlugs.includes(author) ? author : (maugliConfig.defaultAuthorId || 'unknown-author');
}

// Получение постов по автору с учетом дефолтного автора
export function getPostsByAuthor(posts: CollectionEntry<'blog'>[], authorId: string) {
    return posts.filter(post => getPostAuthor(post) === authorId);
}
