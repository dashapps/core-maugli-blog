import { defineCollection, z } from 'astro:content';

// Add farmChannelId to all collections for automation
// This field is for internal automation and not used on frontend
const authorsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        position: z.string(),
        description: z.string(),
        avatar: z.string().optional(),
        socials: z.object({
            email: z.string().optional(),
            telegram: z.string().optional(),
            mastodon: z.string().optional(),
            medium: z.string().optional(),
            bluesky: z.string().optional(),
            reddit: z.string().optional(),
            linkedin: z.string().optional(),
            twitter: z.string().optional(),
        }).optional(),
        seo: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            keywords: z.array(z.string()).optional(),
        }).optional(),
        farmAuthorId: z.string().optional(), // For farm integration (not used on frontend)
    })
});

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        excerpt: z.string().optional(),
        publishDate: z.date(),
        isFeatured: z.boolean().default(false),
        author: z.string().optional(), // Author ID from authors collection
        tags: z.array(z.string()).optional(),
        products: z.array(z.string()).optional(), // Product IDs related to the post
        seo: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            image: z.object({
                src: z.string(),
                alt: z.string(),
            }).optional(),
        }).optional(),
        farmRubricId: z.string().optional(), // For farm integration (not used on frontend)
    })
});

const projectsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        publishDate: z.date().optional(),
        tags: z.array(z.string()).optional(),
        products: z.array(z.string()).optional(), // Product IDs related to the project
        seo: z.object({
            image: z.object({
                src: z.string(),
                alt: z.string(),
                width: z.string().optional(),
                height: z.string().optional(),
            }).optional(),
        }).optional(),
        generativeEngineOptimization: z.any().optional(),
        farmProductId: z.string().optional(), // For farm integration (not used on frontend)
        farmProjectId: z.string().optional(), // For farm integration (not used on frontend)
    })
});

export const collections = {
    authors: authorsCollection,
    blog: blogCollection,
    projects: projectsCollection,
};
