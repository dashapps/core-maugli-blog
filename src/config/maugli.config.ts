// MAUGLI_CONFIG_VERSION — config version for CLI/automation compatibility
export const MAUGLI_CONFIG_VERSION = '0.5';
// Main configuration interface for the Maugli project
export interface MaugliConfig {
  // Show example/demo content (for CLI/empty blog setup)
  showExamples?: boolean;
  // Default author ID (used if no author is specified)
  defaultAuthorId?: string;
  // Show authors without articles (default: true)
  showAuthorsWithoutArticles?: boolean;
  // Config version for CLI/automation compatibility
  configVersion?: string;
  // Automation settings for integration with Maugli farm (not used on frontend)
  automation?: {
    farmName?: string;           // Name of the farm/channel for integration
    farmChannelId?: string;      // Blog/channel ID for Maugli farm integration
    farmAuthorIds?: string[];    // Array of farm author IDs for API
    farmRubricIds?: string[];    // Array of farm rubric IDs for API
    farmProductIds?: string[];   // Array of farm product IDs for API
    farmProjectIds?: string[];   // Array of farm project/case IDs for API
    forceUpdate?: boolean;       // Force updates without Y/n prompts (default: false)
  };
  // Repository settings for deployment
  repository?: {
    url?: string; // User's repository URL for Netlify deployment button
    netlifyEnabled?: boolean; // Enable Netlify deployment button (default: true)
  };
  // Netlify deployment configuration
  netlify?: {
    autoUpdate?: boolean; // Enable auto-update on Netlify (default: true)
    plugins?: string[]; // Netlify plugins to install
    buildCommand?: string; // Custom build command for Netlify
    publishDir?: string; // Publish directory (default: "dist")
    environment?: Record<string, string>; // Environment variables for Netlify
    redirects?: Array<{
      from: string;
      to: string;
      status?: number;
      force?: boolean;
    }>; // Custom redirects
    headers?: Array<{
      for: string;
      values: Record<string, string>;
    }>; // Custom headers
  };
  // Brand and logo settings
  brand: {
    name: string; // Brand name
    description: string; // Brand description
    logoLight: string; // Logo for navigation (light theme). Used for dark theme if logoDark is not specified.
    logoDark?: string; // Logo for navigation (dark theme). If not specified, logoLight is used.
    logoHref?: string; // Logo link (main site). If not specified, links to blog index.
    logoBreadcrumbsLight: string; // Logo for breadcrumbs (light theme). Used for dark theme if logoBreadcrumbsDark is not specified.
    logoBreadcrumbsDark?: string; // Logo for breadcrumbs (dark theme). If not specified, logoBreadcrumbsLight is used.
  };
  // SEO and Open Graph settings
  seo: {
    titleSuffix: string; // Suffix for page titles
    defaultImage: string; // Default image for SEO
    author: string; // Default author (getter)
    jsonld?: Record<string, any>; // JSON-LD structured data
  };
  // Default images for various entities
  defaultBlogImage: string; // Default blog image
  defaultProductImage: string; // Default product image
  defaultProjectImage: string; // Default project/case image
  defaultAuthorImage: string; // Default author image
  defaultRubricImage: string; // Default rubric/category image
  // Feature toggles
  features: {
    enableSubscribe: boolean; // Enable subscribe block
    enableMultiLang: boolean; // Enable multilingual support
    enableFAQ: boolean; // Enable FAQ block
    enableRSS: boolean; // Enable RSS feed
  };
  // Progressive Web App settings
  pwa?: {
    themeColor?: string; // Theme color for the PWA manifest
    backgroundColor?: string; // Background color for the PWA manifest
    icons?: Array<{ src: string; sizes: string; type: string; purpose?: string }>; // Icons for the PWA manifest
  };
  // Control display of tags/rubrics
  // Theme switcher
  enableThemeSwitcher?: boolean; // Enable theme switcher (true by default)
  defaultTheme?: 'light' | 'dark' | 'auto'; // Default theme (light, dark, or auto based on system preference)
  // Social and contact links (displayed in the footer)
  links?: Record<string, string>; // Social/contact links for footer
  navLinks?: Array<{ key: string; label: string; href: string }>; // Navigation links
  // Language and copyright
  defaultLang?: string; // Default language code
  copyright?: string; // Copyright string
  // Page titles for different sections
  pageTitles?: Record<string, string>; // Custom page titles
  // Subscribe block settings
  subscribe?: {
    enabled?: boolean; // Enable subscribe block
    heading?: string; // Subscribe heading
    mutedText?: string; // Subscribe muted text
    formUrl?: string; // Subscribe form URL
  };
  // Author and language switcher
  showAuthorArticleCount?: boolean; // Show article count for author
  showLangSwitcher?: boolean; // Show language switcher
  // Control display of tags/rubrics
  showOnlyRubricsTags?: boolean; // true — show only rubrics, false — show all tags
  langLinks?: Record<string, string>; // External links for each language
  authorsDescription?: string; // Authors block description (override localization)
  // Template and security
  isProTemplate?: boolean; // Is this a pro template
  secretKey?: string; // Secret key for pro features
  // Home page title override
  indexTitle?: string; // Custom title for index page
}
// Main exported configuration object for the Maugli project
export const maugliConfig: MaugliConfig = {
  configVersion: MAUGLI_CONFIG_VERSION, // Config version for CLI/automation compatibility (0.4)
  showExamples: true, // Show example/demo content (set false to hide all demo content)
  brand: {
    name: 'Maugli', // Brand name
    description: 'Content farm for smart automation', // Brand description
    logoLight: '/logoblog-icon.svg', // Logo for navigation (light theme). Used for dark theme if logoDark is not specified.
    // Logo for navigation (dark theme). If not specified, logoLight is used.
    logoDark: undefined,
    // Logo link (main site). If not specified, links to blog index.
    logoHref: 'https://maugli.cfd',
    logoBreadcrumbsLight: '/logo-icon.svg', // Logo for breadcrumbs (light theme). Used for dark theme if logoBreadcrumbsDark is not specified.
    // Logo for breadcrumbs (dark theme). If not specified, logoBreadcrumbsLight is used.
    logoBreadcrumbsDark: undefined,
  },
  // Automation block for Maugli farm integration (not used on frontend)
  automation: {
    farmName: '',         // Name of the farm/channel for integration
    farmChannelId: '',    // Blog/channel ID for Maugli farm integration
    farmAuthorIds: [],    // Array of farm author IDs for API
    farmRubricIds: [],    // Array of farm rubric IDs for API
    farmProductIds: [],   // Array of farm product IDs for API
    farmProjectIds: [],   // Array of farm project/case IDs for API
    forceUpdate: true,    // Force updates without Y/n prompts (default: true for stable deployment)
  },
  // Repository settings for deployment
  repository: {
    url: 'https://github.com/dashapps/core-maugli-blog', // User's repository URL for Netlify deployment button
    netlifyEnabled: true, // Enable Netlify deployment button (default: true)
  },
  // Netlify deployment configuration
  netlify: {
    autoUpdate: true, // Enable auto-update on Netlify (default: true)
    plugins: [
      '@netlify/plugin-lighthouse',     // Lighthouse performance audits
      'netlify-plugin-submit-sitemap',  // Auto-submit sitemap to search engines
      'netlify-plugin-checklinks',      // Check for broken links
      'netlify-plugin-image-optim',     // Image optimization
      'netlify-plugin-minify-html',     // HTML minification
      'netlify-plugin-inline-critical-css', // Inline critical CSS
      'netlify-plugin-hashfiles',       // Cache optimization with file hashing
      'netlify-plugin-bluesky-custom-domain', // Bluesky custom domain verification
      'netlify-plugin-supabase'         // Supabase integration
    ], // Recommended Netlify plugins from UI
    buildCommand: 'npm run build', // Default build command
    publishDir: 'dist', // Astro output directory
    environment: {
      NODE_VERSION: '18',
      NPM_FLAGS: '--legacy-peer-deps'
    }, // Default environment variables
    redirects: [
      {
        from: '/blog/feed.xml',
        to: '/rss.xml',
        status: 301
      }
    ], // Common redirects
    headers: [
      {
        for: '/*',
        values: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      },
      {
        for: '/img/*',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      {
        for: '/*.webp',
        values: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    ] // Security and performance headers
  },
  enableThemeSwitcher: true, // Enable theme switcher (true by default)
  defaultTheme: 'dark', // Default theme (dark by default)
  seo: {
    titleSuffix: ' — Maugli', // Suffix for page titles
    defaultImage: '/default-image.webp', // Default image for SEO
    get author() { return maugliConfig.defaultAuthorId || 'ИlyichAI'; }, // Default author (getter)
    jsonld: {
      organization: {
        name: 'Maugli AI Content Farm',
        url: 'https://maugli.cfd/',
        logo: 'https://maugli.cfd/images/logo.svg',
        sameAs: [
          'https://www.linkedin.com/company/maugli',
          'https://twitter.com/maugli_ai',
          'https://t.me/maugli_channel'
        ],
        contact: {
          email: 'info@maugli.cfd',
          contactType: 'customer support'
        }
      },
      website: {
        name: 'Maugli Content Farm',
        url: 'https://maugli.cfd/',
        searchTemplate: 'https://maugli.cfd/search?q={search_term_string}'
      },
      articleDefaults: {
        publisher: 'Maugli Content Farm',
        author: 'Maugli Editorial Team',
        image: 'https://maugli.cfd/images/default-article.jpg',
        language: 'maugliConfig.defaultLang'
      },
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Maugli',
        url: 'https://maugli.cfd',
        logo: 'https://maugli.cfd/logoblog-icon.svg',
        founder: 'Daria Zorina'
      }
    }
  },
  defaultBlogImage: '/img/default/blog_default.webp', // Default blog image
  defaultProductImage: '/img/default/product_default.webp', // Default product image
  defaultProjectImage: '/img/default/project_default.webp', // Default project/case image
  defaultAuthorImage: '/img/default/autor_default.webp', // Default author image
  defaultRubricImage: '/img/default/rubric_default.webp', // Default rubric/category image
  features: {
    enableSubscribe: true, // Enable subscribe block
    enableMultiLang: false, // Enable multilingual support
    enableFAQ: true, // Enable FAQ block
    enableRSS: true, // Enable RSS feed
  },
  pwa: {
    themeColor: '#0cbf11', // Theme color for the PWA manifest
    backgroundColor: '#ffffff', // Background color for the PWA manifest
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  showOnlyRubricsTags: true, // Show only rubrics by default

  links: {
    products: '/products', // Products page
    about: '/about', // About page
    email: 'mailto:info@maugli.cfd', // Contact email
    telegram: 'https://t.me/mauglibot', // Telegram link
    mastodon: '', // Mastodon link
    medium: 'https://medium.com/@maugli', // Medium link
    bluesky: '', // Bluesky link
    reddit: '', // Reddit link
    linkedin: 'https://linkedin.com/company/maugli', // LinkedIn link
    twitter: 'https://twitter.com/mauglibot', // Twitter link
  }, // Contacts displayed in the footer
  navLinks: [
    { key: 'blog', label: '', href: '/' }, // Blog main page
    { key: 'products', label: '', href: '/products' }, // Products page
    { key: 'projects', label: '', href: '/projects' }, // Projects page
    { key: 'authors', label: '', href: '/authors' }, // Authors page
    { key: 'tags', label: '', href: '/tags' }, // Tags page
  ],
  defaultLang: 'en', // Default language code
  copyright: '© Maugli, 2025. All rights reserved.', // Copyright string
  pageTitles: {
    home: 'https://maugli.cfd', // Home page title
    products: '', // Products page title
    authors: '', // Authors page title
    tags: '' // Tags page title
  },
  subscribe: {
    enabled: false, // Enable subscribe block
    heading: '', // Subscribe heading
    mutedText: '', // Subscribe muted text
    formUrl: 'https://your-form-url.com' // Subscribe form URL
  },
  defaultAuthorId: 'default-autor', // Default author id (used if no author is specified). Use the filename of the author .md file without the .md extension
  showAuthorsWithoutArticles: true, // Show authors without articles (default: true)
  showAuthorArticleCount: true, // Show article count for author
  showLangSwitcher: false, // Show language switcher
  langLinks: {
    ru: 'https://maugli.cfd/ru', // Russian version
    en: 'https://maugli.cfd/en', // English version
    es: 'https://maugli.cfd/es', // Spanish version
    de: 'https://maugli.cfd/de', // German version
    pt: 'https://google.com', // Portuguese version
    fr: 'https://google.com', // French version
    zh: 'https://google.com', // Chinese version
    ja: 'https://google.com', // Japanese version
  },
  authorsDescription: '', // Authors block description (override localization)
  indexTitle: 'Maugli Blog', // Custom title for index page
  isProTemplate: false, // Is this a pro template
  secretKey: '0000-0000-0000-0000-0000', // Secret key for pro features
};
