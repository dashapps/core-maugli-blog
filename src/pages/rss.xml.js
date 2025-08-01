import { generateBlogRss } from '../utils/rss';

export async function GET(context) {
    return generateBlogRss(context);
}
