import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { slugify } from './src/utils/common-utils';

// 1) Создаём схему для «даты или сейчас»
const dateOrNow = z
  .coerce.date()    // пытаемся сконвертировать в Date
  .optional()       // допускаем отсутствие поля
  .transform((d) => d ?? new Date()); // если нет — возвращаем новую (сейчас)

// SEO-схема без изменений
const seoSchema = z.object({
  title:       z.string().min(5).max(120).optional(),
  description: z.string().min(15).max(160).optional(),
  keywords:    z.array(z.string()).default([]),
  image: z
    .object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      sizes: z.string().optional(),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
    })
    .optional(),
  pageType: z.enum(['website', 'article']).default('website'),
});


// 3) Коллекция blog
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: z.object({
    title:       z.string(),
    excerpt:     z.string().optional(),
    publishDate: dateOrNow,
    updatedDate: dateOrNow,
    isFeatured:  z.boolean().default(false),
    tags:        z.array(z.string()).default([]),
    seo:         seoSchema.optional(),
    image: z.object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      sizes: z.string().optional(),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
      isCover: z.boolean().optional(),
    }).optional(),
    articleSection: z.string().optional(),
    inLanguage: z.string().optional(),
    canonicalUrl: z.string().optional(),
    author: z.string().optional(),
    publisher: z.string().optional(),
    generativeEngineOptimization: z.object({
      generated: z.object({
        summary: z.string(),
        highlights: z.array(z.string()),
        faq: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
      }).optional(),
    }).optional(),
    jsonld: z.record(z.string(), z.any()).optional(), // <-- для гибкого JSON-LD
    productID: z.string().optional(), // Уникальный идентификатор продукта (опционально)
    productLink: z.string().url().or(z.string()).optional(), // <-- добавлено поле для ссылки на продукт
    isExample: z.boolean().optional(), // Example/demo content flag
    farmBlogId: z.string().optional(), // Farm integration: blog/article ID
  }),
});



// остальные коллекции без изменений
const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    seo: seoSchema.optional(),
    image: z.object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      sizes: z.string().optional(),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
    }).optional(),
    pageType: z.enum(['website', 'article']).default('website'),
    jsonld: z.record(z.string(), z.any()).optional(),
    route: z.string().optional(), // <-- добавлено поле для связи с маршрутом страницы
  })
});

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: dateOrNow,
    updatedDate: dateOrNow,
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    seo: seoSchema.optional(),
    image: z.object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      sizes: z.string().optional(),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
      isCover: z.boolean().optional(),
    }).optional(),
    client: z.string().optional(), // Клиент
    author: z.string().optional(),
    publisher: z.string().optional(),
    productID: z.string().optional(), // Уникальный идентификатор продукта (опционально)
    productLink: z.string().url().or(z.string()).optional(), // <-- добавлено поле для ссылки на продукт
    generativeEngineOptimization: z.object({
      generated: z.object({
        summary: z.string(),
        highlights: z.array(z.string()),
        faq: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
      }).optional(),
    }).optional(),
    jsonld: z.record(z.string(), z.any()).optional(),
    isExample: z.boolean().optional(), // Example/demo content flag
    farmProjectId: z.string().optional(), // Farm integration: project/case ID
  }),
});

const products = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/products',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: dateOrNow,
    updatedDate: dateOrNow,
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    seo: seoSchema.optional(),
    productID: z.string(), // id обязательный
    productLink: z.string().optional(), // productLink теперь просто строка и опционально
    image: z.object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      sizes: z.string().optional(),
      type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
      isCover: z.boolean().optional(),
    }).optional(),
    client: z.string().optional(),
    author: z.string().optional(),
    publisher: z.string().optional(),
    generativeEngineOptimization: z.object({
      generated: z.object({
        summary: z.string(),
        highlights: z.array(z.string()),
        faq: z.array(z.object({
          question: z.string(),
          answer: z.string(),
        })),
      }).optional(),
    }).optional(),
    jsonld: z.record(z.string(), z.any()).optional(),
    isExample: z.boolean().optional(), // Example/demo content flag
    farmProductId: z.string().optional(), // Farm integration: product ID
  }),
});

// Коллекция авторов
const authors = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/authors',
  }),
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
      image: z.object({
        src: z.string(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        sizes: z.string().optional(),
        type: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
      }).optional(),
    }).optional(),
    jsonld: z.record(z.string(), z.any()).optional(),
    isExample: z.boolean().optional(), // Example/demo content flag
    farmAuthorId: z.string().optional(), // Farm integration: author ID
  })
});

const tags = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/tags',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.object({
      src: z.string(),
      alt: z.string().optional(),
    }).optional(),
    isRubric: z.boolean().default(false),
    quote: z.string().optional(),
    lang: z.string().optional(),
    isFeatured: z.boolean().default(false),
    jsonld: z.record(z.string(), z.any()).optional(),
    isExample: z.boolean().optional(), // Example/demo content flag
    farmRubricId: z.string().optional(), // Farm integration: rubric ID
  }).transform((data) => ({
    ...data,
    slug: slugify(data.title), // slug генерируется автоматически из title
    isFeatured: data.isFeatured ?? false // isFeatured по умолчанию false
  })),
});

export const collections = { blog, pages, projects, products, authors, tags };
