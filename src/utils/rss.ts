import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '../data/site-config';
import { sortItemsByDateDesc } from './data-utils';

/**
 * Generate RSS feed for blog posts.
 * This helper can be used in API routes or build scripts.
 */
export async function generateBlogRss(context: { site: string }) {
    const posts = (await getCollection('blog')).sort(sortItemsByDateDesc);
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        items: posts.map((item) => ({
            title: item.data.title,
            description: item.data.excerpt,
            link: `/blog/${item.id}/`,
            pubDate: item.data.publishDate.setUTCHours(0)
        }))
    });
}
